import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

import { readE2EEnvironment } from "./environment";

export type TestAccount = {
  email: string;
  id: string;
  password: string;
};

type CreateAccountOptions = {
  email: string;
  password: string;
  withProfile?: boolean;
};

let adminClient: SupabaseClient | undefined;

function getAdminClient(): SupabaseClient {
  if (adminClient) {
    return adminClient;
  }

  const environment = readE2EEnvironment();
  adminClient = createClient(
    environment.supabaseUrl,
    environment.supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );

  return adminClient;
}

export async function createConfirmedAccount({
  email,
  password,
  withProfile = true,
}: CreateAccountOptions): Promise<TestAccount> {
  const admin = getAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    password,
  });

  if (error || !data.user) {
    throw new Error(
      `Impossible de créer l’utilisateur E2E (${error?.code ?? "réponse incomplète"}).`,
    );
  }

  if (withProfile) {
    const environment = readE2EEnvironment();
    const authenticatedClient = createClient(
      environment.supabaseUrl,
      environment.supabasePublishableKey,
      {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
      },
    );
    const { error: signInError } =
      await authenticatedClient.auth.signInWithPassword({ email, password });

    if (signInError) {
      await admin.auth.admin.deleteUser(data.user.id);
      throw new Error(
        `Impossible d’ouvrir la session E2E (${signInError.code ?? "erreur inconnue"}).`,
      );
    }

    const { error: profileError } = await authenticatedClient
      .from("profiles")
      .insert({
        currency_code: "EUR",
        time_zone: "Europe/Paris",
        user_id: data.user.id,
      });

    await authenticatedClient.auth.signOut();

    if (profileError) {
      await admin.auth.admin.deleteUser(data.user.id);
      throw new Error(
        `Impossible de créer le profil E2E (${profileError.code ?? "erreur inconnue"}).`,
      );
    }
  }

  return { email, id: data.user.id, password };
}

async function findUserByEmail(email: string): Promise<User | undefined> {
  const admin = getAdminClient();

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error) {
      throw new Error(
        `Impossible de rechercher l’utilisateur E2E (${error.code ?? "erreur inconnue"}).`,
      );
    }

    const user = data.users.find((candidate) => candidate.email === email);

    if (user) {
      return user;
    }

    if (data.users.length < 100) {
      return undefined;
    }
  }

  return undefined;
}

export async function deleteTestAccount(userId: string): Promise<void> {
  const { error } = await getAdminClient().auth.admin.deleteUser(userId);

  if (error && error.status !== 404) {
    throw new Error(
      `Impossible de nettoyer l’utilisateur E2E (${error.code ?? "erreur inconnue"}).`,
    );
  }
}

export async function deleteTestAccountByEmail(email: string): Promise<void> {
  const user = await findUserByEmail(email);

  if (user) {
    await deleteTestAccount(user.id);
  }
}
