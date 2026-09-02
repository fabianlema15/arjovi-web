import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],
  experimental: {
    proxyClientMaxBodySize: "12mb",
  },
};

export default nextConfig;
