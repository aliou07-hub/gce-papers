"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { PDFDocumentProxy } from "pdfjs-dist";

type Status = "loading" | "ready" | "locked" | "error";

const LEVEL_LABEL: Record<string, string> = { O_LEVEL: "O Level", A_LEVEL: "A Level" };
const TYPE_LABEL: Record<string, string> = {
  QUESTIONS: "Questions",
  MARKING_SCHEME: "Marking Scheme",
};

interface DocMeta {
  subject: string;
  level: string;
  year: string;
  type: string;
  isPreview: boolean;
  previewPages: number;
  totalPages: number;
}

export function PdfViewer({ documentId }: { documentId: string }) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);

  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [meta, setMeta] = useState<DocMeta | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/viewer/${documentId}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (res.status === 403 && data.error === "Purchase required to view this document") {
            setStatus("locked");
            return;
          }
          throw new Error(data.error ?? "Could not open this document");
        }

        const docMeta: DocMeta = {
          subject: decodeURIComponent(res.headers.get("X-Kaolo-Subject") ?? ""),
          level: res.headers.get("X-Kaolo-Level") ?? "",
          year: res.headers.get("X-Kaolo-Year") ?? "",
          type: res.headers.get("X-Kaolo-Type") ?? "",
          isPreview: res.headers.get("X-Kaolo-Preview") === "true",
          previewPages: Number(res.headers.get("X-Kaolo-Preview-Pages") ?? 0),
          totalPages: Number(res.headers.get("X-Kaolo-Total-Pages") ?? 0),
        };

        const bytes = await res.arrayBuffer();
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();

        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
        if (cancelled) return;

        pdfRef.current = pdf;
        setNumPages(pdf.numPages);
        setMeta(docMeta);

        // Fit the first page to the screen width instead of rendering at
        // native PDF scale (which is wider than a phone screen).
        const firstPage = await pdf.getPage(1);
        const nativeWidth = firstPage.getViewport({ scale: 1 }).width;
        const available = (containerRef.current?.clientWidth ?? window.innerWidth) - 32;
        setScale(Math.max(0.4, Math.min(2.4, available / nativeWidth)));

        setStatus("ready");
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not open this document");
          setStatus("error");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
      pdfRef.current?.cleanup();
    };
  }, [documentId]);

  useEffect(() => {
    if (status !== "ready" || !pdfRef.current || !canvasRef.current) return;
    let cancelled = false;

    async function renderPage() {
      const pdf = pdfRef.current!;
      const page = await pdf.getPage(pageNum);
      if (cancelled) return;

      // Render at native screen resolution (devicePixelRatio), not just CSS
      // pixels, then scale the canvas back down with CSS. Without this the
      // canvas buffer is only as sharp as `scale` implies in CSS pixels, so
      // on any retina/high-DPI phone screen (the majority of our students)
      // text looks visibly blurry even though the source PDF is sharp.
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const cssViewport = page.getViewport({ scale });
      const renderViewport = page.getViewport({ scale: scale * dpr });

      const canvas = canvasRef.current!;
      const context = canvas.getContext("2d")!;
      canvas.width = renderViewport.width;
      canvas.height = renderViewport.height;
      canvas.style.width = `${cssViewport.width}px`;
      canvas.style.height = `${cssViewport.height}px`;

      await page.render({ canvasContext: context, viewport: renderViewport, canvas }).promise;
    }

    renderPage();
    return () => {
      cancelled = true;
    };
  }, [status, pageNum, scale]);

  const buyHref = meta
    ? `/checkout?type=subject&level=${meta.level}&year=${meta.year}&subject=${encodeURIComponent(
        meta.subject
      )}&option=questions`
    : "#";

  return (
    <div className="flex h-dvh flex-col bg-viewer-bg">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <button onClick={() => router.back()} className="text-sm text-white/70">
          Back
        </button>
        {meta && (
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-sm font-semibold text-white">
              {meta.subject} — {TYPE_LABEL[meta.type]}
            </p>
            <p className="text-xs text-white/50">
              {LEVEL_LABEL[meta.level]} {meta.year}
            </p>
          </div>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setScale((s) => Math.max(0.6, s - 0.2))}
            className="h-8 w-8 rounded-control bg-white/10 text-white"
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            onClick={() => setScale((s) => Math.min(2.4, s + 0.2))}
            className="h-8 w-8 rounded-control bg-white/10 text-white"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      </div>

      {meta?.isPreview && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-accent-a-soft/15 px-4 py-2.5">
          <p className="text-xs text-white/80">
            Free preview — {meta.previewPages} of {meta.totalPages} pages
          </p>
          <Link
            href={buyHref}
            className="rounded-control bg-accent-a-soft px-3 py-1.5 text-xs font-semibold text-white"
          >
            Buy to unlock all pages
          </Link>
        </div>
      )}

      <div ref={containerRef} className="relative flex-1 overflow-auto">
        {status === "loading" && (
          <p className="mt-10 text-center text-sm text-white/60">Loading document…</p>
        )}
        {status === "error" && (
          <p className="mt-10 text-center text-sm text-danger">{error}</p>
        )}
        {status === "locked" && (
          <div className="mx-auto mt-14 w-full max-w-xs px-4 text-center">
            <p className="text-sm text-white/70">
              This document is too short for a free preview — purchase it to view it.
            </p>
            <button
              onClick={() => router.back()}
              className="mt-5 w-full rounded-control bg-accent-a-soft px-4 py-2.5 text-sm font-semibold text-white"
            >
              Go back to buy
            </button>
          </div>
        )}
        {status === "ready" && (
          <div className="mx-auto w-fit py-6">
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="select-none rounded-lg shadow-2xl"
                onContextMenu={(e) => e.preventDefault()}
              />
              <Watermark />
            </div>
          </div>
        )}
      </div>

      {status === "ready" && numPages > 1 && (
        <div className="flex items-center justify-center gap-4 border-t border-white/10 px-4 py-3">
          <button
            onClick={() => setPageNum((p) => Math.max(1, p - 1))}
            disabled={pageNum <= 1}
            className="rounded-control bg-white/10 px-4 py-2 text-sm text-white disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-white/60">
            Page {pageNum} of {numPages}
          </span>
          <button
            onClick={() => setPageNum((p) => Math.min(numPages, p + 1))}
            disabled={pageNum >= numPages}
            className="rounded-control bg-white/10 px-4 py-2 text-sm text-white disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Single subtle brand mark, centered — no name or phone number. Kept
 * deliberately light so it doesn't fight the exam content for attention.
 */
function Watermark() {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg"
      style={{ mixBlendMode: "multiply" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/branding/icon.png"
        alt=""
        style={{ width: "40%", opacity: 0.12 }}
        aria-hidden="true"
      />
    </div>
  );
}
