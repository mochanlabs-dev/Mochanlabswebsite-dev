import type { NextConfig } from "next";

// Static export: `next build` writes plain HTML/CSS/JS to `out/`, which the
// Express server in ../server serves alongside the admin portal.
const nextConfig: NextConfig = {
  output: "export",
  // Pages export as /work/index.html, so any static host (Express, Vercel)
  // serves /work without extra rules.
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
