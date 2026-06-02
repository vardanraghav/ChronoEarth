'use client';

import { useEffect, useState } from 'react';

interface Category {
  icon: string;
  label: string;
}

const categories: Category[] = [
  { icon: '🌊', label: 'Ocean Monitoring' },
  { icon: '🌿', label: 'Biodiversity' },
  { icon: '⚡', label: 'Clean Energy' },
  { icon: '🛰️', label: 'Satellite Network' },
];

interface CategoryCardsProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export default function CategoryCards({ activeCategory, setActiveCategory }: CategoryCardsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        .category-card {
          transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .category-card:hover {
          transform: scale(1.05) translateX(-4px);
          border-color: rgba(0, 240, 255, 0.4) !important;
          box-shadow:
            0 0 20px rgba(0, 240, 255, 0.08),
            0 0 40px rgba(0, 240, 255, 0.04),
            inset 0 0 20px rgba(0, 240, 255, 0.03);
        }
        .category-card:hover .cat-label {
          color: #00f0ff !important;
          text-shadow: 0 0 10px rgba(0, 240, 255, 0.4);
        }
        .category-card:hover .cat-icon {
          transform: scale(1.15);
        }
        .cat-icon {
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div
        className="fixed top-[76px] lg:top-1/2 left-0 lg:left-auto right-0 lg:right-6 xl:right-10 lg:-translate-y-1/2 z-30 flex flex-row lg:flex-col gap-2.5 overflow-x-auto lg:overflow-visible px-6 lg:px-0 pb-3 lg:pb-0 scrollbar-none justify-start lg:justify-center"
      >
        {categories.map((cat, i) => {
          const isActive = activeCategory === cat.label;
          return (
            <div
              key={cat.label}
              onClick={() => setActiveCategory(cat.label)}
              className="category-card rounded-lg px-4 py-2.5 lg:px-5 lg:py-3.5 cursor-pointer flex items-center gap-2 lg:gap-3 min-w-[145px] lg:min-w-[170px]"
              style={{
                flexShrink: 0,
                background: isActive ? 'rgba(6, 12, 30, 0.8)' : 'rgba(6, 9, 24, 0.55)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: isActive
                  ? '1px solid rgba(0, 240, 255, 0.45)'
                  : '1px solid rgba(139, 92, 246, 0.15)',
                boxShadow: isActive
                  ? '0 0 20px rgba(0, 240, 255, 0.1), inset 0 0 10px rgba(0, 240, 255, 0.03)'
                  : 'none',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(40px)',
                transition: `opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${0.2 + i * 0.1}s, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${0.2 + i * 0.1}s, border-color 0.35s ease, box-shadow 0.35s ease, background 0.35s ease`,
              }}
            >
              {/* Icon */}
              <span className="cat-icon text-lg leading-none select-none">{cat.icon}</span>

              {/* Label */}
              <span
                className="cat-label text-xs font-light"
                style={{
                  letterSpacing: '0.08em',
                  color: isActive ? '#00f0ff' : 'rgba(255, 255, 255, 0.55)',
                  textShadow: isActive ? '0 0 10px rgba(0, 240, 255, 0.4)' : 'none',
                  transition: 'color 0.35s ease, text-shadow 0.35s ease',
                }}
              >
                {cat.label}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
