'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface TourStep {
  title: string;
  description: string;
  target?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to ChronoEarth',
    description: 'ChronoEarth is an AI-powered Future Intelligence Platform that combines planetary monitoring, predictive intelligence, live signals, knowledge systems, and AI analysis into a unified interface.',
  },
  {
    title: 'Planetary Map & Orbit (Step 1 of 7)',
    description: 'Explore Earth visualization, future timelines, planetary data layers, and geographic intelligence.',
    target: '#nav-map',
  },
  {
    title: 'Intelligence Dashboard (Step 2 of 7)',
    description: 'View real-time intelligence signals, alerts, forecasts, and operational metrics.',
    target: '#nav-dashboard',
  },
  {
    title: 'Live Intel Feed (Step 3 of 7)',
    description: 'Monitor live information streams, news signals, research updates, and emerging trends.',
    target: '#nav-intelfeed',
  },
  {
    title: 'Future Predictions Engine (Step 4 of 7)',
    description: 'Explore future forecasts, simulations, scenario modeling, and timeline projections.',
    target: '#float-predictions',
  },
  {
    title: 'Foresight Codex / Knowledge Base (Step 5 of 7)',
    description: 'Access research dossiers, technology intelligence, scientific concepts, and strategic knowledge systems.',
    target: '#nav-knowledge',
  },
  {
    title: 'FutureChat Terminal (Step 6 of 7)',
    description: 'Interact with ChronoAI to ask questions, analyze trends, and explore future possibilities.',
    target: '#float-futurechat',
  },
  {
    title: 'Sensors & Telemetry Channels (Step 7 of 7)',
    description: 'Track live climate, seismic, market, space, and environmental monitoring systems.',
    target: '#nav-sensors',
  },
  {
    title: "You're Ready to Explore ChronoEarth",
    description: 'The platform is now ready. Explore intelligence feeds, predictions, simulations, planetary monitoring, and AI-powered analysis.',
  }
];

