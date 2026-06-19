'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile variables
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Preference variables
  const [theme, setTheme] = useState('cyber');
  const [timeline, setTimeline] = useState(2050);
  const [favoriteCities, setFavoriteCities] = useState<string[]>([]);
  const [favoriteCompanies, setFavoriteCompanies] = useState<string[]>([]);

  // Feedback states
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>({ text: '', type: null });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoadingData(true);
        
        // Fetch profiles table
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // Fetch preferences table
        const { data: prefs, error: prefsErr } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setFullName(profile.full_name || '');
          setAvatarUrl(profile.avatar_url || '');
        } else {
          // If profile missing in DB, fallback to auth session meta
          setFullName(user.user_metadata?.full_name || '');
          setAvatarUrl(user.user_metadata?.avatar_url || '');
        }

        if (prefs) {
          setTheme(prefs.selected_theme || 'cyber');
          setTimeline(prefs.default_timeline || 2050);
          setFavoriteCities(prefs.favorite_cities || []);
          setFavoriteCompanies(prefs.favorite_companies || []);
        }
      } catch (err) {
        console.error('Failed to load user variables:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchUserData();
  }, [user, loading, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage({ text: '', type: null });

    try {
      // 1. Update public.profiles
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_url: avatarUrl
        })
        .eq('id', user.id);

      if (profileErr) throw profileErr;

      // 2. Update public.user_preferences (upsert if missing)
      const { error: prefsErr } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          selected_theme: theme,
          default_timeline: timeline,
          favorite_cities: favoriteCities,
          favorite_companies: favoriteCompanies
        });

      if (prefsErr) throw prefsErr;

      // 3. Update auth user metadata so the local session reflects updates immediately
      const { auth: firebaseAuth } = await import('@/lib/firebase');
      const { updateProfile } = await import('firebase/auth');
      
      if (firebaseAuth.currentUser) {
        await updateProfile(firebaseAuth.currentUser, {
          displayName: fullName,
          photoURL: avatarUrl
        });
      }

      setMessage({ text: 'System variables synchronized successfully.', type: 'success' });
    } catch (err: any) {
      console.error('Sync failed:', err);
      setMessage({ text: `Failed to compile configuration: ${err.message}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading || loadingData) {
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
              <span>⚙️ USER PREFERENCES</span>
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
                <label className="text-[10px] text-[#7A8694] uppercase tracking-wider font-semibold">Full Name / Alias</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#00E5FF] rounded px-3 py-2 text-xs text-white outline-none transition-colors font-mono"
                />
              </div>

              {/* Email (Read Only) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#7A8694] uppercase tracking-wider font-semibold">Synchronised Email</label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-white/5 border border-white/5 rounded px-3 py-2 text-xs text-white/40 outline-none font-mono cursor-not-allowed"
                />
              </div>

              {/* Avatar URL */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[10px] text-[#7A8694] uppercase tracking-wider font-semibold">Avatar Image URL</label>
                <div className="flex gap-4 items-center">
                  <img
                    src={avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.email}`}
                    alt="avatar preview"
                    className="w-10 h-10 rounded-full border border-[#00E5FF]/20 object-cover shrink-0"
                  />
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                    className="w-full bg-white/5 border border-white/10 focus:border-[#00E5FF] rounded px-3 py-2 text-xs text-white outline-none transition-colors font-mono"
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
                <label className="text-[10px] text-[#7A8694] uppercase tracking-wider font-semibold">Default Timeline Coordinates</label>
                <select
                  value={timeline}
                  onChange={(e) => setTimeline(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#00F5B0] rounded px-3 py-2 text-xs text-white outline-none transition-colors font-mono cursor-pointer"
                >
                  <option value={2030} className="bg-[#02060A]">2030 (Decadal Shift)</option>
                  <option value={2040} className="bg-[#02060A]">2040 (Transition Era)</option>
                  <option value={2050} className="bg-[#02060A]">2050 (Post-Carbon Grid)</option>
                </select>
              </div>

              {/* Default Theme */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#7A8694] uppercase tracking-wider font-semibold">Visual Matrix Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#00F5B0] rounded px-3 py-2 text-xs text-white outline-none transition-colors font-mono cursor-pointer"
                >
                  <option value="cyber" className="bg-[#02060A]">Chrono Cyberpunk (Default)</option>
                  <option value="realistic" className="bg-[#02060A]">Realistic Telemetry</option>
                </select>
              </div>

            </div>
          </div>

          {/* Save Button */}
          <div className="border-t border-white/5 pt-6 flex justify-between items-center gap-4 mt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="px-5 py-2.5 bg-transparent hover:bg-rose-500/10 border border-rose-500/30 hover:border-rose-500 text-rose-400 font-mono text-xs rounded transition-all cursor-pointer font-semibold uppercase tracking-wider"
            >
              Sign out from System
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#00E5FF]/10 hover:bg-[#00E5FF] hover:text-[#02060A] border border-[#00E5FF]/40 hover:border-transparent text-[#00E5FF] font-mono text-xs font-semibold rounded cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none hover:shadow-[0_0_15px_rgba(0,229,255,0.25)] uppercase tracking-wider"
            >
              {saving ? 'Synchronising...' : 'Commit System Variables'}
            </button>
          </div>

        </form>

      </div>
      <Footer />
    </main>
  );
}
