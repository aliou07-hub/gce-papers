import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Bordered line-art badge — a drafting/stamp mark in a single ink color,
 * not a glossy gradient app icon. `tone` sets the ink color via currentColor
 * so the border and the icon strokes always match. */
export function IconBadge({
  children,
  tone,
  size = 52,
  className,
}: {
  children: ReactNode;
  tone: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("icon-badge", className)}
      style={{ width: size, height: size, color: tone }}
    >
      {children}
    </div>
  );
}

export const TONES = {
  oLevel: "#0284c7",
  aLevel: "#1d4ed8",
  mint: "#0f9d68",
};

export function BookIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 5.5c0-.8.7-1.5 1.7-1.5H12v14H5.7C4.7 18 4 18.7 4 19.5V5.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M20 5.5c0-.8-.7-1.5-1.7-1.5H12v14h6.3c1 0 1.7.7 1.7 1.5V5.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CapIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 4 2 9l10 5 10-5-10-5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M6 11.5V16c0 1.1 2.7 2.5 6 2.5s6-1.4 6-2.5v-4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M21 9.5v5.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function CheckBadgeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
