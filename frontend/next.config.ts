import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/r/:code",
        destination: "/pricing?coupon=:code",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
