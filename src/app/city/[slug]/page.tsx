'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import { citiesRawData, generateCityProjections } from '@/data/citiesData';
import { getExtendedCityData, getCitySlug } from '@/data/citiesExtendedData';
import { PREDICTIONS, Comment } from '@/data/predictionsData';

const C = {
  bg: '#02060A',
  panel: '#040B12',
  primary: '#00F5B0',
  secondary: '#00D98F',
  accent: '#FFFFFF',
  white: '#F5F7FA',
  border: 'rgba(0, 245, 176, 0.15)',
};

interface Params {
  slug: string;
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
    setNewInputs();
  };

  const setNewInputs = () => {
    setReplyAuthor('');
    setReplyContent('');
    setReplyOpen(false);
  };

  return (
    <div className="border-l border-white/10 pl-5 mt-5 flex flex-col gap-2 relative">
      <div className="absolute -left-[3px] top-1.5 w-1.5 h-1.5 rounded-full bg-white/40" />
      
      <div className="flex justify-between items-center text-[10px] font-sans-editorial text-white/50 tracking-wider">
        <span className="font-semibold text-white/80">{comment.author}</span>
        <span>{new Date(comment.timestamp).toLocaleDateString()}</span>
      </div>
      
      <p className="text-xs text-white/70 font-serif leading-relaxed">
        {comment.content}
      </p>
      
      <div className="flex items-center gap-4 text-[9px] font-sans-editorial mt-1">
        <button 
          onClick={() => onVote(comment.id)} 
          className="text-white hover:text-white/80 transition-colors font-semibold"
        >
          ▲ {comment.votes}
        </button>
        <button 
          onClick={() => setReplyOpen(!replyOpen)} 
          className="text-white/40 hover:text-white transition-all uppercase tracking-widest text-[8px]"
        >
          {replyOpen ? '[CLOSE]' : '[REPLY]'}
        </button>
      </div>

      {replyOpen && (
        <form onSubmit={submitReply} className="mt-3 flex flex-col gap-3 p-4 border border-white/5 rounded">
          <input
            type="text"
            placeholder="Identity Alias..."
            value={replyAuthor}
            onChange={e => setReplyAuthor(e.target.value)}
            className="bg-transparent border-b border-white/10 text-xs text-white py-1.5 outline-none focus:border-white font-sans-editorial"
            required
          />
          <textarea
            placeholder="Synthesize transmission reply..."
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            className="bg-transparent border border-white/10 text-xs text-slate-300 p-2 outline-none focus:border-white rounded min-h-[60px] font-serif leading-relaxed"
            required
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setReplyOpen(false)} className="text-[9px] font-sans-editorial text-white/40 uppercase px-2 hover:text-white">Cancel</button>
            <button type="submit" className="text-[9px] font-sans-editorial text-white border border-white/10 hover:border-white hover:bg-white hover:text-black bg-transparent uppercase px-3 py-1.5">Reply</button>
          </div>
        </form>
      )}

      {comment.replies && comment.replies.map(reply => (
        <CommentNode key={reply.id} comment={reply} onReply={onReply} onVote={onVote} />
      ))}
    </div>
  );
}

// Helpers for comment nesting operations
const addReplyHelper = (commentsList: Comment[], parentId: string, newComment: Comment): Comment[] => {
  return commentsList.map(c => {
    if (c.id === parentId) {
      return { ...c, replies: [...(c.replies || []), newComment] };
    } else if (c.replies && c.replies.length > 0) {
      return { ...c, replies: addReplyHelper(c.replies, parentId, newComment) };
    }
    return c;
  });
};

const voteCommentHelper = (commentsList: Comment[], commentId: string): Comment[] => {
  return commentsList.map(c => {
    if (c.id === commentId) {
      return { ...c, votes: c.votes + 1 };
    } else if (c.replies && c.replies.length > 0) {
      return { ...c, replies: voteCommentHelper(c.replies, commentId) };
    }
    return c;
  });
};

