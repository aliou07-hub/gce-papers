import type { ButtonHTMLAttributes, CSSProperties } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "o-level" | "a-level" | "ghost" | "danger";

/** Each tinted variant just sets the glass tint color; .btn-glass in
 * globals.css does the actual frosted-glass construction (blur, sheen,
 * depth) so every color gets an identical Apple-glass treatment. */
// Site buttons come in two solid colours for readability on the white
// background: orange for the main action, blue for every other button.
const variantTint: Record<Variant, string> = {
  primary: "var(--color-accent-a)",
  "o-level": "var(--color-accent-a)",
  "a-level": "var(--color-accent-a)",
  ghost: "var(--color-accent-b)",
  danger: "var(--color-danger)",
};

export function Button({
  variant = "primary",
  tint: tintOverride,
  className,
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; tint?: string }) {
  const tint = tintOverride ?? variantTint[variant];
  return (
    <button
      className={cn(
        "btn-glass inline-flex items-center justify-center rounded-control px-5 py-3 text-[15px] font-semibold text-white transition-transform duration-150 disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      style={{ "--btn-tint": tint, ...style } as CSSProperties}
      {...props}
    />
  );
}
