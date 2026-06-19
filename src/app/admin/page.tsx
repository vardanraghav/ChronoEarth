'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import BackgroundEffects from '@/components/BackgroundEffects';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type TabType = 'users' | 'predictions' | 'knowledge' | 'cities' | 'chats' | 'markets' | 'space' | 'earthquakes';

export default function AdminPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [stats, setStats] = useState({
    users: 0,
    predictions: 0,
    knowledge: 0,
    cities: 0,
    chats: 0,
    markets: 0,
    space: 0,
    earthquakes: 0,
  });

  const [loadingData, setLoadingData] = useState(true);
  const [listData, setListData] = useState<any[]>([]);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user || role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const fetchStatsAndTab = async () => {
      try {
        setLoadingData(true);
        
        // 1. Fetch counts (parallelized)
        const [
          { count: usersCount },
          { count: predictionsCount },
          { count: knowledgeCount },
          { count: citiesCount },
          { count: chatsCount },
          { count: marketsCount },
          { count: spaceCount },
          { count: quakeCount }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('predictions').select('*', { count: 'exact', head: true }),
          supabase.from('knowledge_base').select('*', { count: 'exact', head: true }),
          supabase.from('cities').select('*', { count: 'exact', head: true }),
          supabase.from('futurechat_conversations').select('*', { count: 'exact', head: true }),
          supabase.from('market_snapshots').select('*', { count: 'exact', head: true }),
          supabase.from('space_events').select('*', { count: 'exact', head: true }),
          supabase.from('earthquakes').select('*', { count: 'exact', head: true })
        ]);

        setStats({
          users: usersCount || 0,
          predictions: predictionsCount || 0,
          knowledge: knowledgeCount || 0,
          cities: citiesCount || 0,
          chats: chatsCount || 0,
          markets: marketsCount || 0,
          space: spaceCount || 0,
          earthquakes: quakeCount || 0
        });

        // 2. Fetch list based on active tab
        await fetchTabDetails(activeTab);
      } catch (err) {
        console.error('Admin query failure:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchStatsAndTab();
  }, [user, role, loading, activeTab, router]);

  const fetchTabDetails = async (tab: TabType) => {
    let query: any;
    
    switch (tab) {
      case 'users':
        // Join profiles and roles
        query = supabase
          .from('profiles')
          .select(`
            id, email, full_name, avatar_url, created_at,
            user_roles ( role )
          `)
          .order('created_at', { ascending: false });
        break;
      case 'predictions':
        query = supabase
          .from('predictions')
          .select('id, title, category, author, votes, created_at')
          .order('votes', { ascending: false })
          .limit(100);
        break;
      case 'knowledge':
        query = supabase
          .from('knowledge_base')
          .select('id, title, category, readiness_index, slug')
          .order('category', { ascending: true })
          .limit(100);
        break;
      case 'cities':
        query = supabase
          .from('cities')
          .select('id, name, country, year, lat, lon')
          .order('name', { ascending: true });
        break;
      case 'chats':
        query = supabase
          .from('futurechat_conversations')
          .select(`
            id, user_id, role, message, created_at,
            profiles ( email, full_name )
          `)
          .order('created_at', { ascending: false })
          .limit(100);
        break;
      case 'markets':
        query = supabase
          .from('market_snapshots')
          .select('id, ticker, price, change, change_percent, timestamp')
          .order('timestamp', { ascending: false })
          .limit(50);
        break;
      case 'space':
        query = supabase
          .from('space_events')
          .select('id, event_type, title, event_date')
          .order('event_date', { ascending: false })
          .limit(50);
        break;
      case 'earthquakes':
        query = supabase
          .from('earthquakes')
          .select('id, magnitude, place, time')
          .order('time', { ascending: false })
          .limit(50);
        break;
    }

    const { data, error } = await query;
    if (!error && data) {
      setListData(data);
    } else {
      console.error(`Error loading active tab details [${tab}]:`, error);
      setListData([]);
    }
  };

  // Promote / Demote Role
  const handleToggleUserRole = async (userId: string, currentRole: string) => {
    if (userId === user?.id) {
      alert('Action blocked: Modifying your own admin permissions is restricted.');
      return;
    }

    setUpdatingUser(userId);
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;
      
      // Update Firestore users document
      const { db: firestoreDb } = await import('@/lib/firebase');
      const { doc: fireDoc, setDoc: fireSetDoc } = await import('firebase/firestore');
      const userRef = fireDoc(firestoreDb, 'users', userId);
      await fireSetDoc(userRef, { role: newRole }, { merge: true });
      
      // Update list state
      setListData(prev => prev.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            user_roles: { role: newRole }
          };
        }
        return u;
      }));
    } catch (err: any) {
      alert(`Role transition failed: ${err.message}`);
    } finally {
      setUpdatingUser(null);
    }
  };

  if (loading || !user || role !== 'admin') {
    return (
      <main className="min-h-screen w-full bg-[#02060A] text-white flex items-center justify-center font-mono text-xs uppercase tracking-widest">
        <span>Authenticating administrator credential keys...</span>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#02060A] text-[#e2e8f0] relative pb-24">
      <BackgroundEffects earthMode="cyber" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[rgba(2,6,10,0.95)] to-transparent pointer-events-none z-10" />
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-32 relative z-20 flex flex-col gap-8 font-mono animate-fade-up">
        
        {/* Header HUD */}
        <div className="flex flex-col gap-3 border-b border-rose-500/20 pb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="flex items-center gap-2 text-rose-400 text-xs font-mono uppercase tracking-[0.3em] font-semibold">
            <span>⚡ CENTRAL MASTER CONTROL DESK</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <h1 className="text-2xl font-light text-white tracking-wider uppercase m-0">
            Admin Operations Panel
          </h1>
          <p className="text-xs text-white/50 uppercase tracking-widest m-0">
            Monitor real-time sync nodes, manage profile roles, and inspect database telemetry
          </p>
        </div>

        {/* STATS TELEMETRY GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'System Users', count: stats.users, tab: 'users', color: '#00E5FF', icon: '👤' },
            { label: 'Forecasts', count: stats.predictions, tab: 'predictions', color: '#00F5B0', icon: '🔮' },
            { label: 'Codex Shards', count: stats.knowledge, tab: 'knowledge', color: '#BF5AF2', icon: '📚' },
            { label: 'Sim Cities', count: stats.cities, tab: 'cities', color: '#0A84FF', icon: '🌍' },
            { label: 'Chat Logs', count: stats.chats, tab: 'chats', color: '#FF9500', icon: '💬' },
            { label: 'Markets Snap', count: stats.markets, tab: 'markets', color: '#00F5D4', icon: '📈' },
            { label: 'Space Orbits', count: stats.space, tab: 'space', color: '#FF0055', icon: '🚀' },
            { label: 'Seismic Warning', count: stats.earthquakes, tab: 'earthquakes', color: '#EF4444', icon: '🌋' },
          ].map(stat => {
            const isSelected = activeTab === stat.tab;
            return (
              <button
                key={stat.tab}
                onClick={() => setActiveTab(stat.tab as TabType)}
                className="card-tier-2 text-left p-4 cursor-pointer hover:-translate-y-0.5 transition-all flex justify-between items-center relative group"
                style={{ 
                  borderColor: isSelected ? stat.color : 'rgba(255,255,255,0.05)',
                  boxShadow: isSelected ? `0 0 15px ${stat.color}15` : 'none'
                }}
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[9px] text-[#7A8694] uppercase tracking-wider font-semibold group-hover:text-white/60 transition-colors">
                    {stat.icon} {stat.label}
                  </span>
                  <span className="text-xl font-bold text-white tracking-wider">
                    {stat.count}
                  </span>
                </div>
                {isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stat.color, boxShadow: `0 0 8px ${stat.color}` }} />
                )}
              </button>
            );
          })}
        </div>

        {/* OPERATIONS DIRECTORY LIST */}
        <div className="flex flex-col gap-4">
          <div className="border-l-2 border-rose-500 pl-3 py-0.5">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider m-0">
              Inspection Node: {activeTab.toUpperCase()}
            </h2>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">
              Reviewing operational ledger rows
            </span>
          </div>

          <div 
            className="premium-glass rounded-lg border border-white/5 overflow-hidden" 
            style={{ backgroundColor: 'rgba(4, 11, 18, 0.7)' }}
          >
            {loadingData ? (
              <div className="text-center py-16 text-xs text-[#7A8694]">
                Parsing database tables...
              </div>
            ) : listData.length === 0 ? (
              <div className="text-center py-16 text-xs text-[#7A8694]">
                No records found. Node is empty.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      {activeTab === 'users' && (
                        <>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">Avatar</th>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">Alias / Name</th>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">Email</th>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">Joined At</th>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">System Privilege</th>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold text-right">Action</th>
                        </>
                      )}
                      {activeTab === 'predictions' && (
                        <>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">Title</th>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">Sector</th>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">Futurologist</th>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">Timeline Votes</th>
                        </>
                      )}
                      {activeTab === 'knowledge' && (
                        <>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">Codex Title</th>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">Sector</th>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">Readiness Index</th>
                        </>
                      )}
                      {activeTab === 'cities' && (
                        <>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">City Name</th>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">Country</th>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">Coordinates</th>
                        </>
                      )}
                      {activeTab === 'chats' && (
                        <>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">User</th>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">Role</th>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold w-1/2">Message Node</th>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">Timestamp</th>
                        </>
                      )}
                      {activeTab === 'markets' && (
                        <>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">Ticker</th>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">Price</th>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">Change</th>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">Synced</th>
                        </>
                      )}
                      {activeTab === 'space' && (
                        <>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">Category</th>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">Orbital Event</th>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">Target Date</th>
                        </>
                      )}
                      {activeTab === 'earthquakes' && (
                        <>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">Magnitude</th>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">Location</th>
                          <th className="p-3 text-[#7A8694] uppercase font-semibold">Timestamp</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans font-light">
                    {listData.map((row) => (
                      <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                        
                        {/* Tab: Users */}
                        {activeTab === 'users' && (
                          <>
                            <td className="p-3">
                              <img 
                                src={row.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${row.email}`} 
                                alt="avatar" 
                                className="w-6 h-6 rounded-full border border-white/10"
                              />
                            </td>
                            <td className="p-3 font-mono font-semibold text-white">{row.full_name || 'No Alias'}</td>
                            <td className="p-3">{row.email}</td>
                            <td className="p-3 text-[#7A8694]">{new Date(row.created_at).toLocaleDateString()}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold uppercase ${
                                (row.user_roles?.role || 'user') === 'admin' 
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                                  : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                              }`}>
                                {row.user_roles?.role || 'user'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                disabled={updatingUser === row.id}
                                onClick={() => handleToggleUserRole(row.id, row.user_roles?.role || 'user')}
                                className="px-2 py-1 bg-transparent hover:bg-white/5 border border-white/10 hover:border-white/20 text-[#00E5FF] font-mono text-[10px] rounded cursor-pointer transition-all disabled:opacity-50 uppercase"
                              >
                                {updatingUser === row.id ? 'Syncing...' : (row.user_roles?.role === 'admin' ? 'Demote' : 'Promote')}
                              </button>
                            </td>
                          </>
                        )}

                        {/* Tab: Predictions */}
                        {activeTab === 'predictions' && (
                          <>
                            <td className="p-3 font-mono font-semibold text-white">{row.title}</td>
                            <td className="p-3 uppercase font-mono text-xs">{row.category}</td>
                            <td className="p-3">{row.author}</td>
                            <td className="p-3 font-mono text-white/80">{row.votes} votes</td>
                          </>
                        )}

                        {/* Tab: Knowledge */}
                        {activeTab === 'knowledge' && (
                          <>
                            <td className="p-3 font-mono font-semibold text-white">{row.title}</td>
                            <td className="p-3 uppercase font-mono text-xs">{row.category}</td>
                            <td className="p-3 font-mono text-white/80">{row.readiness_index || '--'}%</td>
                          </>
                        )}

                        {/* Tab: Cities */}
                        {activeTab === 'cities' && (
                          <>
                            <td className="p-3 font-mono font-semibold text-white">{row.name}</td>
                            <td className="p-3">{row.country}</td>
                            <td className="p-3 font-mono text-slate-400">{row.lat?.toFixed(4)}, {row.lon?.toFixed(4)}</td>
                          </>
                        )}

                        {/* Tab: Chats */}
                        {activeTab === 'chats' && (
                          <>
                            <td className="p-3">
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-white truncate max-w-[120px]">{row.profiles?.full_name || 'No Alias'}</span>
                                <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{row.profiles?.email || row.user_id.substring(0, 8)}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                                row.role === 'assistant' ? 'bg-[#00F5B0]/10 text-[#00F5B0]' : 'bg-white/10 text-white'
                              }`}>
                                {row.role}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-slate-300 break-words max-w-sm">{row.message}</td>
                            <td className="p-3 text-slate-500 font-mono text-[10px]">{new Date(row.created_at).toLocaleString()}</td>
                          </>
                        )}

                        {/* Tab: Markets */}
                        {activeTab === 'markets' && (
                          <>
                            <td className="p-3 font-mono font-semibold text-white">{row.ticker}</td>
                            <td className="p-3 font-mono text-[#00F5B0]">${row.price}</td>
                            <td className="p-3 font-mono">
                              <span style={{ color: row.change >= 0 ? '#00F5B0' : '#FF0055' }}>
                                {row.change >= 0 ? '+' : ''}{row.change} ({row.change_percent})
                              </span>
                            </td>
                            <td className="p-3 text-slate-500 font-mono text-[10px]">{new Date(row.timestamp).toLocaleTimeString()}</td>
                          </>
                        )}

                        {/* Tab: Space */}
                        {activeTab === 'space' && (
                          <>
                            <td className="p-3 uppercase font-mono text-[10px] text-[#BF5AF2]">{row.event_type}</td>
                            <td className="p-3 font-mono font-semibold text-white">{row.title}</td>
                            <td className="p-3 font-mono text-slate-400">{new Date(row.event_date).toLocaleDateString()}</td>
                          </>
                        )}

                        {/* Tab: Earthquakes */}
                        {activeTab === 'earthquakes' && (
                          <>
                            <td className="p-3 font-mono font-semibold text-red-400">{row.magnitude} Mag</td>
                            <td className="p-3">{row.place}</td>
                            <td className="p-3 text-slate-500 font-mono text-[10px]">{new Date(row.time).toLocaleString()}</td>
                          </>
                        )}

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
      <Footer />
    </main>
  );
}
