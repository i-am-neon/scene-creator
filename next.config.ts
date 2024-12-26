import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oeivscefnzpuiynswsue.supabase.co",
      },
    ],
  },
};

export default nextConfig;

