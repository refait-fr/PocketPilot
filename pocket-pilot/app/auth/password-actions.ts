"use server";

import {
  AUTH_MESSAGES,
  classifyPasswordUpdateError,
} from "@/lib/auth/auth-messages";
import {
  type PasswordFieldErrors,
  validateNewPassword,
} from "@/lib/auth/auth-input";
import { createClient } from "@/lib/supabase/server";

type VerificationRequirements = {
  currentPassword: boolean;
  nonce: boolean;
};

export type PasswordActionState = {
  status:
    | "idle"
    | "error"
    | "success"
    | "verification-required"
    | "session-invalid";
  message: string;
  fieldErrors: PasswordFieldErrors & {
    currentPassword?: string;
    nonce?: string;
  };
  requirements: VerificationRequirements;
};

const noVerificationRequired: VerificationRequirements = {
  currentPassword: false,
  nonce: false,
};

function errorState(
  message: string,
  fieldErrors: PasswordActionState["fieldErrors"] = {},
): PasswordActionState {
  return {
    status: "error",
    message,
    fieldErrors,
    requirements: noVerificationRequired,
  };
}

function verificationState(
  message: string,
  requirements: VerificationRequirements,
  fieldErrors: PasswordActionState["fieldErrors"] = {},
): PasswordActionState {
  return {
    status: "verification-required",
    message,
    fieldErrors,
    requirements,
  };
}

export async function updatePassword(
  previousState: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  const validation = validateNewPassword(
    formData.get("password"),
    formData.get("passwordConfirmation"),
  );

  if (!validation.valid) {
    if (previousState.status === "verification-required") {
      return verificationState(
        "Vérifiez les champs indiqués, puis confirmez à nouveau la modification.",
        previousState.requirements,
        validation.fieldErrors,
      );
    }

    return errorState("Vérifiez les champs indiqués.", validation.fieldErrors);
  }

  const nonce = String(formData.get("nonce") ?? "").trim();
  const currentPassword = String(formData.get("currentPassword") ?? "");

  if (previousState.requirements.nonce && !/^\d{6}$/.test(nonce)) {
    return verificationState(
      AUTH_MESSAGES.reauthenticationRequired,
      previousState.requirements,
      { nonce: "Saisissez le code de sécurité à 6 chiffres." },
    );
  }

  if (previousState.requirements.currentPassword && !currentPassword) {
    return verificationState(
      AUTH_MESSAGES.currentPasswordRequired,
      previousState.requirements,
      { currentPassword: "Saisissez votre mot de passe actuel." },
    );
  }

  let supabase;

  try {
    supabase = await createClient();
  } catch {
    return errorState(AUTH_MESSAGES.serviceUnavailable);
  }

  try {
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims();

  if (claimsError) {
    return errorState(AUTH_MESSAGES.serviceUnavailable);
  }

  if (!claimsData?.claims.sub) {
    return {
      status: "session-invalid",
      message: AUTH_MESSAGES.sessionInvalid,
      fieldErrors: {},
      requirements: noVerificationRequired,
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: validation.password,
    ...(currentPassword ? { current_password: currentPassword } : {}),
    ...(nonce ? { nonce } : {}),
  });

  if (!error) {
    return {
      status: "success",
      message: AUTH_MESSAGES.passwordUpdated,
      fieldErrors: {},
      requirements: noVerificationRequired,
    };
  }

  const errorKind = classifyPasswordUpdateError(error);

  if (errorKind === "weak-password") {
    return errorState(AUTH_MESSAGES.weakPassword, {
      password: AUTH_MESSAGES.weakPassword,
    });
  }

  if (errorKind === "same-password") {
    return errorState(AUTH_MESSAGES.samePassword, {
      password: AUTH_MESSAGES.samePassword,
    });
  }

  if (errorKind === "session-invalid") {
    return {
      status: "session-invalid",
      message: AUTH_MESSAGES.sessionInvalid,
      fieldErrors: {},
      requirements: noVerificationRequired,
    };
  }

  if (errorKind === "reauthentication-invalid") {
    const { error: reauthenticationError } =
      await supabase.auth.reauthenticate();

    if (reauthenticationError) {
      return errorState(AUTH_MESSAGES.serviceUnavailable);
    }

    return verificationState(
      AUTH_MESSAGES.reauthenticationRequired,
      { ...previousState.requirements, nonce: true },
    );
  }

  if (errorKind === "reauthentication-required") {
    const { error: reauthenticationError } =
      await supabase.auth.reauthenticate();

    if (reauthenticationError) {
      return errorState(AUTH_MESSAGES.serviceUnavailable);
    }

    return verificationState(AUTH_MESSAGES.reauthenticationRequired, {
      currentPassword:
        previousState.requirements.currentPassword || Boolean(currentPassword),
      nonce: true,
    });
  }

  if (
    errorKind === "current-password-required" ||
    errorKind === "current-password-invalid"
  ) {
    const alsoNeedsNonce =
      previousState.requirements.nonce || Boolean(nonce);

    if (alsoNeedsNonce) {
      const { error: reauthenticationError } =
        await supabase.auth.reauthenticate();

      if (reauthenticationError) {
        return errorState(AUTH_MESSAGES.serviceUnavailable);
      }
    }

    const baseMessage =
      errorKind === "current-password-invalid"
        ? AUTH_MESSAGES.currentPasswordInvalid
        : AUTH_MESSAGES.currentPasswordRequired;
    const message = alsoNeedsNonce
      ? `${baseMessage} Un nouveau code de sécurité vient aussi de vous être envoyé.`
      : baseMessage;

    return verificationState(
      message,
      { currentPassword: true, nonce: alsoNeedsNonce },
      errorKind === "current-password-invalid"
        ? { currentPassword: AUTH_MESSAGES.currentPasswordInvalid }
        : {},
    );
  }

    return errorState(AUTH_MESSAGES.serviceUnavailable);
  } catch {
    return errorState(AUTH_MESSAGES.serviceUnavailable);
  }
}
