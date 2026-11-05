import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  images: {
    // Photos des conducteurs servies par l'API (profil public PU2).
    remotePatterns: [new URL(`${apiUrl}/**`)],
    // Next 16 refuse par défaut d'optimiser une image d'IP locale ; en
    // développement, l'API tourne sur localhost:8000.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
