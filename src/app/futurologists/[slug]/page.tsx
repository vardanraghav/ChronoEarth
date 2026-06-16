'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import { FUTUROLOGISTS, PREDICTIONS } from '@/data/predictionsData';

const C = {
  emerald: '#00E5FF',
  cyan: '#6FEAFF',
  iceBlue: '#6FEAFF',
  white: '#F5F7FA',
  bg: 'rgba(10, 20, 35, 0.55)',
  border: 'rgba(0, 229, 255, 0.15)',
};

interface Params {
  slug: string;
}

export default function FuturologistDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = use(params);
  
  const f = FUTUROLOGISTS.find(fut => fut.slug === slug);
  const [avatarError, setAvatarError] = useState(false);

  if (!f) {
    return (
      <main className="h-screen w-screen bg-[#02060B] flex flex-col items-center justify-center text-white gap-4">
        <div>Portfolio data link broken</div>
        <Link href="/futurologists" className="text-[#00E5FF] hover:underline">← Return to directory</Link>
      </main>
    );
  }

  // Filter predictions authored by this futurologist
  const authorPredictions = PREDICTIONS.filter(p => p.author === f.name);

  return (
    <main className="h-screen w-screen overflow-y-auto bg-[#02060B] text-[#e2e8f0] relative custom-scrollbar">
      <BackgroundEffects earthMode="cyber" />
      
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[rgba(10, 20, 35, 0.75)] to-transparent pointer-events-none z-10" />

      <Navbar earthMode="cyber" />

      <div className="reading-container pt-36 pb-24 relative z-20 flex flex-col gap-8 animate-fade-up">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#00E5FF]">
          <Link href="/futurologists" className="hover:text-white transition-colors">Futurologists</Link>
          <span>/</span>
          <span className="text-[#7A8694]">{f.name}</span>
        </div>

        {/* 2-Column Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Bio Sheet - Tier 1 */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="card-tier-1 flex flex-col gap-6">
              
              <div className="flex flex-col items-center gap-4 text-center">
                {avatarError ? (
                  <div className="w-28 h-28 rounded-full border-2 border-[#00E5FF] flex items-center justify-center bg-[#040B12] text-xl font-mono text-[#00E5FF] font-bold shadow-[0_0_20px_rgba(0, 229, 255,0.15)] shrink-0">
                    {f.name.split(' ').map(n => n[0]).join('')}
                  </div>
                ) : (
                  <img 
                    src={f.avatar} 
                    alt={f.name} 
                    loading="lazy"
                    onError={() => setAvatarError(true)}
                    className="w-28 h-28 rounded-full border-2 border-[#00E5FF] object-cover shadow-none shrink-0"
                  />
                )}
                <div>
                  <h1 className="text-2xl font-light text-white">{f.name}</h1>
                  <span className="text-xs text-[#00E5FF] block mt-1">{f.role}</span>
                </div>
              </div>

              <div className="border-t border-[#00E5FF]/15 pt-4 flex flex-col gap-3 text-xs">
                <div>
                  <span className="text-[#7A8694] block">Specialization area</span>
                  <span className="text-[#6FEAFF]">{f.specialization}</span>
                </div>
                <div>
                  <span className="text-[#7A8694] block">Total timeline contributions</span>
                  <span className="text-white"><span className="font-mono">{f.contributions}</span> projections</span>
                </div>
                <div>
                  <span className="text-[#7A8694] block">Forecast influence rating</span>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-2 bg-[#040B12] border border-[#00E5FF]/15 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#00E5FF] rounded-full"
                        style={{ width: `${f.influenceScore}%` }}
                      />
                    </div>
                    <span className="text-[#00E5FF] font-mono">{f.influenceScore}%</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#00E5FF]/15 pt-4 text-xs text-[#7A8694] leading-relaxed">
                <span className="text-[#7A8694] block mb-2">Biographical details</span>
                {f.bio}
              </div>
            </div>
          </div>

          {/* Right Column: Expert Predictions Feed - Tier 2 */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="card-tier-2 h-full flex flex-col gap-6">
              
              <div className="flex items-center gap-3 border-b border-[#00E5FF]/15 pb-4">
                <h2 className="text-lg font-light text-white">
                  Active forecasts by <span className="text-[#00E5FF]">{f.name}</span>
                </h2>
              </div>

              {/* Predictions List */}
              <div className="flex flex-col gap-5">
                {authorPredictions.length === 0 ? (
                  <div className="text-center py-10 text-xs text-[#7A8694]">
                    No active projections on record for this specialist.
                  </div>
                ) : (
                  authorPredictions.map(p => (
                    <div 
                      key={p.id}
                      className="card-tier-3 flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 bg-[#040B12] text-[#00E5FF] border border-[#00E5FF]/15 rounded-sm">{p.category}</span>
                          <span className="px-2 py-0.5 bg-[#040B12] text-[#00E5FF] border border-emerald-500/15 rounded-sm">{p.year} forecast</span>
                        </div>
                        <span className="text-[#7A8694]">Confidence: <span className="font-mono">{p.confidenceScore}%</span></span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <h3 className="text-base font-light text-white">{p.title}</h3>
                        <p className="text-xs text-[#7A8694] leading-relaxed">{p.description}</p>
                      </div>

                      <div className="flex justify-between items-center border-t border-[#00E5FF]/15 pt-3 text-xs text-[#7A8694]">
                        <span>Location: {p.city}</span>
                        <Link 
                          href={`/predictions/${p.slug}`}
                          className="text-[#00E5FF] hover:underline"
                        >
                          Analyze forecast →
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
