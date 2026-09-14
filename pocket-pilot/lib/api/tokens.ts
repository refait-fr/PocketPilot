/**
 * Jetons d’accès personnels pour l’API Raccourci iOS. Le jeton en clair
 * n’existe qu’à sa création : seul son hash SHA-256 hexadécimal est stocké.
 * WebCrypto uniquement, pour rester compatible Node comme Edge.
 */

const TOKEN_PREFIX = "pp_";
const TOKEN_RANDOM_BYTES = 32;

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function generateApiToken(): Promise<string> {
  const random = crypto.getRandomValues(new Uint8Array(TOKEN_RANDOM_BYTES));

  return `${TOKEN_PREFIX}${bytesToBase64Url(random)}`;
}

export async function hashApiToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );

  return bytesToHex(new Uint8Array(digest));
}

/** Extrait le jeton d’un en-tête `Authorization: Bearer …`, sinon null. */
export function parseBearerToken(header: unknown): string | null {
  if (typeof header !== "string") {
    return null;
  }

  const match = /^Bearer ([A-Za-z0-9\-_]+)$/.exec(header.trim());

  if (!match || !match[1]?.startsWith(TOKEN_PREFIX)) {
    return null;
  }

  return match[1];
}
