'use client';

import { Ion } from 'cesium';

if (typeof window !== 'undefined') {
  (window as any).CESIUM_BASE_URL = '/cesium/';

  // Configure optional Cesium Ion Access Token
  const ionToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
  if (ionToken) {
    Ion.defaultAccessToken = ionToken;
  }
}
