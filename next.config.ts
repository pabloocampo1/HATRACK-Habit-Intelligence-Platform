import type { NextConfig } from "next";
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} from "next/constants";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {},
};

export default function config(phase: string) {
  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const withPWA = require("@ducanh2912/next-pwa").default({
      dest: "public",
      disable: phase === PHASE_DEVELOPMENT_SERVER,
      register: true,
      skipWaiting: true,
      reloadOnOnline: true,
      cacheOnFrontEndNav: true,
      aggressiveFrontEndNavCaching: true,
      fallbacks: {
        document: "/offline",
      },
      workboxOptions: {
        disableDevLogs: true,
      },
    });
    return withPWA(nextConfig);
  }
  return nextConfig;
}
