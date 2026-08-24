"use server";

import { readEmailAddress } from "@/lib/auth/auth-input";
import { AUTH_MESSAGES } from "@/lib/auth/auth-messages";
import { getAuthEmailRedirectUrl } from "@/lib/auth/auth-redirect-url";
import { createClient } from "@/lib/supabase/server";

export type AuthEmailActionState = {
  status: "idle" | "error" | "success";
  message: string;
  email: string;
};

function invalidEmailState(
  result: Extract<ReturnType<typeof readEmailAddress>, { valid: false }>,
): AuthEmailActionState {
  return {
    status: "error",
    message: result.message,
    email: result.email,
  };
}

export async function requestPasswordReset(
  _previousState: AuthEmailActionState,
  formData: FormData,
): Promise<AuthEmailActionState> {
  const emailResult = readEmailAddress(formData.get("email"));

  if (!emailResult.valid) {
    return invalidEmailState(emailResult);
  }

  try {
    const supabase = await createClient();
    const redirectTo = getAuthEmailRedirectUrl("recovery");

    await supabase.auth.resetPasswordForEmail(emailResult.email, {
      redirectTo,
    });
  } catch {
    return {
      status: "error",
      message: AUTH_MESSAGES.serviceUnavailable,
      email: emailResult.email,
    };
  }

  return {
    status: "success",
    message: AUTH_MESSAGES.passwordResetRequestAccepted,
    email: emailResult.email,
  };
}

export async function resendConfirmationEmail(
  _previousState: AuthEmailActionState,
  formData: FormData,
): Promise<AuthEmailActionState> {
  const emailResult = readEmailAddress(formData.get("email"));

  if (!emailResult.valid) {
    return invalidEmailState(emailResult);
  }

  try {
    const supabase = await createClient();
    const emailRedirectTo = getAuthEmailRedirectUrl("confirmation");

    await supabase.auth.resend({
      type: "signup",
      email: emailResult.email,
      options: { emailRedirectTo },
    });
  } catch {
    return {
      status: "error",
      message: AUTH_MESSAGES.serviceUnavailable,
      email: emailResult.email,
    };
  }

  return {
    status: "success",
    message: AUTH_MESSAGES.confirmationResendAccepted,
    email: emailResult.email,
  };
}
