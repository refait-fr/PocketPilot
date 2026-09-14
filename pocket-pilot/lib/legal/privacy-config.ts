import { isValidEmailAddress } from "../auth/auth-input.ts";

export type PrivacyConfiguration = {
  contactEmail: string | null;
  controllerName: string | null;
};

function readOptionalSetting(value: string | undefined): string | null {
  const setting = value?.trim();
  return setting ? setting : null;
}

export function getPrivacyConfiguration(): PrivacyConfiguration {
  const contactEmail = readOptionalSetting(process.env.PRIVACY_CONTACT_EMAIL);

  return {
    // Un email malformé vaut absence de configuration : la page /privacy
    // affiche alors le bandeau bloquant au lieu d'une adresse inutilisable.
    contactEmail:
      contactEmail && isValidEmailAddress(contactEmail.toLowerCase())
        ? contactEmail
        : null,
    controllerName: readOptionalSetting(process.env.PRIVACY_CONTROLLER_NAME),
  };
}
