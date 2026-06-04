'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import { PREDICTIONS, FUTUROLOGISTS, Comment } from '@/data/predictionsData';

const C = {
  emerald: '#00F5B0',
  cyan: '#00D98F',
  iceBlue: '#00D98F',
  white: '#F5F7FA',
  bg: 'rgba(2, 8, 15, 0.75)',
  border: 'rgba(0, 245, 176, 0.15)',
};

interface Params {
  slug: string;
}

// Sparkline Mini-Chart helper
function MiniSparkline({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 30" className="w-full h-8 overflow-visible">
      <path
        d="M0,25 Q15,10 30,18 T60,5 T90,22 L100,10"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        className="opacity-80"
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
      />
    </svg>
  );
}

// Circular Gauge Component
function CircularGauge({ value, color, label }: { value: number; color: string; label: string }) {
  const r = 24; 
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={56} height={56} viewBox="0 0 56 56" className="overflow-visible">
        <circle cx={28} cy={28} r={r} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={3} />
        <circle cx={28} cy={28} r={r} fill="none" stroke={color} strokeWidth={3}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 28 28)"
          style={{ filter: `drop-shadow(0 0 4px ${color})`, transition: 'stroke-dashoffset 0.8s ease' }} 
        />
        <text x={28} y={28} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize={10} fontWeight={600} fontFamily="monospace">{value}%</text>
      </svg>
      <span className="text-[7px] tracking-widest text-slate-500 uppercase font-mono text-center">{label}</span>
    </div>
  );
}

// Recursive Comment Node Component
interface CommentNodeProps {
  comment: Comment;
  onReply: (parentId: string, author: string, content: string) => void;
  onVote: (commentId: string) => void;
}

function CommentNode({ comment, onReply, onVote }: CommentNodeProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyAuthor, setReplyAuthor] = useState('');
  const [replyContent, setReplyContent] = useState('');

  const submitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyAuthor.trim() || !replyContent.trim()) return;
    onReply(comment.id, replyAuthor, replyContent);
    setReplyAuthor('');
    setReplyContent('');
    setReplyOpen(false);
  };

  return (
    <div className="border-l border-[#00F5B0]/60 pl-4 mt-4 flex flex-col gap-2 relative">
      {/* Visual node line connector dot */}
      <div className="absolute -left-[3px] top-1.5 w-1.5 h-1.5 rounded-full bg-[#040B12] border border-[#00F5B0]/40" />
      
      <div className="flex justify-between items-center text-[9px] font-mono text-[#00F5B0]">
        <span className="font-semibold">{comment.author}</span>
        <span className="text-slate-500">{new Date(comment.timestamp).toLocaleDateString()}</span>
      </div>
      
      <p className="text-xs text-slate-300 font-sans leading-relaxed">
        {comment.content}
      </p>
      
      <div className="flex items-center gap-4 text-[8px] font-mono mt-1">
        <button 
          onClick={() => onVote(comment.id)} 
          className="text-emerald-400 hover:text-emerald-300 transition-colors font-semibold"
        >
          ▲ {comment.votes}
        </button>
        <button 
          onClick={() => setReplyOpen(!replyOpen)} 
          className="text-[#00F5B0] hover:underline transition-all"
        >
          {replyOpen ? '[CLOSE]' : '[REPLY]'}
        </button>
      </div>

      {replyOpen && (
        <form onSubmit={submitReply} className="mt-2 flex flex-col gap-2 p-3 bg-[#00F5B0]/5 border border-[#00F5B0]/40 rounded">
          <input
            type="text"
            placeholder="Enter Identity Alias..."
            value={replyAuthor}
            onChange={e => setReplyAuthor(e.target.value)}
            className="bg-transparent border-b border-[#00F5B0]/15 text-xs text-white outline-none focus:border-[#00F5B0] py-1 font-mono"
            required
          />
          <textarea
            placeholder="Synthesize reply content..."
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            className="bg-transparent border border-[#00F5B0]/15 text-xs text-slate-300 p-2 outline-none focus:border-[#00F5B0] rounded min-h-[60px] font-sans"
            required
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setReplyOpen(false)} className="text-[9px] font-mono text-slate-500 uppercase px-2 hover:text-white">Cancel</button>
            <button type="submit" className="text-[9px] font-mono text-[#00F5B0] uppercase font-bold px-2 hover:underline">Transmit</button>
          </div>
        </form>
      )}

      {comment.replies && comment.replies.map(reply => (
        <CommentNode key={reply.id} comment={reply} onReply={onReply} onVote={onVote} />
      ))}
    </div>
  );
}