export default function CityDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = use(params);

  // Match raw city entry
  const city = citiesRawData.find(c => getCitySlug(c.name) === slug);
  const cityExtended = city ? getExtendedCityData(city.name) : null;

  const [activeYear, setActiveYear] = useState<2030 | 2040 | 2050>(2050);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newAuthor, setNewAuthor] = useState('');
  const [newContent, setNewContent] = useState('');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(148);

  // Load comments & likes from localStorage
  useEffect(() => {
    if (!city) return;
    try {
      const cachedComments = localStorage.getItem(`chrono_city_comments_${slug}`);
      if (cachedComments) {
        setComments(JSON.parse(cachedComments));
      } else {
        // Initial pre-seeded comments
        const initialList: Comment[] = [
          {
            id: `cc-${slug}-1`,
            author: 'AuraGrid_Monitor',
            content: `Ecological stability vectors for ${city.name} look highly aligned for ${activeYear}. Deployed mitigations have lowered regional delta stress.`,
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            votes: 18,
            replies: []
          }
        ];
        setComments(initialList);
        localStorage.setItem(`chrono_city_comments_${slug}`, JSON.stringify(initialList));
      }

      const cachedLikes = localStorage.getItem(`chrono_city_likes_${slug}`);
      if (cachedLikes) {
        const data = JSON.parse(cachedLikes);
        setLiked(data.liked);
        setLikesCount(data.count);
      }
    } catch (e) {
      console.error(e);
    }
  }, [slug, city, activeYear]);

  if (!city || !cityExtended) {
    return (
      <main className="h-screen w-screen bg-[#02060A] flex flex-col items-center justify-center text-white gap-4 font-mono">
        <div>[ERROR // CITY ARCHIVE ACCESS CORRUPTED]</div>
        <Link href="/" className="text-[#00F5B0] hover:underline">[← RETURN TO MAIN GRID]</Link>
      </main>
    );
  }

  // Dynamic calculations representing target years
  const yearIndex = (activeYear - 2025) / 5;
  const population = (city.offsets.population * 1000) * Math.pow(city.offsets.popGrowth, yearIndex / 5);
  const aiAdoption = Math.min(99.8, 75 + yearIndex * 3.5);
  const renewableEnergy = Math.min(100, 60 + yearIndex * 5.2);
  const climateStability = Math.min(100, 58 + yearIndex * 4.4);
  const transportIndex = Math.min(100, 70 + yearIndex * 3.8);
  const digitalInfra = Math.min(100, 75 + yearIndex * 4.1);
  const orbitalCoverage = Math.min(100, 80 + yearIndex * 3.1);

  // Predictions timeline mapping
  const timelinePredictions = [
    { year: 2030, pred: PREDICTIONS.find(p => p.year === 2030 && p.category === 'AI') },
    { year: 2040, pred: PREDICTIONS.find(p => p.year === 2040 && p.category === 'Climate') },
    { year: 2050, pred: PREDICTIONS.find(p => p.year === 2050 && p.category === 'Energy') }
  ];

  const handleLike = () => {
    let nextLiked = !liked;
    let nextCount = liked ? likesCount - 1 : likesCount + 1;
    setLiked(nextLiked);
    setLikesCount(nextCount);
    localStorage.setItem(`chrono_city_likes_${slug}`, JSON.stringify({ liked: nextLiked, count: nextCount }));
  };

  const handleAddTopComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newContent.trim()) return;

    const newComment: Comment = {
      id: `cc-top-${Date.now()}`,
      author: newAuthor,
      content: newContent,
      timestamp: new Date().toISOString(),
      votes: 0,
      replies: []
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    localStorage.setItem(`chrono_city_comments_${slug}`, JSON.stringify(updated));
    setNewAuthor('');
    setNewContent('');
  };

  const handleAddReply = (parentId: string, author: string, content: string) => {
    const newReply: Comment = {
      id: `cc-rep-${Date.now()}`,
      author,
      content,
      timestamp: new Date().toISOString(),
      votes: 0,
      replies: []
    };

    const updated = addReplyHelper(comments, parentId, newReply);
    setComments(updated);
    localStorage.setItem(`chrono_city_comments_${slug}`, JSON.stringify(updated));
  };

  const handleVoteComment = (commentId: string) => {
    const updated = voteCommentHelper(comments, commentId);
    setComments(updated);
    localStorage.setItem(`chrono_city_comments_${slug}`, JSON.stringify(updated));
  };

  const panelStyle: React.CSSProperties = {
    background: 'rgba(2, 8, 15, 0.75)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '4px',
    padding: '32px',
    position: 'relative',
    overflow: 'hidden',
  };

  const cornerAccent = null;

  return (
    <main className="h-screen w-screen overflow-y-auto bg-[#02060A] text-[#e2e8f0] relative custom-scrollbar">
      <BackgroundEffects earthMode="cyber" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[rgba(2, 8, 15, 0.9)] to-transparent pointer-events-none z-10" />

      <Navbar earthMode="cyber" />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-24 relative z-20 flex flex-col gap-14">
        
        {/* Navigation Link */}
        <div className="flex items-center gap-2 font-sans-editorial text-[9px] text-white/50 tracking-widest uppercase mb-2 select-none">
          <Link href="/" className="hover:text-white transition-colors">ORBIT SCANNER</Link>
          <span>/</span>
          <span className="text-white/80">{city.name} BRIEFING</span>
        </div>

        {/* ── SECTION 1: HERO BANNER ────────────────────────────────────────── */}
        <div style={panelStyle} className="p-0">
          <div className="relative w-full h-[360px] overflow-hidden">
            <img 
              src={cityExtended.image} 
              alt={city.name} 
              loading="lazy"
              className="w-full h-full object-cover filter brightness-[0.65] contrast-[1.02] grayscale-[10%]" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#02060A] via-transparent to-transparent" />
            
            {/* Header Content overlay */}
            <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-sans-editorial text-white/40 tracking-[0.25em] uppercase font-medium">METROPOLITAN BRIEFING REPORT</span>
                <h1 className="text-4xl md:text-[#FFFFFF]xl font-display font-light text-white tracking-wide">
                  {city.name}
                </h1>
                <div className="text-[9.5px] font-sans-editorial text-white/50 tracking-widest uppercase">
                  {city.country} · {city.lat.toFixed(4)}° N, {city.lon.toFixed(4)}° E
                </div>
              </div>

              {/* Year Selector */}
              <div className="flex border border-white/10 p-1 rounded backdrop-blur bg-black/25">
                {([2030, 2040, 2050] as const).map(yr => (
                  <button
                    key={yr}
                    onClick={() => setActiveYear(yr)}
                    className={`px-5 py-1.5 font-sans-editorial text-[9px] uppercase tracking-widest rounded-sm transition-all ${
                      activeYear === yr
                        ? 'bg-white text-black font-medium'
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Central Editorial Narrative Briefing */}
        <div className="max-w-3xl flex flex-col gap-4">
          <h2 className="font-display text-2xl font-light text-white tracking-wide">Planetary Integration & Outlook</h2>
          <p className="font-serif text-[15px] text-white/70 leading-relaxed font-light">
            As we approach the mid-century threshold, {city.name} undergoes a profound ecological and technological reorganization. 
            Under the guidance of planetary coordinator nodes, the metropolis faces evolving climate regimes with automated adaptive infrastructure. 
            The following matrix outlines the telemetry forecasts, technological milestones, and community consensus data for the year {activeYear}.
          </p>
        </div>

        {/* ── SECTION 2: FUTURE DASHBOARD ───────────────────────────────────── */}
        <div className="flex flex-col gap-8">
          <div className="border-b border-white/5 pb-3">
            <h2 className="font-display text-lg font-light text-white tracking-wider">
              Integration Metrics ({activeYear})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="border border-white/5 p-6 rounded flex flex-col gap-3">
              <span className="font-sans-editorial text-[9px] tracking-widest text-white/40 uppercase font-medium">AI Integration</span>
              <span className="font-display text-4xl font-light text-white">{aiAdoption.toFixed(0)}%</span>
              <p className="font-serif text-xs text-white/60 leading-relaxed">
                By {activeYear}, autonomous municipal systems manage transit pathways, microgrids, and local safety meshes, achieving high-efficiency resource routing.
              </p>
            </div>
            
            <div className="border border-white/5 p-6 rounded flex flex-col gap-3">
              <span className="font-sans-editorial text-[9px] tracking-widest text-white/40 uppercase font-medium">Renewable Energy</span>
              <span className="font-display text-4xl font-light text-white">{renewableEnergy.toFixed(0)}%</span>
              <p className="font-serif text-xs text-white/60 leading-relaxed">
                Localized energy harvesting—powered by thin-film photovoltaic surfaces and deep thermal conversion loops—supports the municipal power grid.
              </p>
            </div>

            <div className="border border-white/5 p-6 rounded flex flex-col gap-3">
              <span className="font-sans-editorial text-[9px] tracking-widest text-white/40 uppercase font-medium">Climate Stability</span>
              <span className="font-display text-4xl font-light text-white">{climateStability.toFixed(0)}%</span>
              <p className="font-serif text-xs text-white/60 leading-relaxed">
                Active geo-adaptive interventions, thermal cooling structures, and micro-climate management help maintain regional biological indicators.
              </p>
            </div>

            <div className="border border-white/5 p-6 rounded flex flex-col gap-3">
              <span className="font-sans-editorial text-[9px] tracking-widest text-white/40 uppercase font-medium">Mobility Index</span>
              <span className="font-display text-4xl font-light text-white">{transportIndex.toFixed(0)}%</span>
              <p className="font-serif text-xs text-white/60 leading-relaxed">
                Autonomous travel grids deploy demand-matched drone pods and subterranean high-speed tubes, resolving cargo and passenger routes.
              </p>
            </div>

            <div className="border border-white/5 p-6 rounded flex flex-col gap-3">
              <span className="font-sans-editorial text-[9px] tracking-widest text-white/40 uppercase font-medium">Digital Infrastructure</span>
              <span className="font-display text-4xl font-light text-white">{digitalInfra.toFixed(0)}%</span>
              <p className="font-serif text-xs text-white/60 leading-relaxed">
                High-density optical transceivers and secure local ledgers prevent system telemetry desynchronization and handle high data density.
              </p>
            </div>

            <div className="border border-white/5 p-6 rounded flex flex-col gap-3">
              <span className="font-sans-editorial text-[9px] tracking-widest text-white/40 uppercase font-medium">Orbital Space Sync</span>
              <span className="font-display text-4xl font-light text-white">{orbitalCoverage.toFixed(0)}%</span>
              <p className="font-serif text-xs text-white/60 leading-relaxed">
                Direct satellite links from low-orbit tracking constellations verify regional carbon density, soil dynamics, and atmospheric albedo.
              </p>
            </div>

            <div className="border border-white/5 p-6 rounded flex flex-col gap-3 lg:col-span-3">
              <span className="font-sans-editorial text-[9px] tracking-widest text-white/40 uppercase font-medium">Demographics</span>
              <span className="font-display text-4xl font-light text-white">{population.toFixed(1)} Million Residents</span>
              <p className="font-serif text-xs text-white/60 leading-relaxed">
                The city carrying capacity is projected to expand at an annual rate of +{((city.offsets.popGrowth - 1)*100).toFixed(1)}%. Biophilic zoning allows for high-density living without accelerating urban strain or carbon release.
              </p>
            </div>
          </div>
        </div>

        {/* ── SECTION 3: PREDICTIONS TIMELINE ───────────────────────────────── */}
        <div style={panelStyle} className="flex flex-col gap-8">
          <div className="border-b border-white/5 pb-3">
            <h2 className="font-display text-lg font-light text-white tracking-wider">
              Roadmap Projections
            </h2>
          </div>

          <div className="relative border-l border-white/10 ml-6 flex flex-col gap-10">
            {timelinePredictions.map(({ year, pred }) => {
              if (!pred) return null;
              return (
                <div key={year} className="relative pl-8">
                  {/* Minimal bullet indicator */}
                  <div className="absolute -left-1 w-2 h-2 rounded-full bg-white/40 mt-2" />
                  
                  <div className="flex flex-col gap-2 p-6 border border-white/5 rounded hover:border-white/20 transition-all">
                    <div className="flex justify-between items-center text-[10px] font-sans-editorial text-white/40 tracking-wider">
                      <span className="font-semibold">{year} TARGET</span>
                      <span className="uppercase">{pred.category}</span>
                    </div>

                    <h3 className="font-display text-lg text-white font-light">{pred.title}</h3>
                    <p className="font-serif text-sm text-white/70 leading-relaxed">{pred.description}</p>
                    
                    <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-1 text-[9px] font-sans-editorial text-white/40">
                      <span>CONFIDENCE SCORING: {pred.confidenceScore}%</span>
                      <Link href={`/predictions/${pred.slug}`} className="text-white hover:underline uppercase tracking-widest font-semibold text-[8px]">
                        Read Document &gt;
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SECTION 4: FAMOUS PLACES ──────────────────────────────────────── */}
        <div style={panelStyle} className="flex flex-col gap-8">
          <div className="border-b border-white/5 pb-3">
            <h2 className="font-display text-lg font-light text-white tracking-wider">
              Futuristic Landmarks
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cityExtended.famousPlaces.map((place) => (
              <div 
                key={place.name}
                className="p-6 border border-white/5 rounded flex flex-col gap-3 hover:border-white/20 transition-all"
              >
                <h3 className="font-display text-base font-light text-white tracking-wide uppercase">
                  {place.name}
                </h3>
                <p className="font-serif text-xs text-white/60 leading-relaxed">
                  {place.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 5: NOTABLE PEOPLE ─────────────────────────────────────── */}
        <div style={panelStyle} className="flex flex-col gap-8">
          <div className="border-b border-white/5 pb-3">
            <h2 className="font-display text-lg font-light text-white tracking-wider">
              Notable System Architects
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cityExtended.notablePeople.map((person) => (
              <div 
                key={person.name}
                className="p-6 border border-white/5 rounded flex gap-4 items-start hover:border-white/20 transition-all"
              >
                <img 
                  src={person.avatar} 
                  alt={person.name} 
                  loading="lazy"
                  className="w-14 h-14 rounded-full border border-white/10 object-cover"
                />
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-display text-base font-light text-white">{person.name}</h3>
                    <span className="font-sans-editorial text-[8px] text-white/40 uppercase tracking-widest">{person.role}</span>
                  </div>
                  <div className="font-sans-editorial text-[9px] text-white/50 tracking-wider font-light">{person.specialty}</div>
                  <p className="font-serif text-xs text-white/60 leading-relaxed mt-2">{person.contribution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 6: FUTURE PROJECTS ────────────────────────────────────── */}
        <div style={panelStyle} className="flex flex-col gap-8">
          <div className="border-b border-white/5 pb-3">
            <h2 className="font-display text-lg font-light text-white tracking-wider">
              Metropolitan Development Projects
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cityExtended.futureProjects.map((proj) => (
              <div 
                key={proj.name}
                className="p-6 border border-white/5 rounded flex flex-col gap-2 hover:border-white/20 transition-all"
              >
                <span className="font-sans-editorial text-[8px] text-white/40 uppercase tracking-wider">PROJECT METROPOLIS</span>
                <h3 className="font-display text-base font-light text-white uppercase">{proj.name}</h3>
                <p className="font-serif text-xs text-white/60 leading-relaxed">{proj.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 7: COMMUNITY INTELLIGENCE ─────────────────────────────── */}
        <div style={panelStyle} className="flex flex-col gap-8">
          
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h2 className="font-display text-lg font-light text-white tracking-wider">
              Consensus Shard Thread
            </h2>

            {/* Like count button */}
            <button
              onClick={handleLike}
              className={`px-4 py-2 font-sans-editorial text-[9px] uppercase tracking-widest border transition-all duration-300 ${
                liked 
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent border-white/10 hover:border-white hover:bg-white hover:text-black text-white'
              }`}
            >
              ♥ SUPPORT PLAN ({likesCount})
            </button>
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleAddTopComment} className="flex flex-col gap-4 p-6 border border-white/5 rounded">
            <span className="font-sans-editorial text-[10px] text-white/40 uppercase tracking-wider">Add Comments to Ledger</span>
            <input
              type="text"
              placeholder="Identity alias..."
              value={newAuthor}
              onChange={e => setNewAuthor(e.target.value)}
              className="bg-transparent border-b border-white/10 text-xs text-white py-2 outline-none focus:border-white transition-colors font-sans-editorial"
              required
            />
            <textarea
              placeholder="Synthesize observations, critiques or recommendations for this timeline target..."
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              className="bg-transparent border border-white/10 text-xs text-slate-300 p-3 outline-none focus:border-white rounded min-h-[80px] font-serif leading-relaxed"
              required
            />
            <button
              type="submit"
              className="self-end px-5 py-2 border border-white/10 hover:border-white hover:bg-white hover:text-black bg-transparent text-white transition-all duration-300 font-sans-editorial text-[9px] tracking-widest uppercase"
            >
              TRANSMIT FEEDBACK
            </button>
          </form>

          {/* Comment Threads */}
          <div className="flex flex-col gap-5 divide-y divide-white/5 mt-2">
            {comments.length === 0 ? (
              <div className="text-center py-6 font-sans-editorial text-xs text-white/30">
                AWAITING LEDGER SHARD DATA...
              </div>
            ) : (
              comments.map(c => (
                <div key={c.id} className="pt-5 first:pt-0">
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
    </main>
  );
}
