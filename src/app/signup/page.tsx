'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import Link from 'next/link';

export default function SignupPage() {
  const { signUpWithEmail, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [awaitingRedirect, setAwaitingRedirect] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>({ text: '', type: null });

  // ── Hard navigation: full reload so Firebase token is persisted before middleware runs ──
  const doRedirect = (dest: string) => {
    console.log('[ChronoEarth Auth] Signup: redirecting to', dest);
    window.location.href = dest;
  };

  // ── 2-second fallback in case something stalls ──
  useEffect(() => {
    if (!awaitingRedirect) return;
    console.log('[ChronoEarth Auth] Signup: awaiting redirect, fallback fires in 2s');
    const timeout = setTimeout(() => {
      console.log('[ChronoEarth Auth] Signup: fallback redirect fired');
      doRedirect('/dashboard');
    }, 2000);
    return () => clearTimeout(timeout);
  }, [awaitingRedirect]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) return;

    setLoading(true);
    setMessage({ text: '', type: null });

    try {
      console.log('[ChronoEarth Auth] Attempting email signup...');
      const result = await signUpWithEmail(email, password, fullName);
      if (result?.error) {
        let errorMsg = result.error.message;
        if (result.error.code === 'auth/email-already-in-use') {
          errorMsg = 'Account already exists for this email.';
        } else if (result.error.code === 'auth/weak-password') {
          errorMsg = 'Weak password. Keys must be at least 6 characters.';
        } else if (result.error.code === 'auth/invalid-email') {
          errorMsg = 'Invalid email address format.';
        }
        console.log('[ChronoEarth Auth] Signup failed:', result.error.code);
        setMessage({ text: `Registration Failed: ${errorMsg}`, type: 'error' });
      } else {
        console.log('[ChronoEarth Auth] Signup SUCCESS — setting session cookies immediately.');
        // Set session cookies immediately before redirect to prevent race condition
        const isSelfAdmin = email === 'admin@chronoearth.ai';
        const initialRole = isSelfAdmin ? 'admin' : 'user';
        document.cookie = `fb-access-token=authenticated; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; Secure`;
        document.cookie = `fb-user-role=${initialRole}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; Secure`;

        console.log('[ChronoEarth Auth] Redirecting to /dashboard');
        setMessage({ text: 'Ledger Created. Activating profile node...', type: 'success' });
        setAwaitingRedirect(true);
        doRedirect('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    setMessage({ text: '', type: null });

    try {
      console.log('[ChronoEarth Auth] Signup page: attempting Google login...');
      const result = await signInWithGoogle();
      if (result?.error) {
        console.log('[ChronoEarth Auth] Google login failed:', result.error.message);
        setMessage({ text: `Google Auth Error: ${result.error.message}`, type: 'error' });
      } else {
        console.log('[ChronoEarth Auth] Google login SUCCESS — writing cookies immediately.');
        // Set session cookies immediately
        document.cookie = `fb-access-token=authenticated; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; Secure`;
        document.cookie = `fb-user-role=user; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; Secure`;

        console.log('[ChronoEarth Auth] Google login SUCCESS — navigating to /dashboard');
        setMessage({ text: 'Authorization Handshake Complete. Redirecting...', type: 'success' });
        setAwaitingRedirect(true);
        doRedirect('/dashboard');
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  const isBusy = loading || loadingGoogle || awaitingRedirect;

  return (
    <main className="min-h-screen w-full bg-[#02060A] text-[#e2e8f0] relative flex items-center justify-center py-12 px-6">
      <BackgroundEffects earthMode="cyber" />
      
      {/* Top Header Vignette */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[rgba(2,6,10,0.95)] to-transparent pointer-events-none z-10" />
      
      <Navbar />

      <div className="w-full max-w-md relative z-20 mt-16 font-mono animate-fade-up">
        
        {/* Decorative corner borders */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#00F5B0] pointer-events-none" />
        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#00F5B0] pointer-events-none" />
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#00F5B0] pointer-events-none" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#00F5B0] pointer-events-none" />

        <div className="premium-glass p-8 rounded-lg border border-[#00F5B0]/20 flex flex-col gap-6" style={{ backgroundColor: 'rgba(2, 6, 12, 0.92)' }}>
          
          {/* Header */}
          <div className="flex flex-col gap-2 text-center border-b border-white/5 pb-4">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#00F5B0] uppercase tracking-[0.25em] font-semibold">
              <span>🧬 REGISTER NEW NODE ID</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F5B0] animate-pulse" />
            </div>
            <h1 className="text-xl font-bold text-white uppercase tracking-wider m-0 mt-1">
              Create Account
            </h1>
            <p className="text-[11px] text-[#7A8694] m-0 font-sans font-light">
              Add your credentials to create a new profile node in the simulation database.
            </p>
          </div>

          {/* Feedback Messages */}
          {message.text && (
            <div 
              className={`p-3 rounded text-xs border font-sans ${
                message.type === 'success' 
                  ? 'bg-[#00F5B0]/5 border-[#00F5B0]/30 text-[#00F5B0]' 
                  : 'bg-red-500/5 border-red-500/20 text-red-400'
              }`}
            >
              {message.type === 'success' ? '✓ ' : '⚠️ '}{message.text}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-[#7A8694] uppercase tracking-wider font-semibold">
                Full Name / Alias
              </label>
              <input
                type="text"
                required
                disabled={isBusy}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Vardan Raghav"
                className="w-full bg-white/5 border border-white/10 focus:border-[#00F5B0] rounded px-3 py-2 text-xs text-white outline-none transition-colors font-mono placeholder-white/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-[#7A8694] uppercase tracking-wider font-semibold">
                Email Address
              </label>
              <input
                type="email"
                required
                disabled={isBusy}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@provider.com"
                className="w-full bg-white/5 border border-white/10 focus:border-[#00F5B0] rounded px-3 py-2 text-xs text-white outline-none transition-colors font-mono placeholder-white/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-[#7A8694] uppercase tracking-wider font-semibold">
                Security Passkey (Password)
              </label>
              <input
                type="password"
                required
                disabled={isBusy}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white/5 border border-white/10 focus:border-[#00F5B0] rounded px-3 py-2 text-xs text-white outline-none transition-colors font-mono placeholder-white/20"
              />
            </div>

            <button
              type="submit"
              disabled={isBusy || !email || !password || !fullName}
              className="w-full py-2.5 bg-[#00F5B0]/10 hover:bg-[#00F5B0] hover:text-[#02060A] border border-[#00F5B0]/40 hover:border-transparent text-[#00F5B0] font-mono text-xs font-semibold uppercase tracking-wider rounded cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none hover:shadow-[0_0_15px_rgba(0,245,176,0.25)]"
            >
              {loading ? 'Creating account...' : awaitingRedirect ? 'Redirecting...' : 'Register Node Credentials'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center justify-between text-slate-600 text-[10px] uppercase font-semibold">
            <span className="w-1/3 border-b border-white/5" />
            <span>or sign up with</span>
            <span className="w-1/3 border-b border-white/5" />
          </div>

          {/* OAuth Buttons */}
          <button
            onClick={handleGoogleLogin}
            disabled={isBusy}
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-mono text-xs uppercase tracking-wider rounded cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-5.111 4.113-3.419 0-6.191-2.822-6.191-6.3S10.61 5.91 14.029 5.91c1.558 0 2.977.579 4.078 1.54l3.197-3.237C19.349 2.378 16.884 1 14.029 1 7.937 1 3 6.015 3 12.2s4.937 11.2 11.029 11.2c6.353 0 10.556-4.523 10.556-10.932 0-.74-.066-1.305-.184-1.802l-9.16.02Z"/>
            </svg>
            {loadingGoogle ? 'Signing in...' : awaitingRedirect ? 'Redirecting...' : 'Google OAuth Uplink'}
          </button>

          {/* Toggle login/signup */}
          <div className="text-center text-[11px] text-[#7A8694] border-t border-white/5 pt-4 font-sans font-light">
            Already registered on this node?{' '}
            <Link href="/login" className="text-[#00F5B0] hover:underline font-bold font-mono">
              [LOGIN]
            </Link>
          </div>

        </div>

      </div>
    </main>
  );
}
