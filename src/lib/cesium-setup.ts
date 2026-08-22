'use client';

if (typeof window !== 'undefined') {
  (window as any).CESIUM_BASE_URL = '/cesium/';

  // Configure Cesium Ion Access Token or clear expired default
  const ionToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || '';
  if ((window as any).Cesium) {
    (window as any).Cesium.Ion.defaultAccessToken = ionToken;
  }
}
