import { useState, useEffect } from 'react';
import { LandingView } from './components/LandingView';
import { AppView } from './components/AppView';
import { SettingsView } from './components/SettingsView';
import { PrivacyView } from './components/PrivacyView';
import { AboutView } from './components/AboutView';
import { HelpView } from './components/HelpView';
import { StatsPageView } from './components/StatsPageView';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { PWARegistration } from './components/PWARegistration';
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
  spotify_url?: string;
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

  // Global Error Handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Global Error Caught:", event.error);
      toast.error(`App Error: ${event.message || 'Something went wrong'}`);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Theme synchronization
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('stash-theme', state.theme);
  }, [state.theme]);

  // Handle Share Target on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedText = params.get('text') || params.get('url') || params.get('title');

    const handleSharedContent = async (text: string) => {
      // Robust Regex to find URLs inside messy text
      const urlRegex = /(https?:\/\/(?:www\.)?instagram\.com\/reel\/[\w-]+\/?)/i;
      const matches = text.match(urlRegex) || text.match(/(https?:\/\/[^\s]+)/g);
      if (matches && matches[0]) {
        const reelUrl = matches[0];
        // If not logged in, we might want to store it or prompt login
        // For now, let's assume we proceed if we can
        handleStashSubmit(reelUrl);
      }
    };

    if (sharedText) {
      handleSharedContent(sharedText);
      // Clean up the URL
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

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
      userName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      currentView: 'app',
    }));

    // Then try to fetch enriched data in the background
    try {
      const playlists = await api.getUserPlaylists();
      setState((prev) => ({ ...prev, playlists }));
      await loadHistory();
    } catch (err) {
      console.warn("Auth: Failed to fetch enriched user data (playlists/history):", err);
      // We don't block the UI here, the user is already in the app
      setState((prev) => ({ ...prev, isLoadingHistory: false }));
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
    try {
      toast.loading('Redirecting to Spotify...');
      await api.connectSpotify();
    } catch (error) {
      console.error('Failed to connect:', error);
      toast.dismiss();
      toast.error('Failed to connect to Spotify');
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

      // AUTO-ACCEPT Logic:
      // If user enabled auto-add OR confidence is very high (>= 90%)
      const topMatch = matches[0];
      const isHighConfidence = topMatch?.confidence && topMatch.confidence >= 0.90;

      if ((state.autoAddTopMatch || isHighConfidence) && matches.length > 0) {
        // Auto-add the top match without modal
        await handleSongSelection(topMatch);
      } else {
        // Show modal for selection (low confidence or manual mode)
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

  const handleSongSelection = async (song: SongMatch) => {
    try {
      // Close modal
      setState((prev) => ({ ...prev, showModal: false }));

      // Extract source from URL (simplified)
      const source = extractSource(state.currentUrl);

      // Add track
      // playlistId is already in state.defaultPlaylistId (could be 'smart_sort' or a real ID)
      const { song: newSong, playlistName } = await api.addTrack(song, source, state.defaultPlaylistId);

      // Add to history
      setState((prev) => ({
        ...prev,
        history: [newSong, ...prev.history],
        currentMatches: [],
        currentUrl: '',
        processingStatus: '',
      }));

      // Show specific playlist name if available, otherwise just "library"
      const destName = playlistName ? `"${playlistName}"` : "your library";
      toast.success(`"${song.song}" added to ${destName}!`);
    } catch (error) {
      console.error('Failed to add track:', error);
      setState((prev) => ({ ...prev, processingStatus: '' })); // Clear stuck loading state
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
    // Optimistic Update
    setState((prev) => ({ ...prev, autoAddTopMatch: value }));
    try {
      await api.updateUserPreferences({ autoAddTopMatch: value });
      toast.success(value ? 'Auto-add enabled' : 'Auto-add disabled');
    } catch (error) {
      console.warn('Preferences sync skipped (running locally):', error);
      // Suppress toast, user only cares about local effect
    }
  };

  const handleToggleTheme = async (value: 'light' | 'dark') => {
    // Optimistic Update
    setState((prev) => ({ ...prev, theme: value }));
    try {
      if (state.isLoggedIn) {
        await api.updateUserPreferences({ theme: value });
      }
    } catch (error) {
      console.warn('Theme sync skipped (running locally):', error);
      // Suppress toast
    }
  };

  const handlePlaylistChange = async (playlistId: string) => {
    // Optimistic Update
    setState((prev) => ({ ...prev, defaultPlaylistId: playlistId }));
    const playlist = state.playlists.find(p => p.id === playlistId);

    try {
      if (playlistId !== 'smart_sort') {
        // Only save real IDs or check if backend supports 'smart_sort' string in prefs
        // Assuming backend matches frontend types
      }
      await api.updateUserPreferences({ defaultPlaylistId: playlistId });
      toast.success(`Default playlist set to ${playlist?.name || (playlistId === 'smart_sort' ? 'Smart Sort' : 'selected playlist')}`);
    } catch (error) {
      console.warn('Playlist sync skipped (running locally):', error);
      // Suppress toast
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

  const calculateSongsThisWeek = (history: Song[]) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return history.filter(song => {
      const songDate = new Date(song.created_at || Date.now());
      return songDate >= oneWeekAgo;
    }).length;
  };

  const calculateStreak = (history: Song[]) => {
    if (history.length === 0) return 0;

    const dates = history
      .map(song => new Date(song.created_at || Date.now()).toDateString())
      .filter((value, index, self) => self.indexOf(value) === index)
      .map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    if (dates.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = today;

    // Check if the latest date is today or yesterday to start the streak
    const latestDate = dates[0];
    latestDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today.getTime() - latestDate.getTime()) / (24 * 60 * 60 * 1000));

    if (diffDays > 1) return 0; // Streak broken

    for (const date of dates) {
      date.setHours(0, 0, 0, 0);
      const diff = Math.floor((currentDate.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));

      if (diff === 0) {
        streak++;
        currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
      } else if (diff === 1 && streak === 0) {
        // Special case: if we haven't started yet and the first date is yesterday
        streak++;
        currentDate = new Date(date.getTime() - 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }

    return streak;
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
        return <StatsPageView onBack={handleBack} theme={state.theme} history={state.history} />;
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
            songsThisWeek={calculateSongsThisWeek(state.history)}
            streak={calculateStreak(state.history)}
            autoAddTopMatch={state.autoAddTopMatch}
            theme={state.theme}
            onLogout={handleLogout}
            onStashSubmit={handleStashSubmit}
            onDeleteSong={handleDeleteSong}
            onToggleAutoAdd={handleToggleAutoAdd}
            onToggleTheme={handleToggleTheme}
            onOpenSettings={() => handleNavigate('settings')}
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
    <div className="size-full">
      {renderView()}

      <ConfirmationModal
        isOpen={state.showModal}
        matches={state.currentMatches}
        onClose={() => setState((prev) => ({ ...prev, showModal: false }))}
        onSelectSong={handleSongSelection}
      />

      {state.processingStatus && !state.showModal && (
        <ProcessingOverlay status={state.processingStatus} />
      )}

      <PWAInstallPrompt />
      <PWARegistration />

      <Toaster position="bottom-right" theme={state.theme} />
    </div>
  );
}