import React, { useEffect } from 'react';

interface OnboardingModalProps {
  onStart: () => void;
  onSkip: () => void;
}

const steps = [
  {
    emoji: '🌍',
    title: 'Explore the Globe',
    description: 'Navigate global future intelligence visually.',
  },
  {
    emoji: '📰',
    title: 'Future Intelligence Feed',
    description: 'Discover emerging technological, climatic, and geopolitical developments.',
  },
  {
    emoji: '🔮',
    title: 'Predictions',
    description: 'Explore possible future scenarios and probability forecasts.',
  },
  {
    emoji: '💬',
    title: 'FutureChat',
    description: 'Discuss ideas about the future with the community.',
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onStart, onSkip }) => {
  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-50 animate-fade-in pointer-events-auto">
      <div className="premium-glass p-8 w-11/12 max-w-md text-center">
        <h2 className="text-xl font-bold text-white mb-2 tracking-wide font-display">Welcome to ChronoEarth</h2>
        <p className="text-xs text-[#8CA8B8] mb-6">Explore the future through an interactive intelligence platform.</p>
        <ul className="space-y-4 text-left mb-6">
          {steps.map((step, idx) => (
            <li key={idx} className="flex items-start space-x-3">
              <span className="text-xl">{step.emoji}</span>
              <div>
                <p className="text-sm font-medium text-[#EAF7FF]">{step.title}</p>
                <p className="text-[11px] text-[#8CA8B8] font-light leading-relaxed">{step.description}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex justify-center gap-4">
          <button
            onClick={onStart}
            className="px-5 py-2 bg-[#00E5FF] hover:bg-[#6FEAFF] text-black font-mono font-semibold text-[10px] tracking-widest uppercase rounded transition-colors shadow-[0_0_15px_rgba(0,229,255,0.2)] cursor-pointer"
          >
            Start Exploring
          </button>
          <button
            onClick={onSkip}
            className="px-5 py-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-[#8CA8B8] hover:text-white font-mono text-[10px] tracking-widest uppercase rounded transition-colors cursor-pointer"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

