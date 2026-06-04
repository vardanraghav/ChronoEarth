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
    <div className="border-l border-[#00F5B0]/20 pl-5 mt-5 flex flex-col gap-2 relative">
      <div className="absolute -left-[3px] top-1.5 w-1.5 h-1.5 rounded-full bg-[#040B12] border border-[#00F5B0]/20" />
      
      <div className="flex justify-between items-center text-[10px] font-mono text-[#00F5B0] tracking-wider">
        <span className="font-semibold text-white">{comment.author}</span>
        <span className="text-[#7A8694]">{new Date(comment.timestamp).toLocaleDateString()}</span>
      </div>
      
      <p className="text-xs text-[#7A8694] font-sans leading-relaxed">
        {comment.content}
      </p>
      
      <div className="flex items-center gap-4 text-[9px] font-mono mt-1">
        <button 
          onClick={() => onVote(comment.id)} 
          className="text-[#00F5B0] hover:text-[#00D98F] transition-colors font-semibold"
        >
          ▲ {comment.votes}
        </button>
        <button 
          onClick={() => setReplyOpen(!replyOpen)} 
          className="text-[#00F5B0] hover:underline transition-all uppercase tracking-widest text-[8px]"
        >
          {replyOpen ? '[CLOSE]' : '[REPLY]'}
        </button>
      </div>

      {replyOpen && (
        <form onSubmit={submitReply} className="mt-3 flex flex-col gap-3 card-tier-3">
          <input
            type="text"
            placeholder="Identity Alias..."
            value={replyAuthor}
            onChange={e => setReplyAuthor(e.target.value)}
            className="bg-transparent border-b border-[#00F5B0]/15 text-xs text-white py-1.5 outline-none focus:border-[#00F5B0] font-mono"
            required
          />
          <textarea
            placeholder="Synthesize transmission reply..."
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            className="bg-transparent border border-[#00F5B0]/15 text-xs text-slate-300 p-2 outline-none focus:border-[#00F5B0] rounded min-h-[60px] font-sans leading-relaxed"
            required
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setReplyOpen(false)} className="text-[9px] font-mono text-slate-500 uppercase px-2 hover:text-white">Cancel</button>
            <button type="submit" className="text-[9px] font-mono text-[#00F5B0] border border-[#00F5B0]/20 hover:border-transparent hover:bg-[#00F5B0] hover:text-[#02060A] bg-transparent uppercase px-3 py-1.5">Reply</button>
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
  return (
    <main className="h-screen w-screen overflow-y-auto bg-[#02060A] text-[#e2e8f0] relative custom-scrollbar">
      <BackgroundEffects earthMode="cyber" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[rgba(2, 8, 15, 0.9)] to-transparent pointer-events-none z-10" />

      <Navbar earthMode="cyber" />

      <div className="content-container pt-32 pb-20 relative z-20 flex flex-col gap-12 animate-fade-up">
        
        {/* Navigation Link */}
        <div className="flex items-center gap-2 font-mono text-[10px] text-[#00F5B0] tracking-widest uppercase mb-2 select-none">
          <Link href="/" className="hover:text-white transition-colors">ORBIT SCANNER</Link>
          <span>/</span>
          <span className="text-[#7A8694]">{city.name} BRIEFING</span>
        </div>

        {/* ── HERO BANNER SECTION ────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="flex flex-col gap-2">
            <h1 className="editorial-title text-white">
              {city.name}
            </h1>
            <p className="editorial-subtitle text-[#7A8694]">
              {city.country} Hub Matrix · Coordinates: {city.lat.toFixed(4)}° N, {city.lon.toFixed(4)}° E
            </p>
          </div>

          {/* Year Selector */}
          <div className="flex border border-[#00F5B0]/15 p-1 rounded backdrop-blur bg-black/25 self-start md:self-auto">
            {([2030, 2040, 2050] as const).map(yr => (
              <button
                key={yr}
                onClick={() => setActiveYear(yr)}
                className={`px-5 py-1.5 font-mono text-[9px] uppercase tracking-widest rounded-sm transition-all ${
                  activeYear === yr
                    ? 'bg-[#00F5B0] text-[#02060A] font-medium'
                    : 'text-[#7A8694] hover:text-white'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>

        {/* Large Cover Image (Beneath name and brief) */}
        <div className="w-full h-[360px] overflow-hidden rounded border border-[#00F5B0]/15 relative">
          <img 
            src={cityExtended.image} 
            alt={city.name} 
            loading="lazy"
            className="w-full h-full object-cover filter brightness-[0.70] contrast-[1.02]" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#02060A]/80 via-transparent to-transparent" />
        </div>

        {/* 3 Key Metrics directly below cover image */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-tier-2 flex flex-col gap-3 p-5">
            <span className="font-mono text-[9px] tracking-widest text-[#00F5B0] uppercase font-bold">AI Integration</span>
            <span className="text-4xl font-light text-white">{aiAdoption.toFixed(0)}%</span>
            <p className="text-xs text-[#7A8694] leading-relaxed font-serif">
              Autonomous municipal systems manage transit pathways, microgrids, and local safety meshes, achieving high-efficiency resource routing.
            </p>
          </div>
          
          <div className="card-tier-2 flex flex-col gap-3 p-5">
            <span className="font-mono text-[9px] tracking-widest text-[#00F5B0] uppercase font-bold">Climate Stability</span>
            <span className="text-4xl font-light text-white">{climateStability.toFixed(0)}%</span>
            <p className="text-xs text-[#7A8694] leading-relaxed font-serif">
              Active geo-adaptive interventions, thermal cooling structures, and micro-climate management help maintain regional biological indicators.
            </p>
          </div>

          <div className="card-tier-2 flex flex-col gap-3 p-5">
            <span className="font-mono text-[9px] tracking-widest text-[#00F5B0] uppercase font-bold">Renewable Energy</span>
            <span className="text-4xl font-light text-white">{renewableEnergy.toFixed(0)}%</span>
            <p className="text-xs text-[#7A8694] leading-relaxed font-serif">
              Localized energy harvesting—powered by thin-film photovoltaic surfaces and deep thermal conversion loops—supports the municipal power grid.
            </p>
          </div>
        </div>

        {/* Central Editorial Narrative Briefing */}
        <div className="max-w-3xl flex flex-col gap-3 my-2">
          <h2 className="font-display text-xl font-light text-white uppercase tracking-wide border-b border-[#00F5B0]/15 pb-1.5 mb-2">Planetary Integration & Outlook</h2>
          <p className="font-serif text-sm text-[#7A8694] leading-relaxed font-light">
            As we approach the mid-century threshold, {city.name} undergoes a profound ecological and technological reorganization. 
            Under the guidance of planetary coordinator nodes, the metropolis faces evolving climate regimes with automated adaptive infrastructure. 
            The following matrix outlines the telemetry forecasts, technological milestones, and community consensus data for the year {activeYear}.
          </p>
        </div>

        {/* Secondary Metrics Dashboard Section */}
        <div className="flex flex-col gap-6">
          <div className="border-b border-[#00F5B0]/15 pb-2">
            <h2 className="text-base font-light text-white tracking-wider uppercase font-mono">
              Secondary Telemetry Indices ({activeYear})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-tier-3 flex flex-col gap-2 p-4">
              <span className="font-mono text-[9px] tracking-widest text-[#7A8694] uppercase">Mobility Index</span>
              <span className="text-2xl font-light text-white">{transportIndex.toFixed(0)}%</span>
              <p className="text-xs text-[#7A8694] leading-relaxed font-serif">
                Autonomous travel grids deploy demand-matched drone pods and subterranean high-speed tubes.
              </p>
            </div>

            <div className="card-tier-3 flex flex-col gap-2 p-4">
              <span className="font-mono text-[9px] tracking-widest text-[#7A8694] uppercase">Digital Infrastructure</span>
              <span className="text-2xl font-light text-white">{digitalInfra.toFixed(0)}%</span>
              <p className="text-xs text-[#7A8694] leading-relaxed font-serif">
                High-density optical transceivers and secure local ledgers prevent system telemetry desynchronization.
              </p>
            </div>

            <div className="card-tier-3 flex flex-col gap-2 p-4">
              <span className="font-mono text-[9px] tracking-widest text-[#7A8694] uppercase">Orbital Space Sync</span>
              <span className="text-2xl font-light text-white">{orbitalCoverage.toFixed(0)}%</span>
              <p className="text-xs text-[#7A8694] leading-relaxed font-serif">
                Direct satellite links from low-orbit tracking constellations verify regional carbon density.
              </p>
            </div>

            <div className="card-tier-3 flex flex-col gap-2 p-4 md:col-span-3">
              <span className="font-mono text-[9px] tracking-widest text-[#7A8694] uppercase font-bold">Demographics & carrying capacity</span>
              <span className="text-2xl font-light text-white">{population.toFixed(1)} Million Residents</span>
              <p className="text-xs text-[#7A8694] leading-relaxed font-serif">
                The city carrying capacity is projected to expand at an annual rate of +{((city.offsets.popGrowth - 1)*100).toFixed(1)}%. Biophilic zoning allows for high-density living without accelerating urban strain or carbon release.
              </p>
            </div>
          </div>
        </div>

        {/* ── SECTION 3: PREDICTIONS TIMELINE ───────────────────────────────── */}
        <div className="card-tier-2 flex flex-col gap-8">
          <div className="border-b border-[#00F5B0]/15 pb-3">
            <h2 className="text-lg font-light text-white tracking-wider uppercase">
              Roadmap Projections
            </h2>
          </div>

          <div className="relative border-l border-[#00F5B0]/15 ml-6 flex flex-col gap-10">
            {timelinePredictions.map(({ year, pred }) => {
              if (!pred) return null;
              return (
                <div key={year} className="relative pl-8">
                  {/* Minimal bullet indicator */}
                  <div className="absolute -left-1 w-2 h-2 rounded-full bg-[#00F5B0] mt-2" />
                  
                  <div className="card-tier-3 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10px] font-mono text-[#7A8694] tracking-wider">
                      <span className="font-semibold">{year} TARGET</span>
                      <span className="uppercase">{pred.category}</span>
                    </div>

                    <h3 className="text-lg text-white font-light uppercase">{pred.title}</h3>
                    <p className="font-serif text-sm text-[#7A8694] leading-relaxed">{pred.description}</p>
                    
                    <div className="flex justify-between items-center border-t border-[#00F5B0]/15 pt-3 mt-1 text-[9px] font-mono text-[#7A8694]">
                      <span>CONFIDENCE SCORING: {pred.confidenceScore}%</span>
                      <Link href={`/predictions/${pred.slug}`} className="text-[#00F5B0] hover:underline uppercase tracking-widest font-semibold text-[8px]">
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
        <div className="card-tier-2 flex flex-col gap-8">
          <div className="border-b border-[#00F5B0]/15 pb-3">
            <h2 className="text-lg font-light text-white tracking-wider uppercase">
              Futuristic Landmarks
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cityExtended.famousPlaces.map((place) => (
              <div 
                key={place.name}
                className="card-tier-3 flex flex-col gap-3"
              >
                <h3 className="text-base font-light text-white tracking-wide uppercase">
                  {place.name}
                </h3>
                <p className="font-serif text-xs text-[#7A8694] leading-relaxed">
                  {place.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 5: NOTABLE PEOPLE ─────────────────────────────────────── */}
        <div className="card-tier-2 flex flex-col gap-8">
          <div className="border-b border-[#00F5B0]/15 pb-3">
            <h2 className="text-lg font-light text-white tracking-wider uppercase">
              Notable System Architects
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cityExtended.notablePeople.map((person) => (
              <div 
                key={person.name}
                className="card-tier-3 flex gap-4 items-start"
              >
                <img 
                  src={person.avatar} 
                  alt={person.name} 
                  loading="lazy"
                  className="w-14 h-14 rounded-full border border-[#00F5B0]/15 object-cover"
                />
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-light text-white">{person.name}</h3>
                    <span className="font-mono text-[8px] text-[#00F5B0] uppercase tracking-widest">{person.role}</span>
                  </div>
                  <div className="font-mono text-[9px] text-[#7A8694] tracking-wider font-light">{person.specialty}</div>
                  <p className="font-serif text-xs text-[#7A8694] leading-relaxed mt-2">{person.contribution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 6: FUTURE PROJECTS ────────────────────────────────────── */}
        <div className="card-tier-2 flex flex-col gap-8">
          <div className="border-b border-[#00F5B0]/15 pb-3">
            <h2 className="text-lg font-light text-white tracking-wider uppercase">
              Metropolitan Development Projects
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cityExtended.futureProjects.map((proj) => (
              <div 
                key={proj.name}
                className="card-tier-3 flex flex-col gap-2"
              >
                <h3 className="text-base font-light text-white uppercase">{proj.name}</h3>
                <p className="font-serif text-xs text-[#7A8694] leading-relaxed">{proj.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 7: COMMUNITY INTELLIGENCE ─────────────────────────────── */}
        <div className="card-tier-2 flex flex-col gap-8">
          
          <div className="flex justify-between items-center border-b border-[#00F5B0]/15 pb-3">
            <h2 className="text-lg font-light text-white tracking-wider uppercase">
              Consensus Shard Thread
            </h2>

            {/* Like count button */}
            <button
              onClick={handleLike}
              className={`px-4 py-2 font-mono text-[9px] uppercase tracking-widest border transition-all duration-300 ${
                liked 
                  ? 'bg-[#00F5B0] text-[#02060A] border-[#00F5B0]'
                  : 'bg-transparent border-[#00F5B0]/15 hover:border-transparent hover:bg-[#00F5B0] hover:text-[#02060A] text-[#00F5B0]'
              }`}
            >
              ♥ SUPPORT PLAN ({likesCount})
            </button>
          </div>

          {/* Add Comment Form - Tier 3 */}
          <form onSubmit={handleAddTopComment} className="card-tier-3 flex flex-col gap-4">
            <span className="font-mono text-[10px] text-[#7A8694] uppercase tracking-wider">Add Comments to Ledger</span>
            <input
              type="text"
              placeholder="Identity alias..."
              value={newAuthor}
              onChange={e => setNewAuthor(e.target.value)}
              className="bg-transparent border-b border-[#00F5B0]/15 text-xs text-white py-2 outline-none focus:border-[#00F5B0] transition-colors font-mono"
              required
            />
            <textarea
              placeholder="Synthesize observations, critiques or recommendations for this timeline target..."
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              className="bg-transparent border border-[#00F5B0]/15 text-xs text-[#7A8694] p-3 outline-none focus:border-[#00F5B0] rounded min-h-[80px] font-sans leading-relaxed"
              required
            />
            <button
              type="submit"
              className="self-end px-5 py-2 border border-[#00F5B0]/20 hover:border-transparent hover:bg-[#00F5B0] hover:text-[#02060A] bg-transparent text-[#00F5B0] transition-all duration-300 font-mono text-[9px] tracking-widest uppercase"
            >
              TRANSMIT FEEDBACK
            </button>
          </form>

          {/* Comment Threads */}
          <div className="flex flex-col gap-5 divide-y divide-[#00F5B0]/10 mt-2">
            {comments.length === 0 ? (
              <div className="text-center py-6 font-mono text-xs text-[#7A8694]">
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
