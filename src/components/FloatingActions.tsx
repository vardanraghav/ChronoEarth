'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function FloatingActions() {
  const pathname = usePathname();

  // Do not display these floating buttons on login/signup pages to keep them clean
  const hideOnPaths = ['/login', '/signup'];
  if (hideOnPaths.includes(pathname)) {
    return null;
  }

  const isPredictionsActive = pathname.startsWith('/predictions');
  const isFutureChatActive = pathname.startsWith('/futurechat');

  return (
    <>
      {/* Bottom-Left: Predictions Action Button */}
      <div className="fixed bottom-6 left-6 z-40 md:bottom-8 md:left-8">
        <Link
          href="/predictions"
          id="float-predictions"
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full border transition-all duration-300 font-mono text-xs uppercase tracking-wider no-underline shadow-[0_0_12px_rgba(0,229,255,0.05)] hover:scale-105 active:scale-95 ${
            isPredictionsActive
              ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.3)]'
              : 'bg-black/75 border-[#00E5FF]/20 text-white/80 hover:text-white hover:border-[#00E5FF]/60 hover:shadow-[0_0_18px_rgba(0,229,255,0.2)]'
          }`}
          style={{
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <span 
            className={`text-sm transition-transform duration-300 ${
              isPredictionsActive ? 'scale-110 rotate-12 animate-pulse' : 'group-hover:scale-110'
            }`}
          >
            🔮
          </span>
          <span className="font-semibold tracking-widest">Predictions</span>
        </Link>
      </div>

      {/* Bottom-Right: FutureChat Action Button */}
      <div className="fixed bottom-6 right-6 z-40 md:bottom-8 md:right-8">
        <Link
          href="/futurechat"
          id="float-futurechat"
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full border transition-all duration-300 font-mono text-xs uppercase tracking-wider no-underline shadow-[0_0_12px_rgba(0,229,255,0.05)] hover:scale-105 active:scale-95 ${
            isFutureChatActive
              ? 'bg-[#00F5B0]/15 border-[#00F5B0] text-[#00F5B0] shadow-[0_0_20px_rgba(0,245,176,0.3)]'
              : 'bg-black/75 border-[#00E5FF]/20 text-white/80 hover:text-white hover:border-[#00F5B0]/60 hover:shadow-[0_0_18px_rgba(0,245,176,0.2)]'
          }`}
          style={{
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <span 
            className={`text-sm transition-transform duration-300 ${
              isFutureChatActive ? 'scale-110 animate-bounce' : 'group-hover:scale-110'
            }`}
          >
            💬
          </span>
          <span className="font-semibold tracking-widest">FutureChat</span>
        </Link>
      </div>
    </>
  );
}
