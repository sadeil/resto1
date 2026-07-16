import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  experimental: {
    cpus: 1,
    webpackBuildWorker: false,
  },
};

export default config;
