import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** A ruled field, like the answer line on a printed form — bottom border
 * only, no box, ink-colored underline that darkens on focus. */
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full border-0 border-b-[1.5px] border-ink/25 bg-transparent px-0.5 py-2.5 text-[15px] text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-ink",
        className
      )}
      {...props}
    />
  );
}
