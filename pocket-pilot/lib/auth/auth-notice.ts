export type AuthNotice = {
  kind: "error" | "success";
  message: string;
};

const authNotices = {
  "account-deleted": {
    kind: "success",
    message: "Votre compte et ses données ont été supprimés.",
  },
  "confirmation-failed": {
    kind: "error",
    message:
      "La confirmation n’a pas pu être finalisée. Demandez un nouveau lien.",
  },
  "confirmation-link-invalid": {
    kind: "error",
    message: "Le lien de confirmation est invalide ou a expiré.",
  },
  "recovery-link-invalid": {
    kind: "error",
    message: "Le lien de réinitialisation est invalide ou a expiré.",
  },
  "signed-out": {
    kind: "success",
    message: "Vous êtes déconnecté.",
  },
} satisfies Record<string, AuthNotice>;

export type AuthNoticeCode = keyof typeof authNotices;

export function getAuthNotice(value: unknown): AuthNotice | undefined {
  if (typeof value !== "string" || !Object.hasOwn(authNotices, value)) {
    return undefined;
  }

  return authNotices[value as AuthNoticeCode];
}
