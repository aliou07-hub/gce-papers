import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FloatingWhatsApp } from "@/components/app/FloatingWhatsApp";

export const metadata: Metadata = {
  title: "GCE Papers — Cameroon GCE Past Papers",
  description:
    "Revise with real Cameroon GCE Ordinary and Advanced Level past papers, by subject and year.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GCE Papers",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <div className="ambient-field" aria-hidden="true">
          <span className="orb" />
        </div>
        {children}
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
