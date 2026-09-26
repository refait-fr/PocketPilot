import type { Metadata } from "next";

import { LandingPage } from "@/app/_components/landing/landing-page";

const title = "PocketPilot : Sachez ce qu'il vous reste vraiment";
const description =
  "PocketPilot transforme vos revenus, charges, budgets et objectifs en une vision claire de ce qu'il vous reste vraiment ce mois-ci.";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  description,
  openGraph: {
    description,
    siteName: "PocketPilot",
    title,
    type: "website",
    url: "/",
  },
  title,
  twitter: {
    card: "summary",
    description,
    title,
  },
};

export default function HomePage() {
  return <LandingPage />;
}
