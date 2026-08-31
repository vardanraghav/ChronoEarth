'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import Footer from '@/components/Footer';
import { citiesRawData, generateCityProjections } from '@/data/citiesData';
import { getExtendedCityData, getCitySlug } from '@/data/citiesExtendedData';
import { PREDICTIONS, Comment } from '@/data/predictionsData';
import { useCities } from '@/hooks/useCities';
import { usePredictions } from '@/hooks/usePredictions';

const C = {
  bg: '#02060A',
  panel: '#040B12',
  primary: '#00F5B0',
  secondary: '#00D98F',
  accent: '#FFFFFF',
  white: '#F5F7FA',
  border: 'rgba(0, 245, 176, 0.15)',
};

const ProgressBar = ({ value, label, isRisk = false }: { value: number; label: string; isRisk?: boolean }) => {
  const color = isRisk ? (value > 70 ? '#F43F5E' : (value > 45 ? '#FFB800' : '#00F5B0')) : '#00F5B0';
  const shadowColor = isRisk ? (value > 70 ? 'rgba(244, 63, 94, 0.4)' : (value > 45 ? 'rgba(255, 184, 0, 0.4)' : 'rgba(0, 245, 176, 0.4)')) : 'rgba(0, 245, 176, 0.4)';
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-[#7A8694]">
        <span>{label}</span>
        <span style={{ color, fontWeight: 500 }}>{value}%</span>
      </div>
      <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden relative">
        <div 
          className="h-full rounded-full transition-all duration-500" 
          style={{ 
            width: `${value}%`, 
            backgroundColor: color, 
            boxShadow: `0 0 6px ${shadowColor}` 
          }} 
        />
      </div>
    </div>
  );
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
      
      <div className="flex justify-between items-center text-xs text-[#00F5B0]">
        <span className="text-white">{comment.author}</span>
        <span className="text-[#7A8694]">{new Date(comment.timestamp).toLocaleDateString()}</span>
      </div>
      
      <p className="text-xs text-[#7A8694] leading-relaxed">
        {comment.content}
      </p>
      
      <div className="flex items-center gap-4 text-xs mt-1">
        <button 
          onClick={() => onVote(comment.id)} 
          className="text-[#00F5B0] hover:text-[#00D98F] transition-colors font-mono"
        >
          ▲ {comment.votes}
        </button>
        <button 
          onClick={() => setReplyOpen(!replyOpen)} 
          className="text-[#00F5B0] hover:underline transition-all"
        >
          {replyOpen ? 'Close reply' : 'Reply'}
        </button>
      </div>

      {replyOpen && (
        <form onSubmit={submitReply} className="mt-3 flex flex-col gap-3 card-tier-3">
          <input
            type="text"
            placeholder="Identity alias..."
            value={replyAuthor}
            onChange={e => setReplyAuthor(e.target.value)}
            className="bg-transparent border-b border-[#00F5B0]/15 text-xs text-white py-1.5 outline-none focus:border-[#00F5B0]"
            required
          />
          <textarea
            placeholder="Synthesize transmission reply..."
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            className="bg-transparent border border-[#00F5B0]/15 text-xs text-slate-300 p-2 outline-none focus:border-[#00F5B0] rounded min-h-[60px] leading-relaxed"
            required
          />
          <div className="flex gap-2 justify-end text-xs">
            <button type="button" onClick={() => setReplyOpen(false)} className="text-slate-500 px-2 hover:text-white">Cancel</button>
            <button type="submit" className="text-[#00F5B0] border border-[#00F5B0]/20 hover:border-transparent hover:bg-[#00F5B0] hover:text-[#02060A] bg-transparent px-3 py-1">Reply</button>
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
  const { cities } = useCities();
  const { predictions } = usePredictions();

  // Match raw city entry
  const city = cities.find(c => getCitySlug(c.name) === slug);
  const cityExtended = city ? getExtendedCityData(city.name) : null;

  const [activeYear, setActiveYear] = useState<2030 | 2040 | 2050>(2050);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newAuthor, setNewAuthor] = useState('');
  const [newContent, setNewContent] = useState('');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(148);
  const [imageError, setImageError] = useState(false);
  const [failedAvatars, setFailedAvatars] = useState<Record<string, boolean>>({});

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
      // Handle error silently
    }
  }, [slug, city, activeYear]);

  if (!city || !cityExtended) {
    return (
      <main className="h-screen w-screen bg-[#02060A] flex flex-col items-center justify-center text-white gap-4">
        <div>City archive access corrupted</div>
        <Link href="/" className="text-[#00F5B0] hover:underline">← Return to main grid</Link>
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
  const cityPredictions = predictions.filter(
    p => p.city.toLowerCase() === city.name.toLowerCase()
  );

  const timelinePredictions = [
    { 
      year: 2030 as const, 
      pred: cityPredictions.find(p => p.year === 2030) || predictions.find(p => p.year === 2030 && p.category === 'AI') 
    },
    { 
      year: 2040 as const, 
      pred: cityPredictions.find(p => p.year === 2040) || predictions.find(p => p.year === 2040 && p.category === 'Climate') 
    },
    { 
      year: 2050 as const, 
      pred: cityPredictions.find(p => p.year === 2050) || predictions.find(p => p.year === 2050 && p.category === 'Energy') 
    }
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

  return (
    <main className="min-h-screen w-full bg-[#02060A] text-[#e2e8f0] relative">
      <BackgroundEffects earthMode="cyber" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[rgba(2, 8, 15, 0.9)] to-transparent pointer-events-none z-10" />

      <Navbar earthMode="cyber" />

      <div className="reading-container pt-36 pb-24 relative z-20 flex flex-col gap-12 animate-fade-up">
        
        {/* Navigation Link */}
        <div className="flex items-center gap-2 text-xs text-[#00F5B0] mb-2 select-none">
          <Link href="/" className="hover:text-white transition-colors">Orbit scanner</Link>
          <span>/</span>
          <span className="text-[#7A8694]">{city.name} briefing</span>
        </div>

        {/* ── HERO BANNER SECTION ────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="flex flex-col gap-2">
            <h1 className="editorial-title text-white">
              {city.name}
            </h1>
            <p className="editorial-subtitle text-[#7A8694]">
              {city.country} hub matrix · Coordinates: <span className="font-mono">{city.lat.toFixed(4)}° N, {city.lon.toFixed(4)}° E</span>
            </p>
          </div>

          {/* Year Selector */}
          <div className="flex border border-[#00F5B0]/15 p-1 rounded backdrop-blur bg-black/25 self-start md:self-auto">
            {([2030, 2040, 2050] as const).map(yr => (
              <button
                key={yr}
                onClick={() => setActiveYear(yr)}
                className={`px-5 py-1.5 text-xs rounded-sm transition-all ${
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
        <div className="w-full h-[360px] overflow-hidden rounded border border-[#00F5B0]/15 relative bg-black/40">
          {imageError ? (
            <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#040B12] to-[#02060A]">
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(0,245,176,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,176,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
              <div className="absolute w-48 h-48 rounded-full border border-[#00F5B0]/10 animate-breathe" />
              <span className="text-xs font-mono text-[#00F5B0]/60 uppercase tracking-[0.25em] z-10">Telemetry Feed Offline</span>
            </div>
          ) : (
            <img 
              src={cityExtended.image} 
              alt={city.name} 
              loading="lazy"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover filter brightness-[0.70] contrast-[1.02]" 
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#02060A]/80 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* 3 Key Metrics directly below cover image */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-tier-2 flex flex-col gap-3 p-5">
            <span className="text-xs text-[#00F5B0]">AI integration</span>
            <span className="text-4xl font-light text-white font-mono">{aiAdoption.toFixed(0)}%</span>
            <p className="text-xs text-[#7A8694] leading-relaxed">
              Autonomous municipal systems manage transit pathways, microgrids, and local safety meshes, achieving high-efficiency resource routing.
            </p>
          </div>
          
          <div className="card-tier-2 flex flex-col gap-3 p-5">
            <span className="text-xs text-[#00F5B0] flex justify-between items-center">
              <span>Climate stability</span>
              <Link href={`/climate?city=${encodeURIComponent(city.name)}`} className="text-[10px] text-white/40 hover:text-[#00F5B0] underline">
                View Forecast →
              </Link>
            </span>
            <span className="text-4xl font-light text-white font-mono">{climateStability.toFixed(0)}%</span>
            <p className="text-xs text-[#7A8694] leading-relaxed">
              Active geo-adaptive interventions, thermal cooling structures, and micro-climate management help maintain regional biological indicators.
            </p>
          </div>

          <div className="card-tier-2 flex flex-col gap-3 p-5">
            <span className="text-xs text-[#00F5B0]">Renewable energy</span>
            <span className="text-4xl font-light text-white font-mono">{renewableEnergy.toFixed(0)}%</span>
            <p className="text-xs text-[#7A8694] leading-relaxed">
              Localized energy harvesting—powered by thin-film photovoltaic surfaces and deep thermal conversion loops—supports the municipal power grid.
            </p>
          </div>
        </div>

        {/* Central Editorial Narrative Briefing */}
        <div className="max-w-3xl flex flex-col gap-3 my-2">
          <h2 className="text-lg font-light text-white border-b border-[#00F5B0]/15 pb-1.5 mb-2">Planetary integration & outlook</h2>
          <p className="text-sm text-[#7A8694] leading-relaxed font-light">
            As we approach the mid-century threshold, {city.name} undergoes a profound ecological and technological reorganization. 
            Under the guidance of planetary coordinator nodes, the metropolis faces evolving climate regimes with automated adaptive infrastructure. 
            The following matrix outlines the telemetry forecasts, technological milestones, and community consensus data for the year {activeYear}.
          </p>
        </div>

        {/* Climate Outlook & Risk Analysis */}
        <div className="flex flex-col gap-6">
          <div className="border-b border-[#00F5B0]/15 pb-2">
            <h2 className="text-base font-light text-white uppercase tracking-wider font-mono">
              Climate Outlook & Risk Analysis ({activeYear})
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Climate Projections Summary */}
            <div className="card-tier-2 flex flex-col gap-4 p-6 lg:col-span-2">
              <span className="text-[10px] text-[#00F5B0] font-mono uppercase tracking-wider font-semibold">Climate Projections Shard</span>
              <p className="text-sm text-slate-300 leading-relaxed font-light m-0">
                ChronoOS atmospheric simulation indicates a temperature anomaly increase of +{(city.offsets.tempRise * yearIndex * 0.4).toFixed(1)}°C by {activeYear} relative to baseline coefficients. 
                {city.offsets.seaLevel > 0 
                  ? ` Subsea accretion dikes are currently running at peak density to buffer the projected +${(city.offsets.seaLevel * yearIndex * 0.08).toFixed(2)}m sea-level rise.` 
                  : ' Localized microclimate cooling spires are active to mitigate extreme landward thermal accumulation.'
                }
              </p>
              <div className="border-t border-white/5 pt-3 mt-1 flex flex-col gap-1 text-xs text-[#7A8694]">
                <span>Timeline Target: <span className="text-white font-mono">{activeYear} Forecast</span></span>
                <span>Ecological Adaptations: <span className="text-[#00F5B0] font-mono">{city.details.climate}</span></span>
              </div>
            </div>

            {/* Risk Index Progress bars */}
            <div className="card-tier-2 flex flex-col gap-5 p-6">
              <span className="text-[10px] text-rose-400 font-mono uppercase tracking-wider font-semibold">Risk Analysis Matrix</span>
              
              <ProgressBar value={Math.round(Math.min(99, city.offsets.tempRise * 65))} label="Heat dome stress index" isRisk={true} />
              <ProgressBar value={city.offsets.seaLevel > 0 ? Math.round(Math.min(99, city.offsets.seaLevel * 45 + 35)) : (city.name === 'New Delhi' || city.name === 'Cairo' || city.name === 'Nairobi' ? 88 : 42)} label="Water stress / Inundation index" isRisk={true} />
              <ProgressBar value={Math.round((Math.round(Math.min(99, city.offsets.tempRise * 65)) + (city.offsets.seaLevel > 0 ? Math.round(Math.min(99, city.offsets.seaLevel * 45 + 35)) : (city.name === 'New Delhi' || city.name === 'Cairo' || city.name === 'Nairobi' ? 88 : 42))) / 2)} label="Compound Planetary Risk Score" isRisk={true} />
            </div>

            {/* Population Forecast */}
            <div className="card-tier-3 flex flex-col gap-2.5 p-5 lg:col-span-3">
              <span className="text-xs text-[#7A8694] font-mono uppercase tracking-wider">Planetary Demographics Forecast</span>
              <span className="text-2xl font-light text-white"><span className="font-mono text-[#00F5B0] font-bold">{population.toFixed(1)}</span> million residents</span>
              <p className="text-xs text-[#7A8694] leading-relaxed m-0 mt-1">
                The carrying capacity vector is expanding at +<span className="font-mono text-white">{((city.offsets.popGrowth - 1)*100).toFixed(1)}%</span> annually. Active biophilic vertical zoning maps are required to prevent regional carbon overload.
              </p>
            </div>

          </div>
        </div>

        {/* ── SECTION 3: PREDICTIONS TIMELINE ───────────────────────────────── */}
        <div className="card-tier-2 flex flex-col gap-8">
          <div className="border-b border-[#00F5B0]/15 pb-3">
            <h2 className="text-lg font-light text-white">
              Roadmap projections
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
                    <div className="flex justify-between items-center text-xs text-[#7A8694]">
                      <span><span className="font-mono">{year}</span> target</span>
                      <span>{pred.category}</span>
                    </div>

                    <h3 className="text-lg text-white font-light">{pred.title}</h3>
                    <p className="text-sm text-[#7A8694] leading-relaxed">{pred.description}</p>
                    
                    <div className="flex justify-between items-center border-t border-[#00F5B0]/15 pt-3 mt-1 text-xs text-[#7A8694]">
                      <span>Confidence scoring: <span className="font-mono">{pred.confidenceScore}%</span></span>
                      <Link href={`/predictions/${pred.slug}`} className="text-[#00F5B0] hover:underline">
                        Read document →
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
            <h2 className="text-lg font-light text-white">
              Futuristic landmarks
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cityExtended.famousPlaces.map((place) => (
              <div 
                key={place.name}
                className="card-tier-3 flex flex-col gap-3"
              >
                <h3 className="text-base font-light text-white">
                  {place.name}
                </h3>
                <p className="text-xs text-[#7A8694] leading-relaxed">
                  {place.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 5: NOTABLE PEOPLE ─────────────────────────────────────── */}
        <div className="card-tier-2 flex flex-col gap-8">
          <div className="border-b border-[#00F5B0]/15 pb-3">
            <h2 className="text-lg font-light text-white">
              Notable system architects
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cityExtended.notablePeople.map((person) => (
              <div 
                key={person.name}
                className="card-tier-3 flex gap-4 items-start"
              >
                {failedAvatars[person.name] ? (
                  <div className="w-14 h-14 rounded-full border border-[#00F5B0]/20 flex items-center justify-center bg-[#040B12] text-xs font-mono text-[#00F5B0] font-bold shrink-0">
                    {person.name.split(' ').map(n => n[0]).join('')}
                  </div>
                ) : (
                  <img 
                    src={person.avatar} 
                    alt={person.name} 
                    loading="lazy"
                    onError={() => setFailedAvatars(prev => ({ ...prev, [person.name]: true }))}
                    className="w-14 h-14 rounded-full border border-[#00F5B0]/15 object-cover shrink-0"
                  />
                )}
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <div className="flex justify-between items-start gap-1">
                    <h3 className="text-base font-light text-white truncate">{person.name}</h3>
                    <span className="text-xs text-[#00F5B0] shrink-0">{person.role}</span>
                  </div>
                  <div className="text-xs text-[#7A8694] font-light">{person.specialty}</div>
                  <p className="text-xs text-[#7A8694] leading-relaxed mt-2">{person.contribution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 6: FUTURE PROJECTS ────────────────────────────────────── */}
        <div className="card-tier-2 flex flex-col gap-8">
          <div className="border-b border-[#00F5B0]/15 pb-3">
            <h2 className="text-lg font-light text-white">
              Metropolitan development projects
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cityExtended.futureProjects.map((proj) => (
              <div 
                key={proj.name}
                className="card-tier-3 flex flex-col gap-2"
              >
                <h3 className="text-base font-light text-white">{proj.name}</h3>
                <p className="text-xs text-[#7A8694] leading-relaxed">{proj.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 7: COMMUNITY INTELLIGENCE ─────────────────────────────── */}
        <div className="card-tier-2 flex flex-col gap-8">
          
          <div className="flex justify-between items-center border-b border-[#00F5B0]/15 pb-3">
            <h2 className="text-lg font-light text-white">
              Consensus shard thread
            </h2>

            {/* Like count button */}
            <button
              onClick={handleLike}
              className={`px-4 py-1.5 text-xs border transition-all duration-300 ${
                liked 
                  ? 'bg-[#00F5B0] text-[#02060A] border-[#00F5B0]'
                  : 'bg-transparent border-[#00F5B0]/15 hover:border-transparent hover:bg-[#00F5B0] hover:text-[#02060A] text-[#00F5B0]'
              }`}
            >
              ♥ Support plan ({likesCount})
            </button>
          </div>

          {/* Add Comment Form - Tier 3 */}
          <form onSubmit={handleAddTopComment} className="card-tier-3 flex flex-col gap-4">
            <span className="text-xs text-[#7A8694]">Add comments to ledger</span>
            <input
              type="text"
              placeholder="Identity alias…"
              value={newAuthor}
              onChange={e => setNewAuthor(e.target.value)}
              className="bg-transparent border-b border-[#00F5B0]/15 text-xs text-white py-2 outline-none focus:border-[#00F5B0] focus-visible:ring-1 focus-visible:ring-[#00F5B0] transition-colors"
              required
            />
            <textarea
              placeholder="Synthesize observations, critiques or recommendations for this timeline target…"
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              className="bg-transparent border border-[#00F5B0]/15 text-xs text-[#7A8694] p-3 outline-none focus:border-[#00F5B0] focus-visible:ring-1 focus-visible:ring-[#00F5B0] rounded min-h-[80px] leading-relaxed"
              required
            />
            <button
              type="submit"
              className="self-end px-5 py-1.5 border border-[#00F5B0]/20 hover:border-transparent hover:bg-[#00F5B0] hover:text-[#02060A] bg-transparent text-[#00F5B0] transition-all duration-300 text-xs focus-visible:ring-1 focus-visible:ring-[#00F5B0] outline-none"
            >
              Transmit feedback
            </button>
          </form>

          {/* Comment Threads */}
          <div className="flex flex-col gap-5 divide-y divide-[#00F5B0]/10 mt-2">
            {comments.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#7A8694]">
                Awaiting ledger shard data…
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
      <Footer />
    </main>
  );
}
