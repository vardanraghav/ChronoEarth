'use client';

if (typeof window !== 'undefined') {
  (window as any).CESIUM_BASE_URL = '/cesium/';

  // Configure optional Cesium Ion Access Token
  const ionToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
  if (ionToken && (window as any).Cesium) {
    (window as any).Cesium.Ion.defaultAccessToken = ionToken;
  }
}
