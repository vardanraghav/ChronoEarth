'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MapRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard?view=map');
  }, [router]);

  return (
    <div className="h-screen w-screen bg-[#02060A] flex flex-col items-center justify-center font-mono text-[11px] text-white/50 tracking-[0.35em] uppercase">
      <div className="flex items-center gap-2.5">
        <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
        <span>REDIRECTING TO MAP GRID...</span>
      </div>
    </div>
  );
}
