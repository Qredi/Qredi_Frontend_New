import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      {
        source: "/dashboard/help",
        destination: "/help",
        permanent: false,
      },
      {
        source: "/myqredi/help",
        destination: "/help",
        permanent: false,
      },
      {
        source: "/myqredi/financing/:id",
        destination: "/myqredi/financing",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
