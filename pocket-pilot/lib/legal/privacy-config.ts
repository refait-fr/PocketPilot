export type PrivacyConfiguration = {
  contactEmail: string | null;
  controllerName: string | null;
};

function readOptionalSetting(value: string | undefined): string | null {
  const setting = value?.trim();
  return setting ? setting : null;
}

export function getPrivacyConfiguration(): PrivacyConfiguration {
  return {
    contactEmail: readOptionalSetting(process.env.PRIVACY_CONTACT_EMAIL),
    controllerName: readOptionalSetting(process.env.PRIVACY_CONTROLLER_NAME),
  };
}