// Helper to add replies recursively in deep arrays
const addReplyHelper = (commentsList: Comment[], parentId: string, newComment: Comment): Comment[] => {
  return commentsList.map(c => {
    if (c.id === parentId) {
      return {
        ...c,
        replies: [...(c.replies || []), newComment]
      };
    } else if (c.replies && c.replies.length > 0) {
      return {
        ...c,
        replies: addReplyHelper(c.replies, parentId, newComment)
      };
    }
    return c;
  });
};

// Helper to vote on comment recursively
const voteCommentHelper = (commentsList: Comment[], commentId: string): Comment[] => {
  return commentsList.map(c => {
    if (c.id === commentId) {
      return {
        ...c,
        votes: c.votes + 1
      };
    } else if (c.replies && c.replies.length > 0) {
      return {
        ...c,
        replies: voteCommentHelper(c.replies, commentId)
      };
    }
    return c;
  });
};

export default function PredictionDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = use(params);
  
  const p = PREDICTIONS.find(pred => pred.slug === slug);

  const [votesCount, setVotesCount] = useState(p ? p.initialVotes : 0);
  const [hasVoted, setHasVoted] = useState<'up' | 'down' | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [shareText, setShareText] = useState('SHARE TIMELINE PATH');
  const [comments, setComments] = useState<Comment[]>(p ? p.comments : []);
  const [newAuthor, setNewAuthor] = useState('');
  const [newContent, setNewContent] = useState('');
  const [sortMode, setSortMode] = useState<'top' | 'newest'>('top');

  // Load bookmarks & votes from localStorage
  useEffect(() => {
    if (!p) return;
    try {
      const savedPreds = localStorage.getItem('chrono_bookmarked_preds');
      if (savedPreds) {
        const list = JSON.parse(savedPreds) as string[];
        setIsSaved(list.includes(p.id));
      }

      const savedVotes = localStorage.getItem('chrono_votes');
      if (savedVotes) {
        const dict = JSON.parse(savedVotes) as Record<string, number>;
        const userVotes = dict[p.id] || 0;
        setVotesCount(p.initialVotes + userVotes);
        if (userVotes > 0) setHasVoted('up');
        else if (userVotes < 0) setHasVoted('down');
      }

      // Load comments
      const cachedComments = localStorage.getItem(`chrono_comments_${p.slug}`);
      if (cachedComments) {
        setComments(JSON.parse(cachedComments));
      }
    } catch (e) {
      console.error(e);
    }
  }, [p]);

  if (!p) {
    return (
      <main className="h-screen w-screen bg-[#02060A] flex flex-col items-center justify-center text-white gap-4 font-mono">
        <div>[ERROR // TIMELINE CORE ARCHIVE LINK CORRUPTED]</div>
        <Link href="/predictions" className="text-[#00F5B0] hover:underline">[← RETURN TO EXPLORER]</Link>
      </main>
    );
  }

  const authorObj = FUTUROLOGISTS.find(f => f.name === p.author);

  // Voting action
  const triggerVote = (dir: 'up' | 'down') => {
    let delta = 0;
    if (hasVoted === dir) {
      // Cancel vote
      delta = dir === 'up' ? -1 : 1;
      setHasVoted(null);
    } else {
      // Apply vote
      if (hasVoted !== null) {
        // Reverse previous vote
        delta = dir === 'up' ? 2 : -2;
      } else {
        delta = dir === 'up' ? 1 : -1;
      }
      setHasVoted(dir);
    }

    const nextCount = votesCount + delta;
    setVotesCount(nextCount);

    try {
      const savedVotes = localStorage.getItem('chrono_votes');
      const dict = savedVotes ? JSON.parse(savedVotes) : {};
      const baseDiff = nextCount - p.initialVotes;
      dict[p.id] = baseDiff;
      localStorage.setItem('chrono_votes', JSON.stringify(dict));
    } catch (e) {
      console.error(e);
    }
  };

  // Bookmark action
  const toggleSave = () => {
    try {
      const savedPreds = localStorage.getItem('chrono_bookmarked_preds');
      let list = savedPreds ? JSON.parse(savedPreds) as string[] : [];
      if (list.includes(p.id)) {
        list = list.filter(id => id !== p.id);
        setIsSaved(false);
      } else {
        list.push(p.id);
        setIsSaved(true);
      }
      localStorage.setItem('chrono_bookmarked_preds', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  };

  // Copy share link
  const triggerShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setShareText('LINK COPIED TO SCRAMBLER!');
      setTimeout(() => setShareText('SHARE TIMELINE PATH'), 2000);
    });
  };

  // Export report
  const triggerExport = () => {
    const reportText = `### CHRONOEARTH FUTUROLOGY BRIEFING
Prediction ID: ${p.id.toUpperCase()}
Category: ${p.category.toUpperCase()}
Forecast Year: ${p.year}
Author: ${p.author}
Geolocation Focus: ${p.city}
Confidence Rating: ${p.confidenceScore}%
Timeline Upvotes: ${votesCount}

Projections Synthesis:
${p.description}

Generated via ChronoEarth forecast engine.`;

    const element = document.createElement("a");
    const file = new Blob([reportText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${p.slug}_intel_report.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Nested comments handlers
  const handleAddTopComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newContent.trim()) return;

    const newTopComment: Comment = {
      id: `c-top-${Date.now()}`,
      author: newAuthor,
      content: newContent,
      timestamp: new Date().toISOString(),
      votes: 0,
      replies: []
    };

    const updated = [newTopComment, ...comments];
    setComments(updated);
    localStorage.setItem(`chrono_comments_${p.slug}`, JSON.stringify(updated));
    setNewAuthor('');
    setNewContent('');
  };

  const handleAddReply = (parentId: string, author: string, content: string) => {
    const newReply: Comment = {
      id: `c-rep-${Date.now()}`,
      author,
      content,
      timestamp: new Date().toISOString(),
      votes: 0,
      replies: []
    };

    const updated = addReplyHelper(comments, parentId, newReply);
    setComments(updated);
    localStorage.setItem(`chrono_comments_${p.slug}`, JSON.stringify(updated));
  };

  const handleVoteComment = (commentId: string) => {
    const updated = voteCommentHelper(comments, commentId);
    setComments(updated);
    localStorage.setItem(`chrono_comments_${p.slug}`, JSON.stringify(updated));
  };

  // Sorting logic for comments
  const sortedComments = [...comments].sort((a, b) => {
    if (sortMode === 'top') {
      return b.votes - a.votes;
    } else {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
  });

  const panelStyle: React.CSSProperties = {
    background: C.bg,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${C.border}`,
    borderRadius: '4px',
    padding: '24px',
    boxShadow: '0 0 30px rgba(0,229,255,0.05)',
    position: 'relative',
    overflow: 'hidden',
  };

  const cornerAccent = (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 8, height: 8, borderTop: `1px solid ${C.cyan}`, borderLeft: `1px solid ${C.cyan}` }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderTop: `1px solid ${C.cyan}`, borderRight: `1px solid ${C.cyan}` }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 8, height: 8, borderBottom: `1px solid ${C.cyan}`, borderLeft: `1px solid ${C.cyan}` }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderBottom: `1px solid ${C.cyan}`, borderRight: `1px solid ${C.cyan}` }} />
    </>
  );

  return (
    <main className="h-screen w-screen overflow-y-auto bg-[#02060A] text-[#e2e8f0] relative custom-scrollbar">
      <BackgroundEffects earthMode="cyber" />
      
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[rgba(2,8,15,0.95)] to-transparent pointer-events-none z-10" />

      <Navbar earthMode="cyber" />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-24 relative z-20 flex flex-col gap-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-[9px] text-[#00F5B0]">
          <Link href="/predictions" className="hover:text-white transition-colors">FORECASTS DIRECTORY</Link>
          <span>/</span>
          <span className="text-slate-400">{p.title.toUpperCase()}</span>
        </div>

        {/* 2-Column Dashboard layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Forecast Metadata */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div style={panelStyle} className="flex flex-col gap-6">
              {cornerAccent}

              <div className="flex flex-col gap-1 border-b border-[#00F5B0]/15 pb-4">
                <span className="text-[7px] font-mono text-[#00F5B0]">FORECAST ID: {p.id.toUpperCase()}</span>
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Metrics Matrix</h2>
              </div>

              {/* Gauges */}
              <div className="flex justify-around items-center py-2 border-b border-[#00F5B0]/60">
                <CircularGauge value={p.confidenceScore} color={C.cyan} label="Confidence Score" />
                <CircularGauge value={82} color={C.emerald} label="Planetary Stability" />
              </div>

              {/* Stats Lists */}
              <div className="flex flex-col gap-3 font-mono text-xs border-b border-[#00F5B0]/60 pb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500 text-[10px]">GEOLOCATION KEY</span>
                  <span className="text-[#00F5B0] font-semibold">{p.city.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-[10px]">TARGET CHRONO-YEAR</span>
                  <span className="text-[#00F5B0] font-bold">{p.year} FORECAST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-[10px]">UPVOTES REGISTERED</span>
                  <span className="text-white font-bold">{votesCount} Net Votes</span>
                </div>
              </div>

              {/* Mini Charts */}
              <div className="flex flex-col gap-3">
                <span className="text-[8px] font-mono tracking-wider text-slate-500 uppercase">SIMULATED DATA TRENDS</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-2 bg-[#00F5B0]/5 border border-[#00F5B0]/40 rounded">
                    <span className="text-[7px] text-slate-400 font-mono block mb-1">STRENGTH VARIATION</span>
                    <MiniSparkline color={C.cyan} />
                  </div>
                  <div className="p-2 bg-[#00F5B0]/5 border border-[#00F5B0]/40 rounded">
                    <span className="text-[7px] text-slate-400 font-mono block mb-1">NETWORK ACCURACY</span>
                    <MiniSparkline color={C.emerald} />
                  </div>
                </div>
              </div>

              {/* Actions Grid */}
              <div className="flex flex-col gap-2 mt-2">
                
                {/* Voting Box */}
                <div className="flex border border-[#00F5B0]/15 rounded overflow-hidden">
                  <button
                    onClick={() => triggerVote('up')}
                    className={`flex-1 py-2 font-mono text-[9px] tracking-widest uppercase transition-all ${
                      hasVoted === 'up'
                        ? 'bg-[#040B12] text-emerald-400 border-r border-[#00F5B0]/15'
                        : 'bg-[#00F5B0]/5 hover:bg-[#00F5B0]/10 text-slate-400 border-r border-[#00F5B0]/15'
                    }`}
                  >
                    ▲ VOTE PROBABLE
                  </button>
                  <button
                    onClick={() => triggerVote('down')}
                    className={`flex-1 py-2 font-mono text-[9px] tracking-widest uppercase transition-all ${
                      hasVoted === 'down'
                        ? 'bg-rose-950/65 text-rose-400'
                        : 'bg-[#00F5B0]/5 hover:bg-[#00F5B0]/10 text-slate-400'
                    }`}
                  >
                    ▼ VOTE IMPROBABLE
                  </button>
                </div>

                {/* Bookmark Toggle */}
                <button
                  onClick={toggleSave}
                  className={`w-full py-2 font-mono text-[9px] tracking-widest uppercase border rounded transition-all duration-200 ${
                    isSaved
                      ? 'bg-[#00F5B0]/10 border-[#00F5B0] text-[#00F5B0] font-bold shadow-none'
                      : 'bg-transparent border-[#00F5B0]/15 text-slate-400 hover:border-[#00F5B0]/35 hover:text-white'
                  }`}
                >
                  {isSaved ? '🔖 TIMELINE PATH SAVED' : '🔖 SAVE FOR MONITORING'}
                </button>

                {/* Share Link */}
                <button
                  onClick={triggerShare}
                  className="w-full py-2 font-mono text-[9px] tracking-widest uppercase bg-[#00F5B0]/10 border border-[#00D98F]/20 hover:border-[#00D98F]/50 text-[#00F5B0] rounded transition-all duration-200"
                >
                  🔗 {shareText}
                </button>

                {/* Download Report */}
                <button
                  onClick={triggerExport}
                  className="w-full py-2 font-mono text-[9px] tracking-widest uppercase bg-gradient-to-r from-cyan-400/80 to-[#00F5B0]/80 text-[#000] border-none font-bold rounded shadow-none hover:opacity-90 transition-all duration-200"
                >
                  ⚡ EXPORT INTEL REPORT (.TXT)
                </button>

              </div>

            </div>
          </div>

          {/* Right Column: Detailed Forecast & Recursive Comments */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Forecast Content Panel */}
            <div style={panelStyle} className="flex flex-col gap-6">
              {cornerAccent}

              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="px-2 py-0.5 bg-[#040B12] text-[#00F5B0] border border-[#00F5B0]/20 uppercase tracking-wider rounded-sm">{p.category}</span>
                <span className="text-[#00F5B0] uppercase tracking-widest">{p.year} TIMELINE SHARD</span>
              </div>

              <div>
                <h1 className="text-3xl font-light text-white uppercase tracking-wide mb-2">{p.title}</h1>
                
                {/* Author Block */}
                {authorObj && (
                  <Link 
                    href={`/futurologists/${authorObj.slug}`}
                    className="flex items-center gap-3 w-fit mt-3 group"
                  >
                    <img 
                      src={authorObj.avatar} 
                      alt={p.author} 
                      className="w-8 h-8 rounded-full border border-[#00F5B0]/30 object-cover shadow-none group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <span className="text-xs font-semibold text-white group-hover:text-[#00F5B0] transition-colors">{p.author}</span>
                      <span className="text-[8px] font-mono text-slate-500 uppercase block">{authorObj.role}</span>
                    </div>
                  </Link>
                )}
              </div>

              <div className="border-t border-[#00F5B0]/60 pt-6 text-sm leading-relaxed text-slate-300 font-sans whitespace-pre-wrap">
                {p.description}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#00F5B0]/20">
                {p.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-[#00F5B0]/10 text-[9px] font-mono text-[#00F5B0] uppercase tracking-wider border border-[#00F5B0]/10 rounded-full">
                    #{tag.replace(/\s+/g, '')}
                  </span>
                ))}
              </div>
            </div>

            {/* Nested Comments Panel */}
            <div style={panelStyle} className="flex flex-col gap-6">
              {cornerAccent}
              
              <div className="flex justify-between items-center border-b border-[#00F5B0]/15 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-5 bg-[#00F5B0] shadow-[0_0_8px_#00F5B0]" />
                  <h3 className="text-lg font-light text-white uppercase tracking-wider">Planetary Consensus Thread</h3>
                </div>

                {/* Comment Sorting */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortMode('top')}
                    className={`px-2 py-1 font-mono text-[8px] uppercase border rounded transition-all ${
                      sortMode === 'top'
                        ? 'bg-[#040B12] text-[#00F5B0] border-[#00F5B0]/30'
                        : 'bg-transparent border-[#00F5B0]/15 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Top Ratings
                  </button>
                  <button
                    onClick={() => setSortMode('newest')}
                    className={`px-2 py-1 font-mono text-[8px] uppercase border rounded transition-all ${
                      sortMode === 'newest'
                        ? 'bg-[#040B12] text-[#00F5B0] border-[#00F5B0]/30'
                        : 'bg-transparent border-[#00F5B0]/15 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Newest
                  </button>
                </div>
              </div>

              {/* Top-Level Add Comment Form */}
              <form onSubmit={handleAddTopComment} className="flex flex-col gap-3 p-4 bg-[#00F5B0]/5 border border-[#00F5B0]/50 rounded">
                <span className="text-[8px] font-mono text-[#7A8694] uppercase">Add Transmission Feedback</span>
                <input
                  type="text"
                  placeholder="Identity matrix / Username..."
                  value={newAuthor}
                  onChange={e => setNewAuthor(e.target.value)}
                  className="bg-[#00050c]/60 border border-[#00F5B0]/15 text-xs text-white px-3 py-2 outline-none focus:border-[#00F5B0] rounded font-mono"
                  required
                />
                <textarea
                  placeholder="Input detailed fourier analysis feedback or prediction critiques..."
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="bg-[#00050c]/60 border border-[#00F5B0]/15 text-xs text-slate-300 p-3 outline-none focus:border-[#00F5B0] rounded min-h-[80px] font-sans"
                  required
                />
                <button
                  type="submit"
                  className="self-end px-4 py-2 bg-[#040B12] text-[#00F5B0] border border-[#00F5B0]/20 hover:bg-[#00F5B0] hover:text-[#02060A] hover:border-transparent font-mono text-[9px] tracking-widest uppercase rounded transition-all duration-300"
                >
                  TRANSMIT PROTOCOL FEEDBACK
                </button>
              </form>

              {/* Comments Thread List */}
              <div className="flex flex-col gap-6 mt-2 divide-y divide-[#00F5B0]/10">
                {sortedComments.length === 0 ? (
                  <div className="text-center py-8 font-mono text-xs text-slate-500">
                    AWAITING INITIAL TRANSMISSIONS... BE THE FIRST TO COMMENT.
                  </div>
                ) : (
                  sortedComments.map(c => (
                    <div key={c.id} className="pt-4 first:pt-0">
                      <CommentNode 
                        comment={c} 
                        onReply={handleAddReply} 
                        onVote={handleVoteComment} 
                      />
                    </div>
                  ))
                )}
              </div>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
