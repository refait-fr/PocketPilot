"use server";

import { revalidatePath } from "next/cache";

import type { TransactionActionState } from "@/app/transactions/transaction-types";
import { getCalendarDateInTimeZone } from "@/lib/finance/calendar-month";
import { TRANSACTION_CATEGORIES } from "@/lib/transactions/categories";
import { validateTransactionInput } from "@/lib/transactions/transaction-input";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const emptyTransactionValues: TransactionActionState["values"] = {
  amount: "",
  category: TRANSACTION_CATEGORIES[0],
  description: "",
  transactionDate: "",
};

function invalidTransactionState(
  message: string,
  values: TransactionActionState["values"] = emptyTransactionValues,
): TransactionActionState {
  return {
    fieldErrors: {},
    message,
    status: "error",
    values,
  };
}

function validateTransactionForm(formData: FormData) {
  return validateTransactionInput({
    amount: formData.get("amount"),
    category: formData.get("category"),
    description: formData.get("description"),
    transactionDate: formData.get("transactionDate"),
  });
}

function revalidateTransactionViews() {
  revalidatePath("/");
  revalidatePath("/purchase-checker");
  revalidatePath("/transactions");
}

export async function createTransaction(
  _previousState: TransactionActionState,
  formData: FormData,
): Promise<TransactionActionState> {
  const validation = validateTransactionForm(formData);

  if (!validation.valid) {
    return {
      fieldErrors: validation.fieldErrors,
      message: "Corrigez les champs indiqués.",
      status: "error",
      values: validation.values,
    };
  }

  const { profile, supabase, userId } = await requireAuthenticatedProfile();
  const { error } = await supabase.from("transactions").insert({
    amount_cents: validation.data.amountCents,
    category: validation.data.category,
    description: validation.data.description,
    transaction_date: validation.data.transactionDate,
    user_id: userId,
  });

  if (error) {
    return invalidTransactionState(
      "La transaction n’a pas pu être créée. Réessayez dans un instant.",
      validation.values,
    );
  }

  revalidateTransactionViews();

  return {
    fieldErrors: {},
    message: "La transaction a été ajoutée au mois.",
    status: "success",
    values: {
      ...emptyTransactionValues,
      transactionDate: getCalendarDateInTimeZone(new Date(), profile.timeZone),
    },
  };
}

export async function updateTransaction(
  transactionId: string,
  _previousState: TransactionActionState,
  formData: FormData,
): Promise<TransactionActionState> {
  if (!UUID_PATTERN.test(transactionId)) {
    return invalidTransactionState("Cette transaction est introuvable.");
  }

  const validation = validateTransactionForm(formData);

  if (!validation.valid) {
    return {
      fieldErrors: validation.fieldErrors,
      message: "Corrigez les champs indiqués.",
      status: "error",
      values: validation.values,
    };
  }

  const { supabase, userId } = await requireAuthenticatedProfile();
  const { data, error } = await supabase
    .from("transactions")
    .update({
      amount_cents: validation.data.amountCents,
      category: validation.data.category,
      description: validation.data.description,
      transaction_date: validation.data.transactionDate,
    })
    .eq("id", transactionId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return invalidTransactionState(
      "La transaction n’a pas pu être modifiée. Elle est peut-être introuvable.",
      validation.values,
    );
  }

  revalidateTransactionViews();

  return {
    fieldErrors: {},
    message: "Les modifications sont enregistrées.",
    status: "success",
    values: validation.values,
  };
}

export async function deleteTransaction(
  transactionId: string,
  _previousState: TransactionActionState,
  _formData: FormData,
): Promise<TransactionActionState> {
  void _previousState;
  void _formData;

  if (!UUID_PATTERN.test(transactionId)) {
    return invalidTransactionState("Cette transaction est introuvable.");
  }

  const { supabase, userId } = await requireAuthenticatedProfile();
  const { data, error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return invalidTransactionState("La transaction n’a pas pu être supprimée.");
  }

  revalidateTransactionViews();

  return {
    fieldErrors: {},
    message: "La transaction a été supprimée.",
    status: "success",
    values: emptyTransactionValues,
  };
}
