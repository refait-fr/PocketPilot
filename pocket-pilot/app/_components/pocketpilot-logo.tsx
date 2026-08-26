import Image from "next/image";

type PocketPilotLogoProps = {
  className?: string;
  decorative?: boolean;
  priority?: boolean;
  size?: number;
  tone?: "dark" | "light";
};

export function PocketPilotLogo({
  className = "",
  decorative = true,
  priority = false,
  size = 32,
  tone = "dark",
}: PocketPilotLogoProps) {
  const classes = [
    "pocketpilot-logo",
    tone === "light" ? "is-light" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Image
      alt={decorative ? "" : "PocketPilot"}
      aria-hidden={decorative ? "true" : undefined}
      className={classes}
      height={size}
      priority={priority}
      src="/brand/pocketpilot-mark.png"
      width={size}
    />
  );
}
