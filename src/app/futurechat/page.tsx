'use client';

import { Suspense } from 'react';
import FutureChatCore from '@/components/FutureChatCore';

export default function FutureChatPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen bg-[#02060A] flex items-center justify-center font-mono text-[#00F5B0] text-xs">
        CONNECTING TO FUTURECHAT CORE...
      </div>
    }>
      <FutureChatCore />
    </Suspense>
  );
}
