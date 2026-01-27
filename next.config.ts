import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drive.predanicola.it",
      },
    ],
    // Disable optimization for images loaded through API proxy
    unoptimized: false,
  },
};

export default nextConfig;
