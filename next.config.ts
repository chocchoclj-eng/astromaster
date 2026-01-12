import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 这条对某些版本有效，但不够“强硬”，我们下面还会加 webpack externals 兜底
  serverExternalPackages: ["sweph"],

  webpack: (config, { isServer }) => {
    if (isServer) {
      // ✅ 强制：sweph 不参与 bundle，运行时由 Node 从 node_modules 直接 require
      config.externals = config.externals || [];
      config.externals.push({
        sweph: "commonjs sweph",
      });
    }
    return config;
  },
};

export default nextConfig;
