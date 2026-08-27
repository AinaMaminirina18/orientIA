import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/Brochure%20officielle%20ISPM",
        destination: "/Brochure.pdf",
      },
      {
        source: "/Brochure officielle ISPM",
        destination: "/Brochure.pdf",
      },
    ];
  },
};

export default nextConfig;
