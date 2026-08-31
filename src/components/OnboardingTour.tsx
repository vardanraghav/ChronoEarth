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
    description: 'An AI-powered future intelligence platform combining live planetary monitoring, forecasting, semiconductor intelligence, research knowledge, and scenario simulation.',
  },
  {
    title: 'DASHBOARD',
    description: "Dashboard is ChronoEarth’s primary workspace. Use Feed to monitor intelligence through the Command Desk, or switch to Map to explore the same intelligence spatially on the 3D Earth.",
    target: '#nav-map',
  },
  {
    title: 'FEED MODE',
    description: "Feed is the primary Dashboard view, bringing ChronoEarth’s intelligence streams and Command Desk into one place.",
    target: '#dashboard-switcher-feed',
  },
  {
    title: 'MAP MODE',
    description: "Map switches the Dashboard into the orbital intelligence view, where planetary layers and intelligence signals are visualized directly on Earth.",
    target: '#dashboard-switcher-map',
  },
  {
    title: 'INTEL FEED',
    description: 'Track real-time technological, geopolitical, environmental, and scientific developments in the standalone Intel Feed.',
    target: '#nav-intelfeed',
  },
  {
    title: 'SEMICONDUCTOR TERMINAL',
    description: 'Analyze semiconductor supply chains, AI chip competition, foundry intelligence, HBM markets, and geopolitical risks.',
    target: '#nav-semiconductor',
  },
  {
    title: 'KNOWLEDGE BASE',
    description: 'Access future technology dossiers, scientific concepts, climate research, AI developments, and strategic forecasts.',
    target: '#nav-knowledge',
  },
  {
    title: 'ABOUT',
    description: 'Explore the vision, system documentation, and architecture code behind ChronoEarth.',
    target: '#nav-about',
  },
  {
    title: 'SENSORS',
    description: "Sensors provides access to ChronoEarth’s intelligence systems, including semiconductor, climate, space, seismic and market monitoring.",
    target: '#nav-sensors',
  },
  {
    title: 'INTELLIGENCE SYSTEMS',
    description: "This menu contains ChronoEarth’s specialized intelligence systems.",
    target: '#sensors-dropdown',
  },
  {
    title: 'SOURCES & CREDITS',
    description: "Sources & Credits shows the data sources, technology providers and attribution behind ChronoEarth.",
    target: '#sensor-sources',
  },
  {
    title: 'COMMS UPLINK',
    description: "Comms Uplink provides a channel for submitting diagnostic telemetry and system feedback.",
    target: '#sensor-feedback',
  },
  {
    title: 'SEARCH',
    description: 'Query the planetary intelligence index using the global Search engine (Ctrl+K).',
    target: '#nav-search',
  },
  {
    title: 'SETTINGS',
    description: 'Configure interface parameters, map projection styles, and simulation defaults.',
    target: '#nav-settings',
  },
  {
    title: 'FUTURECHAT',
    description: 'Interact with ChronoEarth AI to explore future technologies, trends, risks, and opportunities.',
    target: '#float-futurechat',
  },
  {
    title: "You’re now connected to the ChronoEarth Intelligence Network.",
    description: 'The platform is now ready. Explore intelligence feeds, predictions, simulations, planetary monitoring, and AI-powered analysis.',
  }
];

