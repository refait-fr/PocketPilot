import type { Metadata } from "next";

import { LandingPage } from "@/app/_components/landing/landing-page";

const title = "PocketPilot — Know what you really have left";
const description =
  "PocketPilot turns your income, expenses, budgets and goals into one clear view of what you really have left this month.";

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
