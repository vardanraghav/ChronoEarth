import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // ── Turbopack config (Next.js 16 dev default) ─────────────────────────
  // Empty config silences the "webpack config but no turbopack config" warning.
  // Turbopack handles Cesium correctly without custom rules.
  turbopack: {},

  // ── Webpack config (used by Vercel production builds) ─────────────────
  // Problem: Cesium ships internal worker files with legacy octal escape
  // sequences (e.g. `\0`) inside template-like strings. SWC/esbuild in
  // Vercel's production bundler tries to re-parse these files and throws:
  //   "Octal escape sequences are not allowed in template strings"
  //
  // Solution: tell webpack to skip re-parsing Cesium's pre-built JS files
  // entirely, and mark cesium as external on the server side so Node never
  // tries to evaluate browser-only Cesium APIs during SSR.
  webpack(config, { isServer }) {
    // 1. Exclude Cesium's pre-built files from webpack's normal JS pipeline.
    //    noParse = webpack reads the file as raw bytes and does not parse it
    //    for imports/exports — prevents SWC from touching the octal sequences.
    if (!config.module.noParse) {
      config.module.noParse = [];
    }
    const noParseList = Array.isArray(config.module.noParse)
      ? config.module.noParse
      : [config.module.noParse];
    noParseList.push(
      /node_modules\/cesium\/Build/,
      /node_modules\/cesium\/Source/,
    );
    config.module.noParse = noParseList;

    // 2. Server side: mark cesium as external so Next.js never attempts to
    //    evaluate browser-only Cesium globals in Node.js during prerendering.
    if (isServer) {
      const existing = config.externals ?? [];
      const arr = Array.isArray(existing) ? existing : [existing];
      config.externals = [...arr, "cesium"];
    }

    return config;
  },
};

export default nextConfig;
