'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';

const C = {
  bg: '#02060A',
  panel: '#040B12',
  primary: '#00F5B0',
  secondary: '#00D98F',
  accent: '#FFFFFF',
  white: '#F5F7FA',
  border: 'rgba(0, 245, 176, 0.15)',
};

interface FeedbackItem {
  id: string;
  category: 'Bug Report' | 'Feature Request' | 'Prediction Submission' | 'Partnership' | 'General Feedback';
  author: string;
  title: string;
  content: string;
  timestamp: string;
}

interface FeatureRequest {
  id: string;
  title: string;
  desc: string;
  initialVotes: number;
}

const PRESEEDED_FEATURES: FeatureRequest[] = [
  { id: 'feat-1', title: 'Mobile Holographic Projection HUD', desc: 'Synthesizing local environmental grids directly on mobile glasses and heads-up telemetry lenses.', initialVotes: 284 },
  { id: 'feat-2', title: 'Tectonic & Seismic Activity Mesh Sensors', desc: 'Plotting real-time core earthquake stress lines and magma flow telemetry on the 3D globe.', initialVotes: 219 },
  { id: 'feat-3', title: 'Historical Shard Comparisons (1950 vs 2050)', desc: 'Enabling dual timeline overlays to inspect ecosystem degradation versus technology reclamation arcs.', initialVotes: 188 },
  { id: 'feat-4', title: 'Oceanic Trash Vortex Sat-Sweepers', desc: 'Adding orbital laser targeting paths showing path flows of automated marine debris gatherers.', initialVotes: 142 },
  { id: 'feat-5', title: 'Decentralized Quantum Voting Ledger', desc: 'Securing timeline consensus records on entangled ledgers to block synthetic bot manipulation.', initialVotes: 107 },
];

