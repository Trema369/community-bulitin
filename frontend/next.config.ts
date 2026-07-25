import type { NextConfig } from "next";
import path from "path";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
    output: "standalone",

    // Pin the workspace root to this directory so Next doesn't mistake the
    // unrelated root-level package.json/pnpm-lock.yaml (used only for the
    // "dev" convenience script) for a monorepo root.
    outputFileTracingRoot: path.resolve(__dirname),
    turbopack: {
        root: path.resolve(__dirname),
    },

    async rewrites() {
        return [
            {
                source: "/uploads/:path*",
                destination: `${API_BASE}/uploads/:path*`,
            },
        ];
    },
};

export default nextConfig;
