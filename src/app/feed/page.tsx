'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import { usePredictions } from '@/hooks/usePredictions';
import { useFuturologists } from '@/hooks/useFuturologists';
import Footer from '@/components/Footer';
import SafeImage from '@/components/SafeImage';
import { getPredictionImage, getPredictionCategoryFallback } from '@/lib/imageUtils';

export default function FeedPage() {
  const { predictions } = usePredictions();
  const { futurologists } = useFuturologists();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [visibleCount, setVisibleCount] = useState(6);
  const [loadingMore, setLoadingMore] = useState(false);

  // Load votes from localStorage
  useEffect(() => {
    try {
      const savedVotes = localStorage.getItem('chrono_votes');
      if (savedVotes) {
        setVotes(JSON.parse(savedVotes));
      }
    } catch (e) {
      // Handle error silently
    }
  }, []);

  const getVotesCount = (p: any) => {
    return p.initialVotes + (votes[p.id] || 0);
  };

  // Categories list
  const categories = ['All', 'AI', 'Climate', 'Energy', 'Space', 'Cities', 'Transport', 'Healthcare', 'Society'];

  const getCategoryStyle = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('ai')) return { color: '#00F5D4', shadow: 'rgba(0, 245, 212, 0.18)', bg: 'rgba(0, 245, 212, 0.04)', border: 'rgba(0, 245, 212, 0.25)' };
    if (cat.includes('climate')) return { color: '#FF0055', shadow: 'rgba(255, 0, 85, 0.18)', bg: 'rgba(255, 0, 85, 0.04)', border: 'rgba(255, 0, 85, 0.25)' };
    if (cat.includes('energy')) return { color: '#00F5B0', shadow: 'rgba(0, 245, 176, 0.18)', bg: 'rgba(0, 245, 176, 0.04)', border: 'rgba(0, 245, 176, 0.25)' };
    if (cat.includes('space')) return { color: '#BF5AF2', shadow: 'rgba(191, 90, 242, 0.18)', bg: 'rgba(191, 90, 242, 0.04)', border: 'rgba(191, 90, 242, 0.25)' };
    if (cat.includes('cities')) return { color: '#0A84FF', shadow: 'rgba(10, 132, 255, 0.18)', bg: 'rgba(10, 132, 255, 0.04)', border: 'rgba(10, 132, 255, 0.25)' };
    if (cat.includes('transport')) return { color: '#CCFF00', shadow: 'rgba(204, 255, 0, 0.18)', bg: 'rgba(204, 255, 0, 0.04)', border: 'rgba(204, 255, 0, 0.25)' };
    if (cat.includes('healthcare')) return { color: '#00E5FF', shadow: 'rgba(0, 229, 255, 0.18)', bg: 'rgba(0, 229, 255, 0.04)', border: 'rgba(0, 229, 255, 0.25)' };
    return { color: '#00F5B0', shadow: 'rgba(0, 245, 176, 0.18)', bg: 'rgba(0, 245, 176, 0.04)', border: 'rgba(0, 245, 176, 0.25)' };
  };

  // Filter and sort predictions
  const filteredItems = predictions
    .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
    .sort((a, b) => getVotesCount(b) - getVotesCount(a));

  const handleLoadMore = () => {
    if (visibleCount >= filteredItems.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 4, filteredItems.length));
      setLoadingMore(false);
    }, 800);
  };

  // Reset page size when category changes
  useEffect(() => {
    setVisibleCount(6);
  }, [selectedCategory]);

  return (
    <main className="min-h-screen w-full bg-[#02060A] text-[#e2e8f0] relative">
      <BackgroundEffects earthMode="cyber" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[rgba(2,6,10,0.95)] to-transparent pointer-events-none z-10" />
      <Navbar />

      <div className="content-container pt-32 pb-24 relative z-20 flex flex-col gap-8 animate-fade-up">
        {/* Page Header */}
        <div className="flex flex-col gap-3 border-b border-white/5 pb-6">
          <span className="text-[10px] font-mono text-[#00F5B0] uppercase tracking-[0.25em] font-semibold">
            System Stream
          </span>
          <h1 className="editorial-title text-white tracking-tight m-0 text-3xl font-light">
            Future Intelligence <span style={{ color: '#00F5B0' }} className="font-normal">Feed</span>
          </h1>
          <p className="text-[#7A8694] font-light text-sm max-w-2xl leading-relaxed m-0">
            Real-time tracking of critical technological, geopolitical, and ecological milestones. Projections are updated via planetary simulation algorithms.
          </p>
        </div>

        {/* Category Pill Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const style = getCategoryStyle(cat);
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full font-mono text-[10px] tracking-wider uppercase border transition-all duration-300 cursor-pointer flex-shrink-0 ${
                  isActive 
                    ? 'text-white border-white bg-white/10' 
                    : 'text-[#7A8694] border-white/5 bg-white/2 hover:text-white hover:border-white/20'
                }`}
                style={isActive ? { borderColor: style.color, boxShadow: `0 0 10px ${style.shadow}`, textShadow: `0 0 5px ${style.color}` } : {}}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Feed Grid */}
        {filteredItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center font-mono text-[#7A8694] border border-white/5 bg-black/20 rounded-lg">
            <span>NO ACTIVE STREAM BROADCASTS FOUND</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.slice(0, visibleCount).map((p) => {
              const authorObj = futurologists.find(f => f.name === p.author);
              const style = getCategoryStyle(p.category);
              
              // Simulate impact summary statements based on prediction details
              let impact = "System transition underway.";
              if (p.category === 'AI') impact = "Core cognitive automation spikes ↑";
              else if (p.category === 'Energy') impact = "Energy grid costs drop ↓";
              else if (p.category === 'Climate') impact = "Planetary stress thresholds reached";
              else if (p.category === 'Space') impact = "Orbital cargo shipping costs drop ↓";
              else if (p.category === 'Cities') impact = "Urban decentralization vectors increase ↑";

              const isSpace = p.category === 'Space';
              const targetImage = isSpace 
                ? (getPredictionImage(p) || getPredictionCategoryFallback(p.category)) 
                : (getPredictionImage(p) || getPredictionCategoryFallback(p.category));

              // Map prediction category to source tags
              let sourceTag = 'ChronoEarth Intelligence';
              if (p.category === 'AI') sourceTag = 'Gemini Analysis';
              else if (p.category === 'Climate') sourceTag = 'Research Synthesis';
              else if (p.category === 'Space') sourceTag = 'NASA';
              else if (p.category === 'Energy') sourceTag = 'Research Synthesis';
              else if (p.category === 'Cities') sourceTag = 'ChronoEarth Intelligence';

              // Determine timestamps dynamically using prediction fields
              // Predictions from database may have a created_at or we fallback
              let publishedTimeStr = "Timestamp unavailable";
              let relativeTimeStr = "";
              
              // Using actual database model properties mapping where possible
              const rawCreated = (p as any).created_at || (p as any).createdAt;
              if (rawCreated) {
                const dateObj = new Date(rawCreated);
                if (!isNaN(dateObj.getTime())) {
                  publishedTimeStr = `Published: ${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                  // Calculate relative time
                  const diffMs = new Date().getTime() - dateObj.getTime();
                  const diffMins = Math.floor(diffMs / 60000);
                  const diffHours = Math.floor(diffMins / 60000);
                  const diffDays = Math.floor(diffHours / 24);
                  if (diffMins < 60) {
                    relativeTimeStr = `${diffMins} minutes ago`;
                  } else if (diffHours < 24) {
                    relativeTimeStr = `${diffHours} hours ago`;
                  } else {
                    relativeTimeStr = `${diffDays} days ago`;
                  }
                }
              }

              return (
                <div 
                  key={p.id}
                  className="group premium-glass p-6 rounded-lg flex flex-col justify-between min-h-[300px] border border-white/5 hover:translate-y-[-4px] transition-all duration-300 animate-fade-in"
                  style={{
                    backgroundColor: 'rgba(4, 11, 18, 0.75)',
                    '--glow-color': style.color
                  } as any}
                >
                  <div className="flex flex-col gap-4">
                    {/* Cover Thumbnail Image */}
                    {targetImage ? (
                      <div className="w-full h-32 rounded overflow-hidden relative border border-white/5 shrink-0">
                        <SafeImage
                          src={targetImage as string}
                          fallbackSrc={getPredictionCategoryFallback(p.category)}
                          alt={p.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 350px"
                          loading="lazy"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                    ) : null}

                    {/* Category and Target Year */}
                    <div className="flex justify-between items-center text-[10px] font-mono tracking-wider">
                      <div className="flex items-center gap-2">
                        <span 
                          className="uppercase font-semibold tracking-[0.15em]" 
                          style={{ color: style.color }}
                        >
                          {p.category}
                        </span>
                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-1 py-0.5 rounded text-[8px]">
                          [{sourceTag}]
                        </span>
                      </div>
                      <span className="text-[#7A8694]">{p.year} FORECAST</span>
                    </div>

                    {/* Published and Relative Timestamps */}
                    <div className="flex justify-between items-center text-[9px] font-mono text-white/40 -mt-2">
                      <span>{publishedTimeStr}</span>
                      {relativeTimeStr && <span className="text-[#00F5B0]">{relativeTimeStr}</span>}
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-white/90 leading-snug m-0 tracking-wide group-hover:text-white transition-colors duration-300">
                      <Link href={`/predictions/${p.slug}`} className="no-underline text-white hover:opacity-85 transition-opacity">
                        {p.title}
                      </Link>
                    </h3>

                    {/* Impact statement */}
                    <div className="flex flex-col gap-1 mt-1 bg-black/40 border border-white/5 rounded p-3">
                      <span className="text-[9px] font-mono text-[#7A8694] uppercase tracking-wider">Impact Vector</span>
                      <span className="text-[11px] text-white/80 font-mono tracking-wide leading-relaxed">{impact}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 mt-6 border-t border-white/5 pt-4">
                    {/* Probability Bar */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono text-[#7A8694]">
                        <span>Probability</span>
                        <span className="font-semibold" style={{ color: style.color }}>{p.confidenceScore}%</span>
                      </div>
                      <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${p.confidenceScore}%`, 
                            backgroundColor: style.color,
                            boxShadow: `0 0 8px ${style.color}` 
                          }} 
                        />
                      </div>
                    </div>

                    {/* Futurologist credentials & Read Analysis */}
                    <div className="flex items-center justify-between mt-2 pt-1">
                      <div className="flex items-center gap-2">
                        {authorObj?.avatar ? (
                          <img 
                            src={authorObj.avatar} 
                            alt={p.author} 
                            className="w-5 h-5 rounded-full object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-mono text-white">
                            {p.author.charAt(0)}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-[10px] text-white/70 font-semibold">{p.author}</span>
                          <span className="text-[8px] text-[#7A8694] tracking-wide font-mono uppercase">{authorObj?.role || 'Strategic Futurologist'}</span>
                        </div>
                      </div>
                      <Link 
                        href={`/predictions/${p.slug}`} 
                        className="text-[10px] hover:opacity-100 font-mono no-underline transition-all uppercase tracking-wider font-semibold"
                        style={{ color: style.color, textShadow: `0 0 4px ${style.shadow}` }}
                      >
                        Decrypt →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {visibleCount < filteredItems.length && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-6 py-2.5 border border-[#00F5B0]/30 hover:border-[#00F5B0] text-[#00F5B0] font-mono text-xs rounded transition-all duration-300 bg-transparent cursor-pointer tracking-wider uppercase font-semibold disabled:opacity-50"
              style={{
                boxShadow: '0 0 10px rgba(0, 245, 176, 0.05)',
              }}
            >
              {loadingMore ? 'Decrypting Additional Streams...' : 'Load More Forecasts ↓'}
            </button>
          </div>
        )}
      </div>
      <Footer />

      <style jsx global>{`
        .group:hover {
          border-color: var(--glow-color, rgba(0, 245, 176, 0.3)) !important;
          box-shadow: 0 0 20px var(--glow-color, rgba(0, 245, 176, 0.1)) !important;
        }
      `}</style>
    </main>
  );
}
