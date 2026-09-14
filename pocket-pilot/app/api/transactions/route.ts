import { NextResponse } from "next/server";

import { hashApiToken, parseBearerToken } from "@/lib/api/tokens";
import { getCalendarDateInTimeZone } from "@/lib/finance/calendar-month";
import { logServerError } from "@/lib/observability/server-log";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchUserCategoryNames } from "@/lib/transactions/user-categories";
import { validateTransactionInput } from "@/lib/transactions/transaction-input";

const INVALID_TOKEN_MESSAGE = "Jeton invalide ou révoqué.";

function readBodyText(body: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (typeof body[key] === "string") {
      return body[key];
    }
  }

  return undefined;
}

function unauthorized() {
  return NextResponse.json({ erreur: INVALID_TOKEN_MESSAGE }, { status: 401 });
}

function readTimeZone(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) {
    return "UTC";
  }

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return value;
  } catch {
    return "UTC";
  }
}

export async function POST(request: Request) {
  let admin: ReturnType<typeof createAdminClient>;

  try {
    admin = createAdminClient();
  } catch {
    logServerError("api:transactions", new Error("service-role key missing"));
    return NextResponse.json(
      { erreur: "L’API n’est pas configurée. Réessayez plus tard." },
      { status: 500 },
    );
  }

  const token = parseBearerToken(request.headers.get("authorization"));

  if (!token) {
    return unauthorized();
  }

  const { data: tokenRow, error: tokenError } = await admin
    .from("api_tokens")
    .select("id, user_id")
    .eq("token_hash", await hashApiToken(token))
    .is("revoked_at", null)
    .maybeSingle();

  if (tokenError) {
    logServerError("api:transactions:token-lookup", tokenError);
    return NextResponse.json(
      { erreur: "La vérification du jeton a échoué. Réessayez dans un instant." },
      { status: 500 },
    );
  }

  if (!tokenRow || typeof tokenRow.user_id !== "string") {
    return unauthorized();
  }

  const userId = tokenRow.user_id;

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { erreur: "Le corps de la requête doit être un objet JSON." },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { erreur: "Le corps de la requête doit être un objet JSON." },
      { status: 400 },
    );
  }

  const [profileResult, customCategories] = await Promise.all([
    admin.from("profiles").select("time_zone").eq("user_id", userId).maybeSingle(),
    fetchUserCategoryNames({ supabase: admin, userId }),
  ]);

  const today = getCalendarDateInTimeZone(
    new Date(),
    readTimeZone(profileResult.data?.time_zone),
  );
  const validation = validateTransactionInput({
    amount: readBodyText(body, "montant", "amount"),
    category: readBodyText(body, "categorie", "category"),
    customCategories,
    description: readBodyText(body, "description") ?? "",
    maximumTransactionDate: today,
    transactionDate: readBodyText(body, "date") ?? today,
  });

  if (!validation.valid) {
    const details: Record<string, string> = {};

    if (validation.fieldErrors.amount) details.montant = validation.fieldErrors.amount;
    if (validation.fieldErrors.category) details.categorie = validation.fieldErrors.category;
    if (validation.fieldErrors.description) details.description = validation.fieldErrors.description;
    if (validation.fieldErrors.transactionDate) details.date = validation.fieldErrors.transactionDate;

    return NextResponse.json(
      { details, erreur: "Transaction invalide, rien n’a été enregistré." },
      { status: 422 },
    );
  }

  const { data: created, error: insertError } = await admin
    .from("transactions")
    .insert({
      amount_cents: validation.data.amountCents,
      category: validation.data.category,
      description: validation.data.description,
      transaction_date: validation.data.transactionDate,
      user_id: userId,
    })
    .select("id")
    .single();

  if (insertError || !created) {
    if (insertError) logServerError("api:transactions:insert", insertError);
    return NextResponse.json(
      { erreur: "La transaction n’a pas pu être enregistrée. Réessayez dans un instant." },
      { status: 500 },
    );
  }

  await admin
    .from("api_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", tokenRow.id)
    .eq("user_id", userId);

  return NextResponse.json(
    {
      categorie: validation.data.category,
      date: validation.data.transactionDate,
      description: validation.data.description,
      id: created.id,
      montant: validation.values.amount,
    },
    { status: 201 },
  );
}
