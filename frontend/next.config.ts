
import type { NextConfig } from "next";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
    // Uploaded media is stored as a relative path ("/uploads/<uuid>.png") and served
    // by the Go server. Proxying it keeps those URLs same-origin, so <Image> works
    // without registering the backend host in images.remotePatterns.
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
