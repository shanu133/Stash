import { Trophy, TrendingUp, Music2, Sparkles, Layers, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'motion/react';
import { Song } from '../types';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface StatsViewProps {
  history: Song[];
  userName: string;
  songsThisWeek: number;
  streak: number;
}

const COLORS = ['#1DB954', '#9333EA', '#10B981', '#F59E0B', '#6B7280'];

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
    if (history.length > 0) {
      api.getVibeAnalysis(history).then(setVibe);
    } else {
      setVibe("No music yet! Start stashing.");
    }
  }, [history]);

  return (
    <div className="min-h-screen px-6 py-8 md:py-12 bg-[#121212] text-[#E5E5E5] noise-texture">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Vibe Header with Animated Orbs */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1DB954]/10 via-purple-500/10 to-emerald-500/10 rounded-3xl p-8 md:p-12 border border-gray-800 shadow-2xl">
          {/* Animated Background Orbs */}
          <motion.div
            className="absolute top-0 right-0 w-64 h-64 bg-[#1DB954]/10 rounded-full blur-3xl"
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -20, 0],
              y: [0, 30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative z-10 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mx-auto">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1DB954]">Your Musical Identity</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-[#1DB954] via-emerald-400 to-purple-400 bg-clip-text text-transparent leading-tight py-2">
              {vibe}
            </h1>
            <p className="text-lg text-gray-400">
              {history.length > 0
                ? `A sonic fingerprint of your latest discoveries. You're leaning into ${genreData[0]?.name || 'new sounds'}.`
                : "Connect your history to see your musical fingerprint."
              }
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Genre Architecture - Pie Chart */}
          <div className="bg-[#1D1D1F]/40 backdrop-blur-md border border-gray-800 rounded-3xl p-8 space-y-6 shadow-xl">
            <div>
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#1DB954]" />
                Genre Architecture
              </h2>
              <p className="text-sm text-gray-500">Your listening breakdown</p>
            </div>

            <div className="h-[280px] w-full relative">
              {genreData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genreData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {genreData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1D1D1F', border: '1px solid #374151', borderRadius: '12px' }}
                      itemStyle={{ color: '#E5E5E5' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-600">No data available</div>
              )}
              {genreData.length > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-white">{history.length}</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total</span>
                </div>
              )}
            </div>
          </div>

          {/* Activity Board */}
          <div className="space-y-6">
            {/* Songs This Week Card */}
            <div className="bg-[#1D1D1F]/40 backdrop-blur-md border border-gray-800 rounded-3xl p-8 shadow-xl">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Activity className="w-5 h-5 text-[#1DB954]" />
                    <h3 className="text-sm font-medium uppercase tracking-widest">Songs This Week</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-6xl font-black text-[#1DB954] tracking-tighter">{songsThisWeek}</p>
                    <div className="flex items-center gap-1 text-emerald-400 text-sm font-bold">
                      <TrendingUp className="w-4 h-4" />
                      <span>TRENDING</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Streak Card */}
            <div className="bg-gradient-to-br from-[#1DB954]/20 to-emerald-500/10 backdrop-blur-md border border-[#1DB954]/30 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#1DB954]" />
                    <h3 className="text-sm font-medium uppercase tracking-widest">Current Streak</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-6xl font-black text-white tracking-tighter">{streak}</p>
                    <span className="text-xl font-bold text-[#1DB954]">DAYS</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Keep stashing to grow your streak! 🔥
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="text-center pt-8">
          <button
            disabled
            className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed opacity-50 font-semibold transition-all hover:bg-white/10"
            title="Coming soon"
          >
            Share Musical Identity
          </button>
        </div>
      </div>
    </div>
  );
}
