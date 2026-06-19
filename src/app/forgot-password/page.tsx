'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import Link from 'next/link';

type MessageState = { text: string; type: 'success' | 'error' | 'idle' };

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState<MessageState>({ text: '', type: 'idle' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage({ text: '', type: 'idle' });

    try {
      await sendPasswordResetEmail(auth, email);

      // ── SECURITY: Always show the same success message regardless of
      //    whether the account exists, to prevent user enumeration attacks.
      setSent(true);
      setMessage({
        text: 'If an account exists for this email, a reset link has been sent. Check your inbox and spam folder.',
        type: 'success',
      });
    } catch (err: any) {
      // Only surface real system/network errors — never reveal account existence
      let errorText = 'An error occurred. Please try again.';

      if (err.code === 'auth/invalid-email') {
        errorText = 'Invalid email address format.';
      } else if (err.code === 'auth/too-many-requests') {
        errorText = 'Too many requests. Please wait a moment before trying again.';
      } else if (err.code === 'auth/network-request-failed') {
        errorText = 'Network error. Check your connection and try again.';
      }
      // auth/user-not-found → intentionally hidden (same success message shown)

      setMessage({ text: errorText, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#02060A] text-[#e2e8f0] relative flex items-center justify-center py-12 px-6">
      <BackgroundEffects earthMode="cyber" />

      {/* Top Header Vignette */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[rgba(2,6,10,0.95)] to-transparent pointer-events-none z-10" />

      <Navbar />

      <div className="w-full max-w-md relative z-20 mt-16 font-mono">

        {/* Animated scan-line border container */}
        <div className="relative">
          {/* Corner accent marks */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#00E5FF] pointer-events-none" />
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#00E5FF] pointer-events-none" />
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#00E5FF] pointer-events-none" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#00E5FF] pointer-events-none" />

          <div
            className="premium-glass p-8 rounded-lg border border-[#00E5FF]/20 flex flex-col gap-6"
            style={{ backgroundColor: 'rgba(2, 6, 12, 0.92)' }}
          >
            {/* ── Header ── */}
            <div className="flex flex-col gap-2 text-center border-b border-white/5 pb-4">
              <div className="flex items-center justify-center gap-1.5 text-xs text-[#00E5FF] uppercase tracking-[0.25em] font-semibold">
                <span>🔑 CREDENTIAL RECOVERY PROTOCOL</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
              </div>
              <h1 className="text-xl font-bold text-white uppercase tracking-wider m-0 mt-1">
                Reset Password
              </h1>
              <p className="text-[11px] text-[#7A8694] m-0 font-sans font-light">
                Enter your registered email. A secure reset link will be transmitted to your inbox.
              </p>
            </div>

            {/* ── Feedback Message ── */}
            {message.text && (
              <div
                className={`p-4 rounded text-xs border font-sans leading-relaxed ${
                  message.type === 'success'
                    ? 'bg-[#00F5B0]/5 border-[#00F5B0]/30 text-[#00F5B0]'
                    : 'bg-red-500/5 border-red-500/20 text-red-400'
                }`}
              >
                {message.type === 'success' ? (
                  <span className="flex gap-2">
                    <span className="shrink-0">✓</span>
                    <span>{message.text}</span>
                  </span>
                ) : (
                  <span className="flex gap-2">
                    <span className="shrink-0">⚠️</span>
                    <span>{message.text}</span>
                  </span>
                )}
              </div>
            )}

            {/* ── Form or Post-Send State ── */}
            {!sent ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="reset-email"
                    className="text-[10px] text-[#7A8694] uppercase tracking-wider font-semibold"
                  >
                    Registered Email Address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    autoComplete="email"
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@provider.com"
                    className="w-full bg-white/5 border border-white/10 focus:border-[#00E5FF] rounded px-3 py-2 text-xs text-white outline-none transition-colors font-mono placeholder-white/20 disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  id="reset-submit-btn"
                  disabled={loading || !email}
                  className="w-full py-2.5 bg-[#00E5FF]/10 hover:bg-[#00E5FF] hover:text-[#02060A] border border-[#00E5FF]/40 hover:border-transparent text-[#00E5FF] font-mono text-xs font-semibold uppercase tracking-wider rounded cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none hover:shadow-[0_0_15px_rgba(0,229,255,0.25)] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      {/* Spinner */}
                      <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                      </svg>
                      Transmitting...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            ) : (
              /* ── Post-send: show a "Send Again" option ── */
              <button
                id="reset-again-btn"
                onClick={() => {
                  setSent(false);
                  setEmail('');
                  setMessage({ text: '', type: 'idle' });
                }}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00E5FF]/40 text-[#7A8694] hover:text-[#00E5FF] font-mono text-xs uppercase tracking-wider rounded cursor-pointer transition-all duration-300"
              >
                Send to a Different Address
              </button>
            )}

            {/* ── Divider ── */}
            <div className="flex items-center justify-between text-slate-600 text-[10px] uppercase font-semibold">
              <span className="w-1/3 border-b border-white/5" />
              <span>navigation</span>
              <span className="w-1/3 border-b border-white/5" />
            </div>

            {/* ── Navigation Links ── */}
            <div className="flex flex-col gap-2 text-center text-[11px] font-sans font-light">
              <Link
                href="/login"
                id="back-to-login-link"
                className="flex items-center justify-center gap-1.5 text-[#00E5FF] hover:text-white transition-colors group"
              >
                <svg
                  className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M5 12l7 7M5 12l7-7" />
                </svg>
                <span className="font-mono font-bold uppercase tracking-wider text-[10px]">
                  Back to Login
                </span>
              </Link>
              <div className="text-[#7A8694]">
                No account yet?{' '}
                <Link href="/signup" className="text-[#00E5FF] hover:underline font-bold font-mono">
                  [REGISTER]
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* ── Security notice ── */}
        <p className="mt-4 text-center text-[10px] text-[#7A8694]/60 font-sans leading-relaxed px-2">
          🔒 For security, we never confirm whether an email address is registered.
        </p>
      </div>
    </main>
  );
}
