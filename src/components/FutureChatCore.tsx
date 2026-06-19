'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import SafeImage from '@/components/SafeImage';
import { getKnowledgeCardImage, getPredictionImage, KNOWLEDGE_CATEGORY_IMAGES, PREDICTION_CATEGORY_IMAGES } from '@/lib/imageUtils';
import { KNOWLEDGE_CARDS } from '@/data/knowledgeCards';
import { PREDICTIONS } from '@/data/predictionsData';

function simpleMarkdownToHtml(md: string) {
  if (!md) return '';
  // Very small, safe markdown -> html conversion: code blocks, inline code, bold, italics, line breaks, lists
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // code blocks ```
  md = md.replace(/```([\s\S]*?)```/g, (_m, code) => `<pre class="rounded bg-black/40 p-2 overflow-auto"><code>${esc(code)}</code></pre>`);
  // inline code `
  md = md.replace(/`([^`]+)`/g, (_m, c) => `<code class="px-1 rounded bg-white/5">${esc(c)}</code>`);
  // bold **
  md = md.replace(/\*\*([^*]+)\*\*/g, (_m, t) => `<strong>${esc(t)}</strong>`);
  // italics *
  md = md.replace(/\*([^*]+)\*/g, (_m, t) => `<em>${esc(t)}</em>`);
  // unordered lists
  md = md.replace(/^\s*-\s+(.*)$/gm, (_m, item) => `<li>${esc(item)}</li>`);
  md = md.replace(/(<li>[\s\S]*<\/li>)/g, (m) => `<ul class=\"pl-4 list-disc\">${m}</ul>`);
  // paragraphs / line breaks
  md = md.replace(/\n{2,}/g, '</p><p>');
  md = `<p>${md.replace(/\n/g, '<br/>')}</p>`;
  return md;
}

const findReferences = (text: string) => {
  if (!text) return [];
  const refs: Array<{ type: 'kb' | 'prediction'; data: any }> = [];
  const lowercaseText = text.toLowerCase();

  // Find Knowledge Base References
  Object.keys(KNOWLEDGE_CARDS).forEach(key => {
    if (lowercaseText.includes(key.toLowerCase())) {
      refs.push({ type: 'kb', data: { ...KNOWLEDGE_CARDS[key], id: key } });
    }
  });

  // Also search for "kb-1", "kb-2", etc.
  for (let i = 1; i <= 9; i++) {
    const kbId = `kb-${i}`;
    if (lowercaseText.includes(kbId) && !refs.some(r => r.type === 'kb' && r.data.id === kbId)) {
      const mockKB = {
        id: kbId,
        title: kbId === 'kb-1' ? 'Magnetized Fusion Target Confinement' :
               kbId === 'kb-2' ? 'Ocean Thermal Energy Conversion (OTEC)' :
               kbId === 'kb-3' ? 'Synthetic Biosphere Anchors' :
               kbId === 'kb-4' ? 'Polar Albedo Deflection Arrays' :
               kbId === 'kb-5' ? 'Lunar Helium-3 Mining Logistics' :
               kbId === 'kb-6' ? 'Quantum Cryptography Orbital Grid' :
               kbId === 'kb-7' ? 'Accreted Mineral Biorock Reefs' :
               kbId === 'kb-8' ? 'Decentralized Micro-Semiconductor Fabs' :
               kbId === 'kb-9' ? 'Lifecycle Carbon Tracking Ledgers' : `Foresight File: ${kbId}`,
        category: kbId === 'kb-1' || kbId === 'kb-2' ? 'Energy' :
                  kbId === 'kb-3' || kbId === 'kb-4' ? 'Climate' :
                  kbId === 'kb-5' ? 'Space' :
                  kbId === 'kb-6' ? 'AI' :
                  kbId === 'kb-7' ? 'Cities' : 'Geopolitics'
      };
      refs.push({ type: 'kb', data: mockKB });
    }
  }

  // Find Prediction References
  PREDICTIONS.forEach(p => {
    if (lowercaseText.includes(p.slug.toLowerCase())) {
      if (!refs.some(r => r.type === 'prediction' && r.data.slug === p.slug)) {
        refs.push({ type: 'prediction', data: p });
      }
    }
  });

  return refs.slice(0, 2); // Limit to max 2 previews to keep chatbot clean
};

