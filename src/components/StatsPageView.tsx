import { ArrowLeft, Music, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';

interface StatsPageViewProps {
  onBack: () => void;
  theme: 'light' | 'dark';
  history?: any[];
}

export function StatsPageView({ onBack, theme, history = [] }: StatsPageViewProps) {
  // Calculate stats from history
  const totalStashes = history.length;
  const thisMonth = history.filter(song => {
    const songDate = new Date(song.created_at || Date.now());
    const now = new Date();
    return songDate.getMonth() === now.getMonth() && 
           songDate.getFullYear() === now.getFullYear();
  }).length;

  // Calculate top platform
  const platformCounts: Record<string, number> = {};
  history.forEach(song => {
    const platform = song.source || 'Web';
    platformCounts[platform] = (platformCounts[platform] || 0) + 1;
  });
  const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Get recent activity (last 7 days)
  const recentActivity = history.filter(song => {
    const songDate = new Date(song.created_at || Date.now());
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return songDate >= weekAgo;
  }).length;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white noise-texture">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-white/10">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 style={{ fontWeight: 600 }}>Your Stats</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 py-24 max-w-6xl">
        <div className="space-y-8">
          {/* Main Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-8 text-center shadow-lg">
              <div className="w-12 h-12 mx-auto mb-4 bg-[#1DB954]/10 rounded-xl flex items-center justify-center">
                <Music className="w-6 h-6 text-[#1DB954]" />
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 mb-2 text-sm">Total Stashes</h3>
              <p className="text-5xl text-[#1DB954]" style={{ fontWeight: 700 }}>
                {totalStashes}
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 text-center shadow-lg">
              <div className="w-12 h-12 mx-auto mb-4 bg-[#1DB954]/10 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[#1DB954]" />
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 mb-2 text-sm">This Month</h3>
              <p className="text-5xl text-[#1DB954]" style={{ fontWeight: 700 }}>
                {thisMonth}
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 text-center shadow-lg">
              <div className="w-12 h-12 mx-auto mb-4 bg-[#1DB954]/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#1DB954]" />
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 mb-2 text-sm">This Week</h3>
              <p className="text-5xl text-[#1DB954]" style={{ fontWeight: 700 }}>
                {recentActivity}
              </p>
            </div>
          </div>

          {/* Platform Breakdown */}
          <section className="glass-card rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#1DB954]/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#1DB954]" />
              </div>
              <h2 style={{ fontWeight: 600 }}>Platform Breakdown</h2>
            </div>
            
            {Object.entries(platformCounts).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(platformCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([platform, count]) => (
                    <div key={platform} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ fontWeight: 500 }}>{platform}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {count} {count === 1 ? 'song' : 'songs'}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1DB954] rounded-full transition-all duration-500"
                          style={{ width: `${(count / totalStashes) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No platform data yet. Start stashing songs to see your breakdown!
              </p>
            )}
          </section>

          {/* Top Platform Card */}
          <div className="glass-card rounded-2xl p-8 shadow-lg text-center">
            <h3 className="text-gray-500 dark:text-gray-400 mb-3">Most Used Platform</h3>
            <p className="text-3xl mb-2" style={{ fontWeight: 700 }}>
              {topPlatform}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {platformCounts[topPlatform] || 0} songs discovered
            </p>
          </div>

          {/* Activity Message */}
          {totalStashes === 0 && (
            <div className="glass-card rounded-3xl p-12 text-center shadow-xl">
              <Music className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="mb-2" style={{ fontWeight: 600 }}>No Stats Yet</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Start stashing songs to see your music discovery statistics!
              </p>
            </div>
          )}

          {/* Coming Soon */}
          {totalStashes > 0 && (
            <div className="glass-card rounded-2xl p-6 text-center border-2 border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                📊 More detailed analytics coming soon: listening habits, genre breakdown, and more!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