export default function OnboardingTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  // Check if first-time visitor
  useEffect(() => {
    const completed = localStorage.getItem('chronoearth_tour_completed');
    if (!completed) {
      setIsActive(true);
    }

    // Listen to manual restart events
    const handleRestart = () => {
      setCurrentStep(0);
      setIsActive(true);
    };

    window.addEventListener('start-chronoearth-tour', handleRestart);
    return () => {
      window.removeEventListener('start-chronoearth-tour', handleRestart);
    };
  }, []);

  // Update spotlight rect when step changes or window updates
  const updateSpotlight = useCallback(() => {
    if (!isActive) {
      setRect(null);
      return;
    }

    const step = TOUR_STEPS[currentStep];
    if (!step || !step.target) {
      setRect(null);
      return;
    }

    const el = document.querySelector(step.target);
    if (el) {
      const clientRect = el.getBoundingClientRect();
      if (clientRect.width > 0 && clientRect.height > 0) {
        setRect({
          top: clientRect.top + window.scrollY,
          left: clientRect.left + window.scrollX,
          width: clientRect.width,
          height: clientRect.height
        });
        return;
      }
    }
    setRect(null);
  }, [isActive, currentStep]);

  useEffect(() => {
    updateSpotlight();
    window.addEventListener('resize', updateSpotlight);
    window.addEventListener('scroll', updateSpotlight);

    return () => {
      window.removeEventListener('resize', updateSpotlight);
      window.removeEventListener('scroll', updateSpotlight);
    };
  }, [updateSpotlight]);

  // Keyboard navigation & ESC key
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        completeTour();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Enter') {
        if (currentStep === TOUR_STEPS.length - 1) {
          completeTour();
        } else {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, currentStep]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeTour = () => {
    localStorage.setItem('chronoearth_tour_completed', 'true');
    setIsActive(false);
  };

  if (!isActive) return null;

  const step = TOUR_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden select-none pointer-events-none">
      
      {/* SVG Mask Spotlight cutout */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left - 6}
                y={rect.top - 6}
                width={rect.width + 12}
                height={rect.height + 12}
                rx="12"
                ry="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(2, 6, 12, 0.75)"
          mask="url(#spotlight-mask)"
          className="backdrop-blur-[2px] transition-all duration-300"
          onClick={completeTour}
        />
      </svg>

      {/* Cyber dashed spotlight border with glow */}
      {rect && (
        <div
          className="absolute transition-all duration-300 rounded-xl"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            border: '2px dashed #00E5FF',
            boxShadow: '0 0 15px rgba(0, 229, 255, 0.6), inset 0 0 8px rgba(0, 229, 255, 0.2)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Main Tour HUD Dialogue Card */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 flex flex-col justify-between max-w-md w-[calc(100vw-48px)] p-6 md:p-8 rounded-2xl premium-glass border pointer-events-auto animate-fade-in text-left shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(0,229,255,0.05)] transition-all duration-300"
        style={{
          top: isFirst || isLast ? '50%' : '65%',
          transform: isFirst || isLast ? 'translate(-50%, -50%)' : 'translate(-50%, -50%)',
          backgroundColor: 'rgba(2, 8, 16, 0.95)',
          borderColor: 'rgba(0, 229, 255, 0.25)',
        }}
      >
        {/* Skip button at top right */}
        {!isLast && (
          <button
            onClick={completeTour}
            className="absolute top-4 right-4 bg-transparent border-none text-[#7A8694] hover:text-white text-[9px] font-mono tracking-wider cursor-pointer uppercase py-1"
          >
            [Skip Tour]
          </button>
        )}

        <div className="flex flex-col gap-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
            <span className="text-[9px] text-[#00E5FF] tracking-[0.25em] uppercase font-semibold">
              {isFirst ? 'CHRONOEARTH DIRECTIVE' : isLast ? 'SYSTEMS INITIATED' : 'INTERFACE TUTORIAL'}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-light text-white tracking-wide uppercase m-0 leading-tight">
              {step.title}
            </h2>
            <p className="text-xs text-[#8CA8B8] leading-relaxed font-sans font-light m-0 mt-2">
              {step.description}
            </p>
          </div>

          {/* Progress dots bar */}
          {!isFirst && !isLast && (
            <div className="flex gap-1.5 mt-2">
              {TOUR_STEPS.slice(1, -1).map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === currentStep - 1 ? 'w-6 bg-[#00E5FF]' : 'w-1.5 bg-white/10'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between items-center gap-4 mt-4 border-t border-white/5 pt-4">
            {isFirst ? (
              <>
                <button
                  onClick={completeTour}
                  className="px-4 py-2 border border-white/15 hover:border-white/30 text-white/70 hover:text-white rounded-lg text-xs font-mono tracking-wider uppercase bg-transparent cursor-pointer transition-all duration-300"
                >
                  Skip Tour
                </button>
                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 bg-[#00E5FF] hover:bg-[#00B9D1] text-[#02060A] rounded-lg text-xs font-bold font-mono tracking-wider uppercase cursor-pointer transition-all duration-300 shadow-[0_0_12px_rgba(0,229,255,0.3)]"
                >
                  Start Tour →
                </button>
              </>
            ) : isLast ? (
              <button
                onClick={completeTour}
                className="w-full py-3 bg-[#00F5B0] hover:bg-[#00D98F] text-[#02060A] rounded-lg text-xs font-bold font-mono tracking-widest uppercase cursor-pointer transition-all duration-300 shadow-[0_0_15px_rgba(0,245,176,0.35)] text-center"
              >
                Enter Platform
              </button>
            ) : (
              <>
                <button
                  onClick={handlePrev}
                  className="px-4 py-2 border border-white/10 hover:border-white/20 text-[#7A8694] hover:text-white rounded-lg text-xs font-mono tracking-wider uppercase bg-transparent cursor-pointer transition-all duration-300"
                >
                  ← Previous
                </button>
                <button
                  onClick={handleNext}
                  className="px-5 py-2 bg-[#00E5FF]/10 hover:bg-[#00E5FF] border border-[#00E5FF]/40 hover:border-transparent text-[#00E5FF] hover:text-[#02060A] rounded-lg text-xs font-semibold font-mono tracking-wider uppercase cursor-pointer transition-all duration-300 shadow-[0_0_10px_rgba(0,229,255,0.1)]"
                >
                  Next step →
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
