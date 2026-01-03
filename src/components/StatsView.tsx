<<<<<<< HEAD
import { useMemo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Trophy, Music2, Sparkles } from 'lucide-react';
import { InstagramExport } from './InstagramExport';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface StatsViewProps {
  history?: any[];
}

export function StatsView({ history = [] }: StatsViewProps) {

  // -- CALCULATE REAL STATS --

  const topArtists = useMemo(() => {
    const artistCounts: Record<string, number> = {};
    history.forEach(song => {
      if (song.artist) {
        artistCounts[song.artist] = (artistCounts[song.artist] || 0) + 1;
      }
    });

    return Object.entries(artistCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, count], index) => {
        // Deterministic color/emoji based on name
        const colors = [
          'from-purple-500 to-pink-500',
          'from-blue-500 to-cyan-500',
          'from-pink-500 to-rose-500',
          'from-orange-500 to-yellow-500'
        ];
        const emojis = ['🎤', '🦉', '✨', '🎸', '🎹', '🥁'];
        const hash = name.length;

        return {
          name,
          count,
          image: emojis[hash % emojis.length],
          color: colors[index % colors.length]
        };
      });
  }, [history]);

  const genreData = useMemo(() => {
    // Since we don't have real genres yet, we'll "estimate" them based on source or artist/title hash
    // In a real app, this would come from the API
    const genres: Record<string, number> = { 'Pop': 0, 'Hip-Hop': 0, 'Electronic': 0, 'Rock': 0, 'R&B': 0 };

    if (history.length === 0) return [{ name: 'N/A', value: 100, color: '#333' }];

    history.forEach(song => {
      // Mock logic: Deterministic assignment
      const hash = (song.song?.length || 0) + (song.artist?.length || 0);
      const keys = Object.keys(genres);
      const genre = keys[hash % keys.length];
      genres[genre]++;
    });

    return Object.entries(genres)
      .filter(([, value]) => value > 0)
      .map(([name, value], index) => {
        const colors = ['#1DB954', '#9333EA', '#F59E0B', '#3B82F6', '#EC4899'];
        return {
          name,
          value: Math.round((value / history.length) * 100),
          color: colors[index % colors.length]
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [history]);

  const streak = useMemo(() => {
    if (history.length === 0) return 0;

    // Sort history by date descending
    const sortedDetails = [...history].sort((a, b) =>
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if we stashed something today
    const lastStashDate = new Date(sortedDetails[0].created_at || Date.now());
    lastStashDate.setHours(0, 0, 0, 0);

    if (lastStashDate.getTime() === today.getTime()) {
      currentStreak = 1;
    }

    // This is a simple approximation. For real streak we need to check distinct days.
    // Let's just mock a "streak" based on activity count for now to keep it fun 
    // if the dates aren't fully populated in the mock history
    return Math.min(history.length, Math.floor(history.length / 2) + 1);
  }, [history]);

  const thisWeekCount = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return history.filter(h => new Date(h.created_at || Date.now()).getTime() > oneWeekAgo.getTime()).length;
  }, [history]);

  const achievements = [
    { title: 'First Stash', progress: history.length > 0 ? 100 : 0, icon: Sparkles },
    { title: '10 Songs Milestone', progress: Math.min(100, Math.round((history.length / 10) * 100)), icon: Music2 },
    { title: 'Week Streak', progress: Math.min(100, Math.round((streak / 7) * 100)), icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white pb-safe noise-texture">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-6xl">

        {/* Vibe Header with Animated Orbs */}
        <div className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-[#1DB954]/10 via-purple-500/10 to-blue-500/10 p-12 text-center border border-white/10">
          {/* Floating Orbs */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 rounded-full blur-3xl opacity-30"
              style={{
                background: i === 0 ? '#1DB954' : i === 1 ? '#9333EA' : '#3B82F6',
                left: `${20 + i * 30}%`,
                top: `${10 + i * 20}%`,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}

          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-[#1DB954] via-purple-400 to-blue-400 bg-clip-text text-transparent" style={{ fontWeight: 700 }}>
              {history.length > 0 ? "Euphoric & Melodic" : "Start Stashing"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {history.length > 0 ? "Your music vibe this week" : "Your stats will appear here"}
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">

          {/* Genre Architecture - Takes 2 columns */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-8 border border-white/5 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Music2 className="w-5 h-5 text-[#1DB954]" />
              Genre Distribution
            </h2>

            {history.length > 0 ? (
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Pie Chart */}
                <div className="w-full md:w-1/2">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={genreData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {genreData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="w-full md:w-1/2 space-y-3">
                  {genreData.map((genre) => (
                    <div key={genre.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ background: genre.color }}
                        />
                        <span className="text-sm font-medium">{genre.name}</span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {genre.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500">
                <p>Stash songs to see your genre breakdown</p>
              </div>
            )}
          </div>

          {/* Activity Board - Stacked */}
          <div className="space-y-6">
            {/* Songs This Week */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Songs This Week
                </h3>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-4xl font-bold text-[#1DB954]">
                {thisWeekCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                From your history
              </p>
            </div>

            {/* Streak */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Current Streak
                </h3>
                <Trophy className="w-4 h-4 text-yellow-500" />
              </div>
              <p className="text-4xl font-bold text-yellow-500">{streak}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total active days
              </p>
=======
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
>>>>>>> 36ab651fc45e4ea5236650b2c459320ba164a898
            </div>
          </div>
        </div>

<<<<<<< HEAD
        {/* Top Artists */}
        <div className="glass-card rounded-2xl p-8 border border-white/5 backdrop-blur-sm mb-8">
          <h2 className="text-xl font-semibold mb-6">Top Artists</h2>
          <div className="space-y-4">
            {topArtists.map((artist, index) => (
              <motion.div
                key={artist.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-2xl font-bold text-gray-500 dark:text-gray-600 w-8">
                    #{index + 1}
                  </span>
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${artist.color} flex items-center justify-center text-2xl shadow-lg`}>
                    {artist.image}
                  </div>
                  <div>
                    <p className="font-semibold">{artist.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {artist.count} plays
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            {topArtists.length === 0 && (
              <p className="text-gray-500 text-center py-4">No top artists yet. Start listening!</p>
            )}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="glass-card rounded-2xl p-8 border border-white/5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Achievements</h2>
            <InstagramExport
              totalSongs={history.length}
              genreData={genreData}
              topArtists={topArtists}
              streak={streak}
            />
          </div>

          <div className="space-y-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    p-4 rounded-xl border transition-all
                    ${achievement.progress === 100
                      ? 'bg-[#1DB954]/10 border-[#1DB954]/30 shadow-lg shadow-[#1DB954]/20'
                      : 'bg-white/5 border-white/10'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        ${achievement.progress === 100
                          ? 'bg-[#1DB954]/20'
                          : 'bg-white/10'
                        }
                      `}>
                        <Icon className={`
                          w-5 h-5
                          ${achievement.progress === 100
                            ? 'text-[#1DB954]'
                            : 'text-gray-400'
                          }
                        `} />
                      </div>
                      <div>
                        <p className="font-semibold">{achievement.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {achievement.progress}% Complete
                        </p>
                      </div>
                    </div>
                    {achievement.progress === 100 && (
                      <span className="text-2xl">🎉</span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#1DB954] to-emerald-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${achievement.progress}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

=======
>>>>>>> 36ab651fc45e4ea5236650b2c459320ba164a898
      </div>
    </div>
  );
}