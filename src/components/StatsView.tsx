import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Song } from './AppView';
import { Sparkles, Zap, Trophy, Music, Calendar, Layers, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface StatsViewProps {
  history: Song[];
  userName: string;
  songsThisWeek: number;
  streak: number;
}

const COLORS = ['#1DB954', '#1ed760', '#22c55e', '#4ade80', '#86efac'];

export function StatsView({ history, userName, songsThisWeek, streak }: StatsViewProps) {
  const [vibe, setVibe] = useState<string>("Analyzing your vibe...");

  // Generate Genre Data
  const genreCounts: Record<string, number> = {};
  history.forEach(song => {
    const g = song.genre || 'Unknown';
    genreCounts[g] = (genreCounts[g] || 0) + 1;
  });

  const genreData = Object.entries(genreCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5

  useEffect(() => {
    api.getVibeAnalysis(history).then(setVibe);
  }, [history]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* High-Fidelity Mood Board Header */}
      <div className="relative group overflow-hidden rounded-[3rem] border border-white/20 shadow-2xl bg-zinc-900/40 backdrop-blur-3xl p-10 md:p-16">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1DB954]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 animate-pulse delay-700" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#1DB954]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1DB954]">Your Musical Identity</span>
            </div>

            <h2 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight">
              {vibe}
            </h2>

            <p className="text-gray-400 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
              A sonic fingerprint of your latest discoveries. You're currently leaning into <span className="text-white">{genreData[0]?.name || 'new sounds'}</span>.
            </p>
          </div>

          {/* Quick Stat Blobs */}
          <div className="flex gap-4 md:flex-col items-center">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border border-white/10 bg-white/5 backdrop-blur-2xl flex flex-col items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-500">
              <Music className="w-6 h-6 text-[#1DB954] mb-1" />
              <span className="text-2xl font-black text-white leading-none">{history.length}</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Total</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Top Genres - Premium Card */}
        <div className="md:col-span-2 glass-card rounded-[2.5rem] p-8 border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-[#1DB954]" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Genre Architecture</h3>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="h-[240px] w-full relative">
              {genreData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genreData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {genreData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none transition-all duration-300" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(24, 24, 27, 0.95)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">No data yet</div>
              )}
              {/* Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-white">{genreData.length}</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Genres</span>
              </div>
            </div>

            <div className="space-y-4">
              {genreData.map((genre, idx) => (
                <div key={genre.name} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">{genre.name}</span>
                  </div>
                  <span className="text-sm font-mono text-gray-500">{Math.round((genre.value / history.length) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Activity Board */}
        <div className="space-y-6">
          <div className="glass-card rounded-[2.5rem] p-8 border-white/5 relative bg-gradient-to-br from-[#1DB954]/10 to-transparent flex flex-col justify-between h-full">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#1DB954]/20 flex items-center justify-center shadow-lg shadow-[#1DB954]/10">
                  <Activity className="w-6 h-6 text-[#1DB954]" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Activity</p>
                  <p className="text-sm font-bold text-white">This Week</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-white tracking-tighter">{songsThisWeek}</span>
                  <span className="text-xl font-bold text-[#1DB954]">songs</span>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Current Streak</p>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-orange-400" />
                      <span className="text-lg font-bold text-white">{streak} days</span>
                    </div>
                  </div>
                  <div className="flex flex-col border-l border-white/10 pl-6">
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Consistency</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span className="text-lg font-bold text-white">Top Tier</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
