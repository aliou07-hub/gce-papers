"use client";

import { usePathname } from "next/navigation";

const WHATSAPP_NUMBER = "237676203454";
const DEFAULT_MESSAGE = "Bonjour GCE Papers, j'ai un problème avec...";

export function FloatingWhatsApp() {
  const pathname = usePathname();
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
  // The PDF viewer has its own bottom bar (page controls) hugging the same
  // corner — sit above it there instead of on top of the Next button.
  const inViewer = pathname?.startsWith("/viewer/");

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter GCE Papers sur WhatsApp"
      className={`fixed right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-black/30 transition-transform hover:scale-105 active:scale-95 ${
        inViewer ? "bottom-20" : "bottom-4"
      }`}
    >
      <svg viewBox="0 0 32 32" className="h-6 w-6 fill-white" aria-hidden="true">
        <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.34.667 4.523 1.822 6.377L4 29l7.84-1.77A11.93 11.93 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.75c-1.99 0-3.86-.55-5.46-1.51l-.39-.23-4.65 1.05 1.03-4.53-.25-.4A9.7 9.7 0 0 1 5.25 15c0-5.93 4.82-10.75 10.754-10.75S26.75 9.07 26.75 15 21.94 24.75 16.004 24.75Zm5.94-8.12c-.32-.16-1.9-.94-2.2-1.05-.3-.11-.51-.16-.73.16-.21.32-.84 1.05-1.03 1.26-.19.21-.38.24-.7.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.38.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.73-1.76-1-2.41-.26-.63-.53-.54-.73-.55h-.62c-.21 0-.56.08-.85.4-.29.32-1.12 1.1-1.12 2.67s1.15 3.09 1.31 3.3c.16.21 2.26 3.45 5.47 4.84.76.33 1.36.53 1.82.67.77.24 1.46.21 2.02.13.62-.09 1.9-.78 2.16-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37Z" />
      </svg>
    </a>
  );
}
