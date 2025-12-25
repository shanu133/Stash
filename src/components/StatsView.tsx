export function StatsView() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white noise-texture">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="mb-8">Your Stats</h1>
        
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-8 text-center shadow-lg">
            <h3 className="text-gray-500 dark:text-gray-400 mb-2">Total Stashes</h3>
            <p className="text-5xl text-[#1DB954]" style={{ fontWeight: 700 }}>--</p>
          </div>
          <div className="glass-card rounded-2xl p-8 text-center shadow-lg">
            <h3 className="text-gray-500 dark:text-gray-400 mb-2">Top Platform</h3>
            <p className="text-3xl" style={{ fontWeight: 600 }}>--</p>
          </div>
          <div className="glass-card rounded-2xl p-8 text-center shadow-lg">
            <h3 className="text-gray-500 dark:text-gray-400 mb-2">This Month</h3>
            <p className="text-5xl text-[#1DB954]" style={{ fontWeight: 700 }}>--</p>
          </div>
        </div>

        {/* Coming Soon Message */}
        <div className="glass-card rounded-3xl p-12 text-center shadow-xl">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            📊 Detailed stats feature coming soon!
          </p>
        </div>
      </div>
    </div>
  );
}
