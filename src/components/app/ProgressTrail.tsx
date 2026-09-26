const STEPS = ["Level", "Year", "Subjects"] as const;

/** A document section header, not a dot-and-line breadcrumb — three ruled
 * cells like the section markers on the exam papers themselves, with the
 * current step filled solid. */
export function ProgressTrail({ current }: { current: 0 | 1 | 2 }) {
  return (
    <div
      className="glass flex text-[13px]"
      style={{ borderRadius: "var(--radius-control)" }}
      aria-label="Navigation progress"
    >
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div
            key={step}
            className={`flex-1 px-3 py-2.5 text-center ${i > 0 ? "border-l border-white/10" : ""} ${
              active
                ? "rounded-[inherit] bg-accent-a text-white font-semibold shadow-[0_4px_16px_-4px_var(--color-accent-a)]"
                : done
                  ? "text-ink"
                  : "text-ink-faint"
            }`}
          >
            <span className="tabular-nums">{i + 1}.</span> {step}
          </div>
        );
      })}
    </div>
  );
}
