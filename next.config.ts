import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
};

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    runtimeCaching: [
      // Deliberately NOT caching /api/viewer/* here: that URL's response
      // depends on a live, per-user ownership check (owner gets the full
      // document, everyone else gets a short preview). A shared HTTP/SW
      // cache only keys on the URL, not on who's asking — caching it once
      // let any later visitor on the same device keep seeing a stale
      // response regardless of their own purchase state, a real paywall
      // bypass. Offline access to purchased papers needs a cache that's
      // explicitly scoped per signed-in user (e.g. IndexedDB keyed by
      // documentId+userId, populated only after the app itself confirms
      // X-Kaolo-Preview: false) — a future addition, not this blind cache.
      {
        urlPattern: /\/_next\/static\/.*/,
        handler: "CacheFirst",
        options: {
          cacheName: "kaolo-static",
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
    ],
  },
});

export default withPWA(nextConfig);
