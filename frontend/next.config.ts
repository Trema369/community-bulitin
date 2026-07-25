import type { NextConfig } from "next";
import path from "path";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
    output: "standalone",

    // Point Turbopack to the parent monorepo root directory
    turbopack: {
        root: path.resolve(__dirname, ".."),
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
