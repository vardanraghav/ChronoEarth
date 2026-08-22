'use client';

interface BackgroundEffectsProps {
  earthMode?: 'realistic' | 'cyber';
}

export default function BackgroundEffects({ earthMode = 'realistic' }: BackgroundEffectsProps) {
  return (
    <div 
      id="space-background"
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      style={{
        backgroundColor: '#000000',
      }}
    />
  );
}
