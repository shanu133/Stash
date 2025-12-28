import { useState, useRef } from 'react';
import { LogOut, BarChart3, Radio, Link2, Music2, Sparkles, Menu, Sun, Moon, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { HistoryList } from './HistoryList';
import { StatsView } from './StatsView';
import { QuickStats } from './QuickStats';
import { FloatingStashButton } from './FloatingStashButton';
import { useIsMobile } from './ui/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Avatar, AvatarFallback } from './ui/avatar';
// ProcessingOverlay moved to App.tsx for global coverage

export interface Song {
  id: string;
  song: string;
  artist: string;
  source: string;
  album_art_url: string;
  preview_url?: string;
  genre?: string;
}

interface AppViewProps {
  userName: string;
  history: Song[];
  autoAddTopMatch: boolean;
  theme: 'light' | 'dark';
  onLogout: () => void;
  onStashSubmit: (url: string) => Promise<void>;
  onDeleteSong: (id: string) => void;
  onToggleAutoAdd: (value: boolean) => void;
  onToggleTheme: (value: 'light' | 'dark') => void;
  onOpenSettings: () => void;
  processingStatus?: string;
  songsThisWeek: number;
  streak: number;
}

export function AppView({
  userName,
  history,
  autoAddTopMatch,
  theme,
  onLogout,
  onStashSubmit,
  onDeleteSong,
  onToggleAutoAdd,
  onToggleTheme,
  onOpenSettings,
  processingStatus,
  songsThisWeek,
  streak,
}: AppViewProps) {
  const [url, setUrl] = useState('');
  const [view, setView] = useState<'home' | 'stats'>('home');
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await onStashSubmit(url);
      setUrl('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFloatingButtonClick = () => {
    inputRef.current?.focus();
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white pb-safe noise-texture">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-14 max-w-lg flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
            <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
              <img
                src={theme === 'dark' ? '/branding/logo_dark.png' : '/branding/logo_light.png'}
                alt="Stash Logo"
                className={`w-full h-full object-contain ${theme === 'dark' ? 'invert' : ''}`}
                style={theme === 'dark' ? { mixBlendMode: 'screen' } : { mixBlendMode: 'multiply' }}
              />
            </div>
            <span className="text-xl font-bold tracking-tighter text-[#1DB954]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}>Stash</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              className={`text-gray-500 hover:text-[#1DB954] hover:bg-gray-100 dark:hover:bg-white/10 ${view === 'stats' ? 'text-[#1DB954] bg-gray-100 dark:bg-white/10' : ''}`}
              onClick={() => setView(view === 'stats' ? 'home' : 'stats')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Stats
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-[#1DB954]/20 text-[#1DB954]">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-gray-700 dark:text-gray-400">{userName}</span>
            <Button
              onClick={onOpenSettings}
              variant="ghost"
              className="hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              onClick={onLogout}
              variant="ghost"
              className="hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-white/10">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                <div className="flex flex-col gap-6 pt-8">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-white/10">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-[#1DB954]/20 text-[#1DB954]">
                        {userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p>{userName}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Free Account</p>
                    </div>
                  </div>
                  <Button
                    onClick={onOpenSettings}
                    variant="ghost"
                    className="justify-start hover:bg-gray-100 dark:hover:bg-white/10"
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    className={`justify-start ${view === 'stats' ? 'text-[#1DB954]' : ''}`}
                    onClick={() => {
                      setView('stats');
                    }}
                  >
                    <BarChart3 className="w-5 h-5 mr-3" />
                    Stats
                  </Button>
                  <Button
                    onClick={onLogout}
                    variant="ghost"
                    className="justify-start hover:bg-gray-100 dark:hover:bg-white/10"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header >

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-lg">
        {/* Quick Stats */}
        <QuickStats
          totalSongs={history.length}
          songsThisWeek={songsThisWeek}
          streak={streak}
        />

        {/* Stash Form */}
        < div className="mb-8 md:mb-12" >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="glass-card backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Link2 className="w-5 h-5 text-[#1DB954]" />
                <Label htmlFor="url-input" className="text-gray-700 dark:text-gray-200">
                  Paste a song link from anywhere
                </Label>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <Input
                  ref={inputRef}
                  id="url-input"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://instagram.com/reel/..."
                  className="flex-1 bg-white dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 h-12 md:h-14 rounded-xl focus:border-[#1DB954] focus:ring-[#1DB954]/50 transition-all"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !url.trim()}
                  className="bg-[#1DB954] hover:bg-[#1ed760] text-black px-8 md:px-12 h-12 md:h-14 rounded-xl shadow-lg shadow-[#1DB954]/20 hover:shadow-[#1DB954]/40 transition-all"
                  style={{ fontWeight: 600 }}
                >
                  {isLoading ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Stashing...
                    </>
                  ) : (
                    'Stash'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div >

        {/* Settings - Desktop: Switch, Mobile: Button */}
        < div className="mb-8 md:mb-12 space-y-4" >
          {/* Theme Toggle */}
          < div className="glass-card backdrop-blur-sm rounded-2xl p-6 shadow-lg" >
            {
              isMobile ? (
                <div className="space-y-4" >
                  <div className="flex items-start gap-3">
                    {theme === 'dark' ? (
                      <Moon className="w-5 h-5 text-[#1DB954] mt-0.5" />
                    ) : (
                      <Sun className="w-5 h-5 text-[#1DB954] mt-0.5" />
                    )}
                    <div className="flex-1">
                      <Label>Theme</Label>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        Choose your preferred color scheme
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => onToggleTheme(theme === 'dark' ? 'light' : 'dark')}
                    variant="outline"
                    className="w-full h-12 rounded-xl transition-all bg-[#1DB954]/20 border-[#1DB954] text-[#1DB954] hover:bg-[#1DB954]/30"
                  >
                    {theme === 'dark' ? (
                      <><Sun className="w-4 h-4 mr-2" />Switch to Light Mode</>
                    ) : (
                      <><Moon className="w-4 h-4 mr-2" />Switch to Dark Mode</>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {theme === 'dark' ? (
                      <Moon className="w-5 h-5 text-[#1DB954] mt-0.5" />
                    ) : (
                      <Sun className="w-5 h-5 text-[#1DB954] mt-0.5" />
                    )}
                    <div className="flex-1">
                      <Label htmlFor="theme-toggle">Theme</Label>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        {theme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="theme-toggle"
                    checked={theme === 'dark'}
                    onCheckedChange={(checked: boolean) => onToggleTheme(checked ? 'dark' : 'light')}
                    className="data-[state=checked]:bg-[#1DB954] mt-1"
                  />
                </div>
              )
            }
          </div >

          {/* Auto-add Toggle */}
          < div className="glass-card backdrop-blur-sm rounded-2xl p-6 shadow-lg" >
            {
              isMobile ? (
                <div className="space-y-4" >
                  <div className="flex items-start gap-3">
                    <Music2 className="w-5 h-5 text-[#1DB954] mt-0.5" />
                    <div className="flex-1">
                      <Label>Auto-add top match</Label>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        Automatically save the best match without preview
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => onToggleAutoAdd(!autoAddTopMatch)}
                    variant="outline"
                    className={`w-full h-12 rounded-xl transition-all ${autoAddTopMatch
                      ? 'bg-[#1DB954]/20 border-[#1DB954] text-[#1DB954] hover:bg-[#1DB954]/30'
                      : 'border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/5'
                      }`}
                  >
                    {autoAddTopMatch ? (
                      <><Music2 className="w-4 h-4 mr-2" />Auto-add Enabled</>
                    ) : (
                      <><Music2 className="w-4 h-4 mr-2" />Enable Auto-add</>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Music2 className="w-5 h-5 text-[#1DB954] mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor="auto-add-toggle">Auto-add top match</Label>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        Automatically save the best match without preview
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="auto-add-toggle"
                    checked={autoAddTopMatch}
                    onCheckedChange={onToggleAutoAdd}
                    className="data-[state=checked]:bg-[#1DB954] mt-1"
                  />
                </div>
              )}
          </div >
        </div >

        {/* Content Area */}
        < div className="mt-12 mb-6" >
          {view === 'stats' ? (
            <StatsView
              history={history}
              userName={userName}
              songsThisWeek={songsThisWeek}
              streak={streak}
            />
          ) : (
            <>
              <h3 className="text-gray-400 font-bold mb-4 uppercase text-xs tracking-widest flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Recently Stashed
              </h3>
              <HistoryList history={history} onDeleteSong={onDeleteSong} />
            </>
          )}
        </div >
      </div >

      {/* Floating Stash Button - Mobile Only */}
      {isMobile && <FloatingStashButton onClick={handleFloatingButtonClick} />}
    </div >
  );
}
