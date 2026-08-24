import { AppLoadingShell } from "@/app/_components/app-loading-shell";

export function RecurringEntryLoading({ label }: { label: string }) {
  return <AppLoadingShell label={label} />;
}
