"use client";

import { useRef } from "react";

/** First pages (cover sheets) of real question papers from the catalogue —
 * the cover only shows subject, year and instructions, never questions. */
const CARDS = [
  { src: "/previews/al-cs.webp", alt: "A Level Computer Science 2025 — cover page" },
  { src: "/previews/ol-hist.webp", alt: "O Level History 2025 — cover page" },
  { src: "/previews/al-econ.webp", alt: "A Level Economics 2025 — cover page" },
  { src: "/previews/ol-bio.webp", alt: "O Level Biology 2025 — cover page" },
  { src: "/previews/al-phys.webp", alt: "A Level Physics 2025 — cover page" },
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
            key={c.src}
            className="paper-card"
            style={{ "--i": i, "--n": CARDS.length } as React.CSSProperties}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.src} alt={c.alt} draggable={false} loading={i < 2 ? "eager" : "lazy"} />
          </div>
        ))}
      </div>
    </div>
  );
}