export default function FeedbackPage() {
  const [category, setCategory] = useState<FeedbackItem['category']>('General Feedback');
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [featureVotes, setFeatureVotes] = useState<Record<string, number>>({});

  // Load submissions and votes on mount
  useEffect(() => {
    try {
      const cachedFeedback = localStorage.getItem('chrono_feedback_portal');
      if (cachedFeedback) {
        setFeedbackList(JSON.parse(cachedFeedback));
      } else {
        const initialList: FeedbackItem[] = [
          {
            id: 'fb-1',
            category: 'Feature Request',
            author: 'Aero_Engineer',
            title: 'Hydrogen drone paths display',
            content: 'Please add flight path coordinates for autonomous hydrogen transport drones around the Tokyo hub.',
            timestamp: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: 'fb-2',
            category: 'Bug Report',
            author: 'Orbit_Tech',
            title: 'MEO orbit speed scaling',
            content: 'MEO satellite orbit velocities seem to desynchronize slightly when timeline speed is set to 10x.',
            timestamp: new Date(Date.now() - 86400000).toISOString()
          }
        ];
        setFeedbackList(initialList);
        localStorage.setItem('chrono_feedback_portal', JSON.stringify(initialList));
      }

      const cachedVotes = localStorage.getItem('chrono_feedback_feature_votes');
      if (cachedVotes) {
        setFeatureVotes(JSON.parse(cachedVotes));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleTransmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !title.trim() || !content.trim()) return;

    const newItem: FeedbackItem = {
      id: `fb-${Date.now()}`,
      category,
      author,
      title,
      content,
      timestamp: new Date().toISOString(),
    };

    const updated = [newItem, ...feedbackList];
    setFeedbackList(updated);
    localStorage.setItem('chrono_feedback_portal', JSON.stringify(updated));
    
    // Clear inputs
    setAuthor('');
    setTitle('');
    setContent('');
  };

  const handleVoteFeature = (id: string) => {
    const current = featureVotes[id] || 0;
    const updated = { ...featureVotes, [id]: current + 1 };
    setFeatureVotes(updated);
    localStorage.setItem('chrono_feedback_feature_votes', JSON.stringify(updated));
  };

  const getFeatureVotes = (f: FeatureRequest) => {
    return f.initialVotes + (featureVotes[f.id] || 0);
  };

  // Sort feature requests by votes
  const sortedFeatures = [...PRESEEDED_FEATURES].sort((a, b) => getFeatureVotes(b) - getFeatureVotes(a));

  const panelStyle: React.CSSProperties = {
    background: 'rgba(2, 8, 15, 0.75)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '4px',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
  };

  const cornerAccent = null;

  return (
    <main className="h-screen w-screen overflow-y-auto bg-[#02060A] text-[#e2e8f0] relative custom-scrollbar">
      <BackgroundEffects earthMode="cyber" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[rgba(2, 8, 15, 0.9)] to-transparent pointer-events-none z-10" />

      <Navbar earthMode="cyber" />

      <div className="content-container pt-32 pb-20 relative z-20 flex flex-col gap-10 animate-fade-up">
        
        {/* Page Header */}
        <div className="flex flex-col gap-3 border-b border-[#00F5B0]/15 pb-6">
          <h1 className="editorial-title text-white">
            Feedback & Intelligence Portal
          </h1>
          <p className="editorial-subtitle text-[#7A8694]">
            Input bugs, feature requests, partnership applications, or prediction submissions. Fully synced with decentralized node records.
          </p>
        </div>

        {/* 2-Column Core Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Form submission - Tier 3 */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="card-tier-3 flex flex-col gap-5">
              
              <div className="flex items-center gap-3 border-b border-[#00F5B0]/15 pb-3">
                <span className="text-xs text-white">Submit transmission</span>
              </div>

              <form onSubmit={handleTransmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#7A8694]">Transmission category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="bg-[#03050a] border-b border-[#00F5B0]/15 py-2 text-xs text-white outline-none focus:border-[#00F5B0] transition-colors"
                  >
                    <option value="General Feedback">General Feedback</option>
                    <option value="Bug Report">Bug Report</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Prediction Submission">Prediction Submission</option>
                    <option value="Partnership">Partnership</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#7A8694]">Identity code (name)</label>
                  <input
                    type="text"
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    placeholder="E.g., User_Node_412"
                    className="bg-transparent border-b border-[#00F5B0]/15 py-2 text-xs text-white outline-none focus:border-[#00F5B0] transition-colors"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#7A8694]">Summary subject</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Brief description..."
                    className="bg-transparent border-b border-[#00F5B0]/15 py-2 text-xs text-white outline-none focus:border-[#00F5B0] transition-colors"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#7A8694]">Detailed log contents</label>
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Enter analytical details..."
                    className="bg-transparent border border-[#00F5B0]/15 rounded p-3 text-xs text-[#7A8694] outline-none focus:border-[#00F5B0] transition-colors min-h-[120px] leading-relaxed"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 border border-[#00F5B0]/20 hover:border-transparent hover:bg-[#00F5B0] hover:text-[#02060A] bg-transparent text-[#00F5B0] text-xs transition-all duration-300"
                >
                  Transmit feedback
                </button>
              </form>

            </div>
          </div>

          {/* Middle Column: Recent Feedback Feed - Tier 2 */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="card-tier-2 h-full flex flex-col gap-5">

              <div className="flex items-center gap-3 border-b border-[#00F5B0]/15 pb-3">
                <span className="text-xs text-white">Recent transmissions</span>
              </div>

              <div className="custom-scrollbar flex flex-col gap-4 overflow-y-auto max-h-[60vh] pr-2">
                {feedbackList.map(item => (
                  <div 
                    key={item.id}
                    className="card-tier-3 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-center text-xs text-[#7A8694]">
                      <span className="px-1.5 py-0.5 rounded border border-[#00F5B0]/15 text-[#00F5B0]">
                        {item.category}
                      </span>
                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>

                    <h4 className="text-xs font-light text-white mt-1">{item.title}</h4>
                    <p className="text-xs text-[#7A8694] leading-relaxed">{item.content}</p>
                    
                    <span className="text-xs text-[#7A8694] mt-1">Sender: {item.author}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Right Column: Most Requested & Contributors */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Feature Votes - Tier 2 */}
            <div className="card-tier-2 flex flex-col gap-4">

              <div className="flex items-center gap-3 border-b border-[#00F5B0]/15 pb-3">
                <span className="text-xs text-white">Most requested features</span>
              </div>

              <div className="flex flex-col gap-4">
                {sortedFeatures.map(feat => (
                  <div key={feat.id} className="flex gap-3 justify-between items-start border-b border-[#00F5B0]/15 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex-1 flex flex-col gap-1">
                      <h4 className="text-xs font-light text-white">{feat.title}</h4>
                      <p className="text-xs text-[#7A8694] leading-normal">{feat.desc}</p>
                    </div>
                    
                    <button
                      onClick={() => handleVoteFeature(feat.id)}
                      className="px-2 py-1.5 border border-[#00F5B0]/15 hover:border-transparent hover:bg-[#00F5B0] hover:text-[#02060A] rounded text-xs text-[#00F5B0] bg-transparent font-mono transition-colors flex flex-col items-center justify-center w-12"
                    >
                      <span>▲</span>
                      <span>{getFeatureVotes(feat)}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Contributor Rankings - Tier 2 */}
            <div className="card-tier-2 flex flex-col gap-4">

              <div className="flex items-center gap-3 border-b border-[#00F5B0]/15 pb-3">
                <span className="text-xs text-white">Top forecast contributors</span>
              </div>

              <div className="flex flex-col gap-3 text-xs">
                {[
                  { name: 'Dr. Evelyn Wright', role: 'AI Ethicist', shards: 142 },
                  { name: 'Dr. Kenji Sato', role: 'Orbital Logistics', shards: 115 },
                  { name: 'Prof. Liam Carter', role: 'Planetary Reclamation', shards: 98 },
                  { name: 'Dr. Sarah Jenkins', role: 'Bio-Geneticist', shards: 87 },
                  { name: 'User_Aura_Monitor', role: 'Community Node', shards: 64 },
                  { name: 'Operator_Nexus', role: 'System Sync', shards: 49 },
                ].map((item, idx) => (
                  <div key={item.name} className="flex justify-between items-center border-b border-[#00F5B0]/15 pb-2 last:border-0 last:pb-0">
                    <div className="flex gap-2">
                      <span className="text-[#00F5B0]/40 font-mono w-3">{idx + 1}.</span>
                      <div>
                        <span className="text-white block">{item.name}</span>
                        <span className="text-[#7A8694] text-xs">{item.role}</span>
                      </div>
                    </div>
                    <span className="text-white"><span className="font-mono">{item.shards}</span> logged</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
