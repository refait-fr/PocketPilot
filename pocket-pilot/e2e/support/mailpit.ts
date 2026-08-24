type MailpitSearchResponse = {
  messages?: Array<{ ID?: string }>;
};

type MailpitMessage = {
  HTML?: string;
  Text?: string;
};

export type CapturedEmailLink = {
  messageId: string;
  url: string;
};

export type AuthEmailKind = "confirmation" | "recovery";

function containsExpectedAuthFlow(link: string, kind: AuthEmailKind): boolean {
  if (kind === "confirmation") {
    return (
      link.includes("/auth/confirm") &&
      link.includes("token_hash=") &&
      link.includes("type=email")
    );
  }

  return (
    link.includes("type=recovery") ||
    link.includes("/auth/reset-password") ||
    link.includes("next=%2Fauth%2Freset-password")
  );
}

export async function findAuthEmailLink(
  mailpitUrl: string,
  email: string,
  kind: AuthEmailKind,
): Promise<CapturedEmailLink | undefined> {
  const searchUrl = new URL("/api/v1/search", mailpitUrl);
  searchUrl.searchParams.set("query", `to:\"${email}\"`);
  const searchResponse = await fetch(searchUrl);

  if (!searchResponse.ok) {
    throw new Error("Mailpit n’a pas pu rechercher l’email Auth attendu.");
  }

  const search = (await searchResponse.json()) as MailpitSearchResponse;

  for (const summary of search.messages ?? []) {
    if (!summary.ID) {
      continue;
    }

    const messageResponse = await fetch(
      new URL(`/api/v1/message/${encodeURIComponent(summary.ID)}`, mailpitUrl),
    );

    if (!messageResponse.ok) {
      continue;
    }

    const message = (await messageResponse.json()) as MailpitMessage;
    const content = `${message.HTML ?? ""}\n${message.Text ?? ""}`.replaceAll(
      "&amp;",
      "&",
    );
    const links = content.match(/https?:\/\/[^\s\"'<>]+/g) ?? [];
    const authLink = links.find((link) => containsExpectedAuthFlow(link, kind));

    if (authLink) {
      return { messageId: summary.ID, url: authLink };
    }
  }

  return undefined;
}

export async function deleteCapturedEmail(
  mailpitUrl: string,
  messageId: string,
): Promise<void> {
  const response = await fetch(new URL("/api/v1/messages", mailpitUrl), {
    body: JSON.stringify({ IDs: [messageId] }),
    headers: { "content-type": "application/json" },
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Mailpit n’a pas pu nettoyer l’email Auth capturé.");
  }
}
