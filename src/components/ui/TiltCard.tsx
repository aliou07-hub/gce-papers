"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Apple-glass style 3D tilt + light-glare on pointer move (desktop hover /
 * precise pointers only — skipped on touch, where the .glass-tilt:active
 * scale press is feedback enough). Pure CSS transform/custom-properties, no
 * animation library, so it stays cheap on low-end phones.
 */
export function TiltCard({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) scale(1.015) rotateX(${py * -10}deg) rotateY(${
      px * 14
    }deg)`;
    el.style.setProperty("--glare-x", `${(px + 0.5) * 100}%`);
    el.style.setProperty("--glare-y", `${(py + 0.5) * 100}%`);
    el.style.setProperty("--glare-o", "1");
  }

  function reset() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
    el.style.setProperty("--glare-o", "0");
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      onPointerUp={reset}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
      className={cn("glass glass-tilt glass-glare cursor-pointer select-none", className)}
    >
      {children}
    </div>
  );
}
