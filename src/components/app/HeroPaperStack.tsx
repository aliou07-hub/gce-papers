"use client";

import { useRef } from "react";

/** Real subject codes, pulled from the actual papers in the catalog — this
 * is the front door, so what it shows should be true, not placeholder. */
const CARDS = [
  { code: "0560", subject: "History", level: "O Level" },
  { code: "0775", subject: "Further Mathematics", level: "A Level" },
  { code: "0515", subject: "Chemistry", level: "O Level" },
  { code: "0796", subject: "ICT", level: "A Level" },
  { code: "0525", subject: "Economics", level: "A Level" },
  { code: "0570", subject: "Mathematics", level: "O Level" },
];

export function HeroPaperStack() {
  const sceneRef = useRef<HTMLDivElement>(null);

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    const el = sceneRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--scene-ry", `${-10 + px * 20}deg`);
    el.style.setProperty("--scene-rx", `${6 - py * 16}deg`);
  }

  function reset() {
    const el = sceneRef.current;
    if (!el) return;
    el.style.setProperty("--scene-ry", "-10deg");
    el.style.setProperty("--scene-rx", "6deg");
  }

  return (
    <div className="paper-scene-wrap" onPointerMove={handleMove} onPointerLeave={reset}>
      <div className="paper-scene" ref={sceneRef}>
        {CARDS.map((c, i) => (
          <div
            key={c.code}
            className="paper-card"
            style={{ "--i": i, "--n": CARDS.length } as React.CSSProperties}
          >
            <div className="paper-card-head">
              <span>G.C.E. Board</span>
              <span>{c.level}</span>
            </div>
            <p className="paper-card-subject">{c.subject}</p>
            <span className="paper-card-code">{c.code}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
