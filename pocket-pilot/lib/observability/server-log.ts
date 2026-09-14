type SupabaseErrorLike = {
  code?: unknown;
  details?: unknown;
  hint?: unknown;
  message?: unknown;
};

function readField(error: SupabaseErrorLike, field: keyof SupabaseErrorLike): string | undefined {
  const value = error[field];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/**
 * Journalise une erreur serveur sans jamais écrire de données utilisateur
 * (formulaires, emails, montants). Seuls le périmètre et les champs
 * techniques de l'erreur Supabase sont conservés. Les messages affichés
 * restent génériques ; la corrélation se fait par horodatage.
 */
export function logServerError(scope: string, error: unknown): void {
  if (error && typeof error === "object") {
    const typed = error as SupabaseErrorLike;
    console.error(
      JSON.stringify({
        level: "error",
        scope,
        code: readField(typed, "code") ?? "unknown",
        message: readField(typed, "message") ?? "unknown",
        details: readField(typed, "details"),
        hint: readField(typed, "hint"),
      }),
    );
    return;
  }

  console.error(
    JSON.stringify({
      level: "error",
      scope,
      code: "unknown",
      message: String(error),
    }),
  );
}
