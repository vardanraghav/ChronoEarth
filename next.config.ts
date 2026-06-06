import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable dev indicators (removes Next.js 'N' logo circle in bottom-left)
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  } as any,

  // ── Turbopack config (Next.js 16 dev default) ─────────────────────────
  // Empty config silences the "webpack config but no turbopack config" warning.
  turbopack: {},

  // ── Webpack config (used by Vercel production builds) ─────────────────
  webpack(config, { isServer }) {
    if (!isServer) {
      // client-side: treat 'cesium' as an external variable, mapping it to the global 'Cesium' object.
      config.externals = {
        ...config.externals,
        cesium: "Cesium",
      };
    } else {
      // server-side: mark 'cesium' as external so Node doesn't try to bundle it.
      const existing = config.externals ?? [];
      const arr = Array.isArray(existing) ? existing : [existing];
      config.externals = [...arr, "cesium"];
    }

    return config;
  },
};

export default nextConfig;
