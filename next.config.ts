import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "live.centrosportivoitaliano.it",
      },
      {
        protocol: "https",
        hostname: "static.centrosportivoitaliano.it",
      },
      {
        protocol: "https",
        hostname: "drive.predanicola.it",
      },
    ],
  },
};

export default nextConfig;
