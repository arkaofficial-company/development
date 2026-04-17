import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 画像アップロード対応: サーバーサイドのボディサイズ上限を拡大
  serverExternalPackages: [],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