export default function OnboardingTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);

  // 1. Detect when the application UI is fully loaded/rendered in the DOM
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const navElement = document.querySelector('#nav-map');
      if (navElement) {
        setIsAppReady(true);
        clearInterval(checkInterval);
      }
    }, 200);

    return () => clearInterval(checkInterval);
  }, []);

  // 2. Monitor window size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 3. Check if first-time visitor only after application UI is ready
  useEffect(() => {
    if (!isAppReady) return;

    const completed = localStorage.getItem('chronoearth-tour-completed');
    if (completed !== 'true') {
      setIsActive(true);
    }
  }, [isAppReady]);

  // 4. Listen to manual restart events
  useEffect(() => {
    const handleRestart = () => {
      localStorage.removeItem('chronoearth-tour-completed');
      setCurrentStep(0);
      setIsActive(true);
    };

    window.addEventListener('start-chronoearth-tour', handleRestart);
    return () => {
      window.removeEventListener('start-chronoearth-tour', handleRestart);
    };
  }, []);

  // Enforce Sensors dropdown state on step changes
  useEffect(() => {
    if (!isActive) return;
    const step = TOUR_STEPS[currentStep];
    if (!step) return;

    const isSensorsStep = step.title === 'INTELLIGENCE SYSTEMS' || step.title === 'SOURCES & CREDITS' || step.title === 'COMMS UPLINK';

    const checkAndEnforce = () => {
      if (isSensorsStep) {
        window.dispatchEvent(new CustomEvent('chronoearth-tour-sensors-open'));
      } else {
        window.dispatchEvent(new CustomEvent('chronoearth-tour-sensors-close'));
      }
    };

    checkAndEnforce();

    if (isSensorsStep) {
      const interval = setInterval(checkAndEnforce, 300);
      return () => clearInterval(interval);
    }
  }, [currentStep, isActive]);

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

    let targetSelector = step.target;
    if (isMobile) {
      if (targetSelector === '#nav-sensors') targetSelector = '#mobile-menu-trigger';
      else if (targetSelector === '#sensors-dropdown') targetSelector = '#mobile-sensors-section';
      else if (targetSelector === '#sensor-sources') targetSelector = '#mobile-sensor-sources';
      else if (targetSelector === '#sensor-feedback') targetSelector = '#mobile-sensor-feedback';
    }

    const el = document.querySelector(targetSelector);
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
  }, [isActive, currentStep, isMobile]);

  useEffect(() => {
    updateSpotlight();
    const timer = setTimeout(updateSpotlight, 150);

    window.addEventListener('resize', updateSpotlight);
    window.addEventListener('scroll', updateSpotlight);

    return () => {
      clearTimeout(timer);
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
    localStorage.setItem('chronoearth-tour-completed', 'true');
    setIsActive(false);
  };

  if (!isActive) return null;

  const step = TOUR_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  // Determine modal card positioning dynamically to prevent overlap
  const isSensorsStep = step.title === 'INTELLIGENCE SYSTEMS' || step.title === 'SOURCES & CREDITS' || step.title === 'COMMS UPLINK';
  
  let cardPositionStyle: React.CSSProperties = {};

  if (!isMobile) {
    if (isSensorsStep) {
      cardPositionStyle = {
        left: '80px',
        right: 'auto',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 'calc(100vw - 120px)',
        maxWidth: '448px',
        maxHeight: 'none',
        padding: '32px',
      };
    } else {
      cardPositionStyle = {
        left: '50%',
        right: 'auto',
        top: isFirst || isLast ? '50%' : '65%',
        transform: 'translate(-50%, -50%)',
        width: 'calc(100vw - 48px)',
        maxWidth: '448px',
        maxHeight: 'none',
        padding: '32px',
      };
    }
  } else {
    let topValue = '50%';
    let bottomValue = 'auto';
    let transformValue = 'translateY(-50%)';

    if (rect) {
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
      const elementCenterY = rect.top - (typeof window !== 'undefined' ? window.scrollY : 0) + rect.height / 2;
      
      if (elementCenterY < viewportHeight / 2) {
        topValue = 'auto';
        bottomValue = '16px';
        transformValue = 'none';
      } else {
        topValue = '90px';
        bottomValue = 'auto';
        transformValue = 'none';
      }
    } else if (!isFirst && !isLast) {
      topValue = '65%';
    }

    cardPositionStyle = {
      left: '16px',
      right: '16px',
      top: topValue,
      bottom: bottomValue,
      transform: transformValue,
      width: 'calc(100vw - 32px)',
      maxWidth: 'none',
      margin: '0 auto',
      maxHeight: 'calc(100vh - 120px)',
      padding: '24px',
    };
  }

  return (
    <div className="fixed inset-0 w-screen h-screen z-[9999] overflow-hidden select-none pointer-events-none">
      
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
        className="fixed flex flex-col justify-between rounded-2xl premium-glass border pointer-events-auto animate-fade-in text-left shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(0,229,255,0.05)] transition-all duration-300 overflow-y-auto"
        style={{
          boxSizing: 'border-box',
          backgroundColor: 'rgba(2, 8, 16, 0.95)',
          borderColor: 'rgba(0, 229, 255, 0.25)',
          ...cardPositionStyle
        }}
      >
        {/* Skip button at top right */}
        {!isLast && (
          <button
            onClick={completeTour}
            className="absolute top-4 right-4 bg-transparent border-none text-[#7A8694] hover:text-white text-[9px] font-mono tracking-wider cursor-pointer uppercase py-2 px-3 min-h-[36px]"
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
                  className="px-4 py-2 border border-white/15 hover:border-white/30 text-white/70 hover:text-white rounded-lg text-xs font-mono tracking-wider uppercase bg-transparent cursor-pointer transition-all duration-300 min-h-[44px] flex items-center justify-center"
                >
                  Skip Tour
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-[#00E5FF] hover:bg-[#00B9D1] text-[#02060A] rounded-lg text-xs font-bold font-mono tracking-wider uppercase cursor-pointer transition-all duration-300 shadow-[0_0_12px_rgba(0,229,255,0.3)] min-h-[44px] flex items-center justify-center"
                >
                  Start Tour →
                </button>
              </>
            ) : isLast ? (
              <button
                onClick={completeTour}
                className="w-full py-3 bg-[#00F5B0] hover:bg-[#00D98F] text-[#02060A] rounded-lg text-xs font-bold font-mono tracking-widest uppercase cursor-pointer transition-all duration-300 shadow-[0_0_15px_rgba(0,245,176,0.35)] text-center min-h-[44px]"
              >
                Enter Platform
              </button>
            ) : (
              <>
                <button
                  onClick={handlePrev}
                  className="px-4 py-2 border border-white/10 hover:border-white/20 text-[#7A8694] hover:text-white rounded-lg text-xs font-mono tracking-wider uppercase bg-transparent cursor-pointer transition-all duration-300 min-h-[44px] flex items-center justify-center"
                >
                  ← Previous
                </button>
                <button
                  onClick={handleNext}
                  className="px-5 py-2 bg-[#00E5FF]/10 hover:bg-[#00E5FF] border border-[#00E5FF]/40 hover:border-transparent text-[#00E5FF] hover:text-[#02060A] rounded-lg text-xs font-semibold font-mono tracking-wider uppercase cursor-pointer transition-all duration-300 shadow-[0_0_10px_rgba(0,229,255,0.1)] min-h-[44px] flex items-center justify-center"
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