const ReferencedCards = ({ text }: { text: string }) => {
  const refs = findReferences(text);
  if (refs.length === 0) return null;

  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-white/5 pt-3">
      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">chrono_ref: referenced intelligence:</span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {refs.map((ref, idx) => {
          const isKB = ref.type === 'kb';
          const title = ref.data.title;
          const category = ref.data.category || 'Intelligence';
          const link = isKB 
            ? `/knowledge?article=${ref.data.id}` 
            : `/predictions/${ref.data.slug}`;
          const image = isKB 
            ? getKnowledgeCardImage(ref.data) 
            : getPredictionImage(ref.data);

          return (
            <Link 
              key={idx}
              href={link}
              className="flex items-center gap-3 p-2 bg-black/40 hover:bg-[#00F5B0]/5 border border-white/5 hover:border-[#00F5B0]/30 rounded-lg transition-all duration-300 no-underline text-left group min-w-0"
            >
              {(image) && (
              <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0 border border-white/10 group-hover:border-[#00F5B0]/30 transition-colors">
                <SafeImage
                  src={image}
                  fallbackSrc={isKB ? KNOWLEDGE_CATEGORY_IMAGES.default : PREDICTION_CATEGORY_IMAGES.default}
                  alt={title}
                  fill
                  sizes="40px"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
              )}
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="text-[8px] font-mono uppercase text-[#00F5B0] tracking-wider">{category}</span>
                <h5 className="text-[10px] font-bold text-white group-hover:text-[#00F5B0] transition-colors truncate m-0">{title}</h5>
                <span className="text-[8px] text-white/45 font-mono">Open Briefing →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

interface ChatMessage {
  id: string;
  text?: string;
  isAi?: boolean;
  avatar?: string;
}

/** Generate a fresh UUID for a new chat session */
function newSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function FutureChatCore() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [typing, setTyping] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(newSessionId);
  const endRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // ── Load last 50 chat messages from Supabase on auth change ──────────────
  const loadChatHistory = useCallback(async (uid: string) => {
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('futurechat_conversations')
        .select('id, role, content, created_at')
        .eq('user_id', uid)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Failed to load chat history:', error.message);
        return;
      }

      if (data && data.length > 0) {
        setMessages(data.map((item: any) => ({
          id: item.id,
          text: item.content,
          isAi: item.role === 'assistant',
        })));
      }
    } catch (err) {
      console.error('Exception loading chat history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }
    loadChatHistory(user.uid ?? user.id);
  }, [user, loadChatHistory]);

  // ── Scroll helpers ───────────────────────────────────────────────────────
  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    endRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    const lastMessage = messages[messages.length - 1];
    const isUserMessage = lastMessage && !lastMessage.isAi;
    if (isNearBottom || isUserMessage || messages.length <= 1) {
      scrollToBottom('smooth');
    }
  }, [messages]);

  useEffect(() => {
    if (typing) {
      const container = messagesContainerRef.current;
      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
        if (isNearBottom) scrollToBottom('smooth');
      }
    }
  }, [typing]);

  useEffect(() => {
    if (!isGenerating && messages.length > 0) {
      scrollToBottom('smooth');
    }
  }, [isGenerating, messages.length]);

  // ── Persist a single message row ─────────────────────────────────────────
  const persistMessage = (uid: string, role: 'user' | 'assistant', content: string) => {
    supabase
      .from('futurechat_conversations')
      .insert({ user_id: uid, session_id: sessionId, role, content })
      .then(({ error }: { error: any }) => {
        if (error) console.error(`Failed to persist ${role} message:`, error.message);
      });
  };

  // ── Send message ─────────────────────────────────────────────────────────
  const handleSend = async (e?: React.FormEvent, customPrompt?: string) => {
    e?.preventDefault();
    const prompt = (customPrompt || inputValue).trim();
    if (!prompt || isGenerating) return;

    const uid = user?.uid ?? user?.id;
    const userMsgId = `u-${Date.now()}`;
    const userMsg: ChatMessage = { id: userMsgId, text: prompt, isAi: false };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsGenerating(true);
    setTyping(true);

    // Save user message
    if (uid) persistMessage(uid, 'user', prompt);

    try {
      const res = await fetch('/api/futurechat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      });
      const data = await res.json();
      const answer = data?.success
        ? (data.answer || 'No answer')
        : (`ChronoAI error: ${data?.error || 'unknown'}`);

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        text: answer,
        isAi: true,
        avatar: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=80&auto=format&fit=crop&q=80',
      };
      setMessages(prev => [...prev, aiMsg]);

      // Save assistant message
      if (uid) persistMessage(uid, 'assistant', answer);
    } catch (err) {
      const errorText = `ChronoAI could not access the intelligence network. Please try again. (${(err as any)?.message || ''})`;
      const aiMsg: ChatMessage = { id: `a-${Date.now()}`, text: errorText, isAi: true };
      setMessages(prev => [...prev, aiMsg]);
      if (uid) persistMessage(uid, 'assistant', errorText);
    } finally {
      setTyping(false);
      setIsGenerating(false);
    }
  };

  // ── New Chat: clears UI only, keeps DB history intact ────────────────────
  const handleNewChat = () => {
    setMessages([]);
    setInputValue('');
    setSessionId(newSessionId()); // fresh session for new messages
  };

  const suggestions = [
    { text: 'What happens if AGI arrives in 2040?', label: '🤖 AGI Timeline' },
    { text: 'India climate forecast and metrics 2050', label: '🌱 India 2050 Climate' },
    { text: 'Future of global semiconductor markets', label: '💻 Chip Markets' },
    { text: 'What space events are projected next?', label: '🚀 Space Telemetry' },
  ];

  return (
    <main className="h-screen w-screen bg-[#02060A] text-[#E2E8F0] relative overflow-hidden flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 pt-24 pb-4 px-4 sm:px-6 flex flex-col items-center relative z-10 min-h-0">
        <div className="w-full max-w-3xl flex flex-col h-full gap-4 min-h-0">

          {/* ── Header ── */}
          <header className="mb-2 shrink-0 flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5 min-w-0">
              <h1 className="text-2xl font-extrabold text-white font-mono tracking-wide">FutureChat</h1>
              <p className="text-sm text-[#94A3B8] font-mono truncate">
                {user
                  ? <span>
                      <span className="text-[#00F5B0]">[{user.email?.split('@')[0] ?? 'user'}]</span>
                      {' '}— history synced
                    </span>
                  : 'AI-powered future intelligence assistant'
                }
              </p>
            </div>

            {/* New Chat button — only shown when there are messages */}
            {messages.length > 0 && (
              <button
                id="new-chat-btn"
                type="button"
                onClick={handleNewChat}
                disabled={isGenerating}
                className="shrink-0 px-3 py-2 bg-white/5 hover:bg-[#00F5B0]/10 border border-white/10 hover:border-[#00F5B0]/40 text-[#94A3B8] hover:text-[#00F5B0] font-mono text-[10px] uppercase tracking-wider rounded transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                title="Start a new conversation (history remains saved)"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
                </svg>
                New Chat
              </button>
            )}
          </header>

          {/* ── Chat Panel ── */}
          <div className="flex-1 bg-[#040B12]/80 rounded-lg p-4 flex flex-col min-h-0 border border-white/5 relative">

            {/* ── History loading skeleton ── */}
            {historyLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-20 bg-[#040B12]/90 rounded-lg">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00F5B0] animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-[#00F5B0] animate-pulse [animation-delay:200ms]" />
                    <span className="w-2 h-2 rounded-full bg-[#00F5B0] animate-pulse [animation-delay:400ms]" />
                  </div>
                  <span className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-widest">
                    Restoring conversation history...
                  </span>
                </div>
              </div>
            )}

            {/* ── Messages ── */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto custom-scrollbar px-2 py-3 flex flex-col gap-4 min-h-0"
            >
              {messages.length === 0 && !historyLoading ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-center text-[#94A3B8] gap-6 p-6">
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xl text-white font-bold font-mono tracking-wide">Welcome to FutureChat</h2>
                    <p className="text-sm max-w-xl text-[#94A3B8]/80 leading-relaxed">
                      Ask ChronoAI about predictions, climate intelligence, smart cities, microelectronics, space logistics, and timeline parameters.
                    </p>
                    {user && (
                      <p className="text-[10px] font-mono text-[#00F5B0]/60 mt-1">
                        Your conversations are saved and will persist across sessions.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl mt-4">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(undefined, s.text)}
                        className="p-3 bg-black/40 hover:bg-[#00F5B0]/5 border border-white/5 hover:border-[#00F5B0]/30 text-white hover:text-[#00F5B0] rounded-xl text-left text-xs font-mono transition-all duration-300 flex flex-col gap-1 cursor-pointer"
                      >
                        <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">{s.label}</span>
                        <span className="font-sans font-light leading-normal">"{s.text}"</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`w-full flex ${m.isAi ? 'justify-start' : 'justify-end'}`}>
                    <div className={`${m.isAi ? 'bg-[#071E1A] border border-[#00F5B0]/20 text-[#00F5B0]' : 'bg-[#071826] text-white'} max-w-[85%] p-4 rounded-xl shadow-md transition-all`}>
                      <div className="prose prose-sm max-w-none text-[13px] leading-relaxed break-words font-sans">
                        <div dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(m.text || '') }} />
                      </div>
                      {m.isAi && <ReferencedCards text={m.text || ''} />}
                      {m.isAi && (
                        <div className="mt-2.5 flex items-center gap-2 justify-end border-t border-white/5 pt-2">
                          <button
                            type="button"
                            onClick={() => navigator.clipboard?.writeText(m.text || '')}
                            className="text-[10px] font-mono text-[#94A3B8] hover:text-white bg-transparent border-none cursor-pointer"
                          >
                            [COPY OUTPUT]
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={endRef} />
            </div>

            {/* ── Typing indicator ── */}
            {typing && (
              <div className="px-3 py-2 text-[11px] text-[#94A3B8] font-mono shrink-0 flex items-center gap-1.5 bg-black/20 border-t border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F5B0] animate-pulse" />
                <span>ChronoAI is typing</span>
                <span className="animate-pulse">•••</span>
              </div>
            )}

            {/* ── Input form ── */}
            <form
              onSubmit={(e) => { handleSend(e); }}
              className="mt-3 flex items-center gap-2 shrink-0 border-t border-white/5 pt-3"
            >
              <span className="text-[#00F5B0] font-bold font-mono text-xs select-none pl-2 hidden sm:inline">chrono_os:~$ &gt;</span>
              <input
                type="text"
                placeholder={isGenerating ? 'ChronoAI is thinking...' : 'Ask a question about the future...'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isGenerating}
                className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder-white/20 font-mono disabled:opacity-50 min-w-0"
              />
              <button
                type="submit"
                disabled={isGenerating || !inputValue.trim()}
                className="px-4 py-2 bg-[#00F5B0] hover:bg-[#00D98F] text-black font-bold font-mono text-xs rounded uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_10px_rgba(0,245,176,0.3)] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                Transmit
              </button>
            </form>

          </div>
        </div>
      </div>
    </main>
  );
}
