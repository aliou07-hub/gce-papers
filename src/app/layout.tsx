import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FloatingWhatsApp } from "@/components/app/FloatingWhatsApp";
import { SiteFooter } from "@/components/app/SiteFooter";

const SITE_URL = "https://www.gcepapers.site";
const SITE_NAME = "GCE Papers";
const DESCRIPTION =
  "GCE Papers is the home of Cameroon GCE Ordinary and Advanced Level past papers and marking schemes — 333 papers across 23 subjects, 2017 to 2026, priced so every student in Cameroon can actually afford to use it.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "GCE Papers — Cameroon GCE Past Papers & Marking Schemes",
  description: DESCRIPTION,
  keywords: [
    "GCE Papers",
    "gcepapers",
    "Cameroon GCE past papers",
    "GCE Board Cameroon",
    "O Level past papers Cameroon",
    "A Level past papers Cameroon",
    "GCE marking schemes",
  ],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "GCE Papers — Cameroon GCE Past Papers & Marking Schemes",
    description: DESCRIPTION,
    locale: "en_CM",
    images: [{ url: "/branding/logo.png", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GCE Papers — Cameroon GCE Past Papers & Marking Schemes",
    description: DESCRIPTION,
    images: ["/branding/logo.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0d0906",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  alternateName: "GCE Papers Cameroon",
  url: SITE_URL,
  logo: `${SITE_URL}/branding/logo.png`,
  description: DESCRIPTION,
  areaServed: "CM",
  sameAs: [] as string[],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    telephone: "+237676203454",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <div className="ambient-field" aria-hidden="true">
          <span className="orb" />
        </div>
        {children}
        <SiteFooter />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
