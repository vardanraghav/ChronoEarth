'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import Footer from '@/components/Footer';

export default function SettingsPage() {
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile variables
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Preference variables
  const [theme, setTheme] = useState('cyber');
  const [timeline, setTimeline] = useState(2050);
  const [renderQuality, setRenderQuality] = useState('balanced');

  // Feedback states
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>({ text: '', type: null });

  // Load preferences from localStorage on mount
  useEffect(() => {
    setLoadingData(true);
    try {
      const storedFullName = localStorage.getItem('chrono_settings_fullName') || 'Digital Citizen';
      const storedAvatarUrl = localStorage.getItem('chrono_settings_avatarUrl') || '';
      const storedTheme = localStorage.getItem('chrono_settings_theme') || 'cyber';
      const storedTimeline = localStorage.getItem('chrono_settings_timeline') || '2050';
      const storedRenderQuality = localStorage.getItem('chronoearth-render-quality') || 'balanced';

      setFullName(storedFullName);
      setAvatarUrl(storedAvatarUrl);
      setTheme(storedTheme);
      setTimeline(Number(storedTimeline));
      setRenderQuality(storedRenderQuality);
    } catch (e) {
      console.error('[Settings] Failed to load local settings:', e);
    } finally {
      setLoadingData(false);
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: null });

    try {
      localStorage.setItem('chrono_settings_fullName', fullName);
      localStorage.setItem('chrono_settings_avatarUrl', avatarUrl);
      localStorage.setItem('chrono_settings_theme', theme);
      localStorage.setItem('chrono_settings_timeline', String(timeline));
      localStorage.setItem('chronoearth-render-quality', renderQuality);

      // Dispatch global configuration change event
      window.dispatchEvent(new Event('chrono_settings_changed'));

      setMessage({ text: 'Local system configuration variables committed successfully.', type: 'success' });
    } catch (err: any) {
      console.error('Local settings save failed:', err);
      setMessage({ text: `Failed to compile configuration: ${err.message}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to restore factory default configuration settings?')) {
      localStorage.removeItem('chrono_settings_fullName');
      localStorage.removeItem('chrono_settings_avatarUrl');
      localStorage.removeItem('chrono_settings_theme');
      localStorage.removeItem('chrono_settings_timeline');
      localStorage.removeItem('chronoearth-render-quality');
      
      setFullName('Digital Citizen');
      setAvatarUrl('');
      setTheme('cyber');
      setTimeline(2050);
      setRenderQuality('balanced');
      
      window.dispatchEvent(new Event('chrono_settings_changed'));
      setMessage({ text: 'Settings restored to factory defaults.', type: 'success' });
    }
  };

  if (loadingData) {
    return (
      <main className="min-h-screen w-full bg-[#02060A] text-white flex items-center justify-center font-mono text-xs uppercase tracking-widest">
        <span>Restoring settings coordinate telemetry...</span>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#02060A] text-[#e2e8f0] relative pb-24">
      <BackgroundEffects earthMode="cyber" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[rgba(2,6,10,0.95)] to-transparent pointer-events-none z-10" />
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 pt-32 relative z-20 flex flex-col gap-10 font-mono animate-fade-up">
        
        {/* Title Header */}
        <div className="flex flex-col gap-3 border-b border-white/5 pb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5FF]/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="flex items-center gap-2 text-[#00E5FF] text-xs font-mono uppercase tracking-[0.3em] font-semibold">
              <span>⚙️ SYSTEM PREFERENCES</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
            </div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('start-chronoearth-tour'))}
              className="premium-glass px-4 py-1.5 rounded text-[10px] font-mono tracking-wider border border-[#00E5FF]/20 hover:border-[#00E5FF] hover:text-[#00E5FF] hover:shadow-[0_0_12px_rgba(0,229,255,0.25)] transition-all cursor-pointer uppercase font-semibold"
            >
              🔄 Restart Tour
            </button>
          </div>
          <h1 className="text-2xl font-light text-white tracking-wider uppercase m-0">
            System Settings
          </h1>
          <p className="text-xs text-white/50 uppercase tracking-widest m-0">
            Configure profile identities, simulation parameters, and interface themes
          </p>
        </div>

        {message.text && (
          <div 
            className={`p-4 rounded text-xs border font-sans ${
              message.type === 'success' 
                ? 'bg-[#00F5B0]/5 border-[#00F5B0]/30 text-[#00F5B0]' 
                : 'bg-red-500/5 border-red-500/20 text-red-400'
            }`}
          >
            {message.type === 'success' ? '✓ ' : '⚠️ '}{message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-8">
          
          {/* SECTION 1: PROFILE IDENTITY */}
          <div className="flex flex-col gap-6">
            <div className="border-l-2 border-[#00E5FF] pl-3 py-0.5">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider m-0">User Profile</h2>
              <span className="text-[10px] text-white/40 uppercase tracking-widest">Identify nodes in logs</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="settings-fullname" className="text-[10px] text-[#7A8694] uppercase tracking-wider font-semibold">Full Name / Alias</label>
                <input
                  id="settings-fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#00E5FF] focus-visible:ring-1 focus-visible:ring-[#00E5FF] rounded px-3 py-2 text-xs text-white outline-none transition-colors font-mono"
                />
              </div>

              {/* Uplink Status */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="settings-uplinkstatus" className="text-[10px] text-[#7A8694] uppercase tracking-wider font-semibold">Uplink Status</label>
                <input
                  id="settings-uplinkstatus"
                  type="text"
                  readOnly
                  disabled
                  value="LOCAL // DECENTRALIZED"
                  className="w-full bg-[#00E5FF]/5 border border-[#00E5FF]/20 rounded px-3 py-2 text-xs text-[#00E5FF] outline-none font-mono cursor-not-allowed uppercase font-semibold"
                />
              </div>

              {/* Avatar URL */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label htmlFor="settings-avatarurl" className="text-[10px] text-[#7A8694] uppercase tracking-wider font-semibold">Avatar Image URL</label>
                <div className="flex gap-4 items-center">
                  <img
                    src={avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${fullName || 'citizen'}`}
                    alt="avatar preview"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full border border-[#00E5FF]/20 object-cover shrink-0"
                  />
                  <input
                    id="settings-avatarurl"
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                    className="w-full bg-white/5 border border-white/10 focus:border-[#00E5FF] focus-visible:ring-1 focus-visible:ring-[#00E5FF] rounded px-3 py-2 text-xs text-white outline-none transition-colors font-mono"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 2: SIMULATION CONTROLS */}
          <div className="flex flex-col gap-6">
            <div className="border-l-2 border-[#00F5B0] pl-3 py-0.5">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider m-0">Grid Parameters</h2>
              <span className="text-[10px] text-white/40 uppercase tracking-widest">Default viewport state variables</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Default Year */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="settings-timeline" className="text-[10px] text-[#7A8694] uppercase tracking-wider font-semibold">Default Timeline Coordinates</label>
                <select
                  id="settings-timeline"
                  value={timeline}
                  onChange={(e) => setTimeline(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#00F5B0] focus-visible:ring-1 focus-visible:ring-[#00F5B0] rounded px-3 py-2 text-xs text-white outline-none transition-colors font-mono cursor-pointer"
                >
                  <option value={2030} className="bg-[#02060A]">2030 (Decadal Shift)</option>
                  <option value={2040} className="bg-[#02060A]">2040 (Transition Era)</option>
                  <option value={2050} className="bg-[#02060A]">2050 (Post-Carbon Grid)</option>
                </select>
              </div>

              {/* Default Theme */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="settings-theme" className="text-[10px] text-[#7A8694] uppercase tracking-wider font-semibold">Visual Matrix Theme</label>
                <select
                  id="settings-theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#00F5B0] focus-visible:ring-1 focus-visible:ring-[#00F5B0] rounded px-3 py-2 text-xs text-white outline-none transition-colors font-mono cursor-pointer"
                >
                  <option value="cyber" className="bg-[#02060A]">Chrono Cyberpunk (Default)</option>
                  <option value="realistic" className="bg-[#02060A]">Realistic Telemetry</option>
                </select>
              </div>

              {/* Earth Render Quality */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label htmlFor="settings-renderquality" className="text-[10px] text-[#7A8694] uppercase tracking-wider font-semibold">Earth Render Quality</label>
                <select
                  id="settings-renderquality"
                  value={renderQuality}
                  onChange={(e) => setRenderQuality(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#00F5B0] focus-visible:ring-1 focus-visible:ring-[#00F5B0] rounded px-3 py-2 text-xs text-white outline-none transition-colors font-mono cursor-pointer"
                >
                  <option value="auto" className="bg-[#02060A]">Auto (Adaptive Dynamic Selection)</option>
                  <option value="performance" className="bg-[#02060A]">⚡ Performance (Optimized for Weak Devices)</option>
                  <option value="balanced" className="bg-[#02060A]">⚖️ Balanced (Recommended Experience)</option>
                  <option value="cinematic" className="bg-[#02060A]">🎬 Cinematic (Highest Visual Detail)</option>
                </select>
              </div>

            </div>
          </div>

          {/* Save & Reset Buttons */}
          <div className="border-t border-white/5 pt-6 flex justify-between items-center gap-4 mt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 bg-transparent hover:bg-rose-500/10 focus-visible:ring-2 focus-visible:ring-rose-500 border border-rose-500/30 hover:border-rose-500 text-rose-400 font-mono text-xs rounded transition-all cursor-pointer font-semibold uppercase tracking-wider outline-none"
            >
              Reset Local Settings
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#00E5FF]/10 hover:bg-[#00E5FF] hover:text-[#02060A] focus-visible:ring-2 focus-visible:ring-[#00E5FF] border border-[#00E5FF]/40 hover:border-transparent text-[#00E5FF] font-mono text-xs font-semibold rounded cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none hover:shadow-[0_0_15px_rgba(0,229,255,0.25)] uppercase tracking-wider outline-none"
            >
              {saving ? 'Synchronising…' : 'Commit System Variables'}
            </button>
          </div>

        </form>

      </div>
      <Footer />
    </main>
  );
}
