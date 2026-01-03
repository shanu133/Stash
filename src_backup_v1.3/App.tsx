import { useState, useEffect, useRef } from 'react';
import { LandingView } from './components/LandingView';
import { AppView } from './components/AppView';
import { SettingsView } from './components/SettingsView';
import { PrivacyView } from './components/PrivacyView';
import { AboutView } from './components/AboutView';
import { HelpView } from './components/HelpView';
import { StatsPageView } from './components/StatsPageView';
import { ConfirmationModal } from './components/ConfirmationModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { api } from './lib/api';
import { supabase } from './lib/supabase';

interface Song {
  id: string;
  song: string;
  artist: string;
  source: string;
  album_art_url: string;
  preview_url?: string;
  created_at?: string;
}

interface SongMatch {
  id: string;
  song: string;
  artist: string;
  album_art_url: string;
  preview_url?: string;
  spotify_url?: string;
  confidence?: number;
}

interface Playlist {
  id: string;
  name: string;
}

type ViewType = 'landing' | 'app' | 'settings' | 'privacy' | 'about' | 'help' | 'stats';

interface AppState {
  isLoggedIn: boolean;
  userName: string;
  userEmail: string;
  history: Song[];
  currentMatches: SongMatch[];
  currentUrl: string;
  showModal: boolean;
  currentView: ViewType;
  isLoadingHistory: boolean;
  autoAddTopMatch: boolean;
  defaultPlaylistId: string;
  playlists: Playlist[];
  theme: 'light' | 'dark';
  processingStatus: string;
}

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    // Load theme from localStorage on initial load
    const savedTheme = localStorage.getItem('stash-theme') as 'light' | 'dark' | null;
    return {
      isLoggedIn: false,
      userName: '',
      userEmail: '',
      history: [],
      currentMatches: [],
      currentUrl: '',
      showModal: false,
      currentView: 'landing',
      isLoadingHistory: false,
      autoAddTopMatch: false,
      defaultPlaylistId: '1',
      playlists: [],
      theme: savedTheme || 'dark',
      processingStatus: '',
    };
  });
  const [pendingSharedUrl, setPendingSharedUrl] = useState<string | null>(null);
  const sharedUrlRef = useRef<string | null>(null);
  const stashSubmitRef = useRef<((url: string) => Promise<void>) | null>(null);

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.className = state.theme;
  }, [state.theme]);

  // Handle Share Target on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedUrlParam = params.get('url');
    const sharedText = params.get('text') || params.get('title');
    const payload = sharedUrlParam || sharedText;
    const debugConsole = document.getElementById('debug-console');

    if (debugConsole) {
      debugConsole.textContent = payload ? `RECEIVED: ${payload}` : 'NO DATA RECEIVED';
    }

    if (!payload || sharedUrlRef.current) {
      return;
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = payload.match(urlRegex);
    const cleanUrl = sharedUrlParam || (matches && matches[0]);

    if (!cleanUrl) {
      return;
    }

    sharedUrlRef.current = cleanUrl;
    setPendingSharedUrl(cleanUrl);

    // Clean the URL bar so refreshes don't resubmit the payload
    window.history.replaceState({}, document.title, '/');
  }, []);

  useEffect(() => {
    if (!pendingSharedUrl || !state.isLoggedIn) {
      return;
    }

    stashSubmitRef.current?.(pendingSharedUrl);
    sharedUrlRef.current = null;
    setPendingSharedUrl(null);

    const debugConsole = document.getElementById('debug-console');
    if (debugConsole) {
      debugConsole.textContent = `SHARED URL PROCESSED: ${pendingSharedUrl}`;
    }
  }, [pendingSharedUrl, state.isLoggedIn]);

  // Handle Auth Session
  useEffect(() => {
    // 1. Initial Session Check
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        handleAuthSuccess(session.user);
      }
    };
    checkSession();

    // 2. Listen for Session Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          handleAuthSuccess(session.user);
        } else {
          // Handled by handleLogout if manually triggered, 
          // but good for token expiry
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = async (user: any) => {
    console.log("Auth: Successful login for", user.email);

    // Set basic info first so the UI transitions immediately
    setState((prev) => ({
      ...prev,
      isLoggedIn: true,
      userEmail: user.email || '',
      userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      currentView: 'app',
    }));

    // Then try to fetch enriched data in the background
    try {
      const playlists = await api.getUserPlaylists();
      setState((prev) => ({ ...prev, playlists }));
      loadHistory();
    } catch (err) {
      console.warn("Auth: Failed to fetch enriched user data (playlists/history):", err);
      // We don't block the UI here, the user is already in the app
    }
  };

  const loadHistory = async () => {
    setState((prev) => ({ ...prev, isLoadingHistory: true }));
    try {
      const history = await api.getUserHistory();
      setState((prev) => ({ ...prev, history, isLoadingHistory: false }));
    } catch (error) {
      console.error('Failed to load history:', error);
      setState((prev) => ({ ...prev, isLoadingHistory: false }));
      toast.error('Failed to load history');
    }
  };

  const handleConnectSpotify = async () => {
    console.log('App: handleConnectSpotify triggered');
    try {
      // toast.loading('Redirecting to Spotify...');
      console.log('App: Calling api.connectSpotify()...');
      await api.connectSpotify();
      console.log('App: api.connectSpotify() call finished');
    } catch (error) {
      console.error('App: Failed to connect:', error);
      // toast.dismiss();
      // toast.error('Failed to connect to Spotify');
      alert('Failed to connect to Spotify. Check console.');
    }
  };

  const handleLogout = async () => {
    try {
      await api.logoutUser();
      setState({
        isLoggedIn: false,
        userName: '',
        userEmail: '',
        history: [],
        currentMatches: [],
        currentUrl: '',
        showModal: false,
        currentView: 'landing',
        isLoadingHistory: false,
        autoAddTopMatch: false,
        defaultPlaylistId: '1',
        playlists: [],
        theme: state.theme, // Preserve theme on logout
        processingStatus: '',
      });
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Failed to logout:', error);
      toast.error('Failed to logout');
    }
  };

  const handleStashSubmit = async (url: string) => {
    try {
      setState((prev) => ({ ...prev, currentUrl: url, processingStatus: 'Starting...' }));

      const matches = await api.stashUrl(url, (status) => {
        setState((prev) => ({ ...prev, processingStatus: status }));
      });

      if (state.autoAddTopMatch && matches.length > 0) {
        // Auto-add the top match
        await handleSongSelection(matches[0]);
      } else {
        // Show modal for selection
        setState((prev) => ({
          ...prev,
          currentMatches: matches,
          showModal: true,
          processingStatus: '',
        }));
      }
    } catch (error) {
      console.error('Failed to stash:', error);
      setState((prev) => ({ ...prev, processingStatus: '' }));
      toast.error('Failed to find song. Please try again.');
    }
  };
  stashSubmitRef.current = handleStashSubmit;

  const handleSongSelection = async (song: SongMatch) => {
    try {
      // Close modal
      setState((prev) => ({ ...prev, showModal: false }));

      // Extract source from URL (simplified)
      const source = extractSource(state.currentUrl);

      // Add track
      const newSong = await api.addTrack(song, source);

      // Add to history
      setState((prev) => ({
        ...prev,
        history: [newSong, ...prev.history],
        currentMatches: [],
        currentUrl: '',
      }));

      toast.success(`"${song.song}" added to your library!`);
    } catch (error) {
      console.error('Failed to add track:', error);
      toast.error('Failed to add song to library');
    }
  };

  const handleDeleteSong = async (id: string) => {
    try {
      await api.deleteSong(id);
      setState((prev) => ({
        ...prev,
        history: prev.history.filter((song) => song.id !== id),
      }));
      toast.success('Song removed from history');
    } catch (error) {
      console.error('Failed to delete song:', error);
      toast.error('Failed to delete song');
    }
  };

  const handleToggleAutoAdd = async (value: boolean) => {
    try {
      await api.updateUserPreferences({ autoAddTopMatch: value });
      setState((prev) => ({ ...prev, autoAddTopMatch: value }));
      toast.success(
        value ? 'Auto-add enabled' : 'Auto-add disabled'
      );
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast.error('Failed to update preferences');
    }
  };

  const handleToggleTheme = async (value: 'light' | 'dark') => {
    try {
      if (state.isLoggedIn) {
        await api.updateUserPreferences({ theme: value });
      }
      setState((prev) => ({ ...prev, theme: value }));
    } catch (error) {
      console.error('Failed to update theme:', error);
      toast.error('Failed to update theme');
    }
  };

  const handlePlaylistChange = async (playlistId: string) => {
    try {
      await api.updateUserPreferences({ defaultPlaylistId: playlistId });
      setState((prev) => ({ ...prev, defaultPlaylistId: playlistId }));
      const playlist = state.playlists.find(p => p.id === playlistId);
      toast.success(`Default playlist set to ${playlist?.name || 'selected playlist'}`);
    } catch (error) {
      console.error('Failed to update playlist:', error);
      toast.error('Failed to update playlist');
    }
  };

  const handleNavigate = (view: ViewType) => {
    setState((prev) => ({ ...prev, currentView: view }));
  };

  const handleBack = () => {
    if (state.isLoggedIn) {
      setState((prev) => ({ ...prev, currentView: 'app' }));
    } else {
      setState((prev) => ({ ...prev, currentView: 'landing' }));
    }
  };

  const extractSource = (url: string): string => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter';
    return 'Web';
  };

  const renderView = () => {
    switch (state.currentView) {
      case 'privacy':
        return <PrivacyView onBack={handleBack} theme={state.theme} />;
      case 'about':
        return <AboutView onBack={handleBack} theme={state.theme} />;
      case 'help':
        return <HelpView onBack={handleBack} theme={state.theme} />;
      case 'stats':
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const songsThisWeek = state.history.filter(s => s.created_at && new Date(s.created_at) > oneWeekAgo).length;
        // Simple streak calculation: count consecutive days with at least one song
        const songDates = Array.from(new Set(state.history.map(s => s.created_at?.split('T')[0]))).filter(Boolean).sort().reverse();
        let streak = 0;
        let d = new Date();
        for (let i = 0; i < 365; i++) {
          const dateStr = d.toISOString().split('T')[0];
          if (songDates.includes(dateStr)) {
            streak++;
            d.setDate(d.getDate() - 1);
          } else {
            if (i === 0) { // Check if they just haven't stashed TODAY yet
              d.setDate(d.getDate() - 1);
              continue;
            }
            break;
          }
        }

        return (
          <StatsPageView
            onBack={handleBack}
            theme={state.theme}
            history={state.history}
            userName={state.userName}
            songsThisWeek={songsThisWeek}
            streak={streak}
          />
        );
      case 'settings':
        return (
          <SettingsView
            userName={state.userName}
            userEmail={state.userEmail}
            autoAddTopMatch={state.autoAddTopMatch}
            defaultPlaylistId={state.defaultPlaylistId}
            playlists={state.playlists}
            theme={state.theme}
            onBack={handleBack}
            onLogout={handleLogout}
            onToggleAutoAdd={handleToggleAutoAdd}
            onPlaylistChange={handlePlaylistChange}
            onToggleTheme={handleToggleTheme}
          />
        );
      case 'app':
        return (
          <AppView
            userName={state.userName}
            history={state.history}
            autoAddTopMatch={state.autoAddTopMatch}
            theme={state.theme}
            onLogout={handleLogout}
            onStashSubmit={handleStashSubmit}
            onDeleteSong={handleDeleteSong}
            onToggleAutoAdd={handleToggleAutoAdd}
            onToggleTheme={handleToggleTheme}
            onOpenSettings={() => handleNavigate('settings')}
            onOpenStats={() => handleNavigate('stats')}
            processingStatus={state.processingStatus}
          />
        );
      case 'landing':
      default:
        return (
          <LandingView
            onConnect={handleConnectSpotify}
            theme={state.theme}
            onToggleTheme={handleToggleTheme}
            onNavigate={(page) => handleNavigate(page)}
          />
        );
    }
  };

  return (
    <div className={`size-full ${state.theme}`}>
      {renderView()}

      <ConfirmationModal
        isOpen={state.showModal}
        matches={state.currentMatches}
        onClose={() => setState((prev) => ({ ...prev, showModal: false }))}
        onSelectSong={handleSongSelection}
      />

      <PWAInstallPrompt />

      <Toaster position="bottom-right" theme={state.theme} />
    </div>
  );
}