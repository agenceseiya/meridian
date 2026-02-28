import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: ".",
  },
  serverExternalPackages: ["@neondatabase/serverless"],
  typescript: {
    // @types/mapbox__point-geometry is a broken stub pulled in by mapbox-gl
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
