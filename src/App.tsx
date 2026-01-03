import { useState, useEffect, useRef } from 'react';
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
import { api, Song, SongMatch, Playlist } from './lib/api';
import { supabase } from './lib/supabase';

<<<<<<< HEAD
=======
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

>>>>>>> 36ab651fc45e4ea5236650b2c459320ba164a898
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
  isProcessing: boolean;
  processingStage: 1 | 2 | 3 | 'success' | 'error';
  processingError?: string;
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
      autoAddTopMatch: true, // Default to true as requested
      defaultPlaylistId: '1',
      playlists: [],
      theme: savedTheme || 'dark',
      isProcessing: false,
      processingStage: 1,
      processingError: undefined,
    };
  });

  const [pendingSharedUrl, setPendingSharedUrl] = useState<string | null>(null);
  const sharedUrlRef = useRef<string | null>(null);
  const stashSubmitRef = useRef<((url: string) => Promise<void>) | null>(null);

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
    const sharedUrlParam = params.get('url');
    const sharedText = params.get('text') || params.get('title');
    const payload = sharedUrlParam || sharedText;

<<<<<<< HEAD
    if (!payload || sharedUrlRef.current) return;
=======
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
>>>>>>> 36ab651fc45e4ea5236650b2c459320ba164a898

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = payload.match(urlRegex);
    const cleanUrl = sharedUrlParam || (matches && matches[0]);

    if (!cleanUrl) return;

    sharedUrlRef.current = cleanUrl;
    setPendingSharedUrl(cleanUrl);

    // Clean the URL bar so refreshes don't resubmit the payload
    window.history.replaceState({}, document.title, '/');
  }, []);

  useEffect(() => {
    if (!pendingSharedUrl || !state.isLoggedIn) return;

    stashSubmitRef.current?.(pendingSharedUrl);
    sharedUrlRef.current = null;
    setPendingSharedUrl(null);
  }, [pendingSharedUrl, state.isLoggedIn]);

  // Handle Auth Session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        handleAuthSuccess(session.user);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          handleAuthSuccess(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = async (user: any) => {
    setState((prev) => ({
      ...prev,
      isLoggedIn: true,
      userEmail: user.email || '',
      userName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      currentView: 'app',
    }));

    try {
      const playlists = await api.getUserPlaylists();
      setState((prev) => ({ ...prev, playlists }));
      await loadHistory();
    } catch (err) {
<<<<<<< HEAD
      console.warn("Auth: Failed to fetch enriched user data:", err);
=======
      console.warn("Auth: Failed to fetch enriched user data (playlists/history):", err);
      // We don't block the UI here, the user is already in the app
      setState((prev) => ({ ...prev, isLoadingHistory: false }));
>>>>>>> 36ab651fc45e4ea5236650b2c459320ba164a898
    }
  };

  // Load history when user logs in
  useEffect(() => {
    if (state.isLoggedIn && state.history.length === 0) {
      loadHistory();
    }
  }, [state.isLoggedIn]);

  // Apply theme to document and save to localStorage
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    document.documentElement.className = state.theme;
    localStorage.setItem('stash-theme', state.theme);
  }, [state.theme]);

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
      await api.connectSpotify();
    } catch (error) {
      console.error('Failed to connect:', error);
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
        autoAddTopMatch: true,
        defaultPlaylistId: '1',
        playlists: [],
        theme: state.theme,
        isProcessing: false,
        processingStage: 1,
        processingError: undefined,
      });
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Failed to logout:', error);
      toast.error('Failed to logout');
    }
  };

  const handleStashSubmit = async (url: string) => {
    try {
      setState((prev) => ({
        ...prev,
        currentUrl: url,
        isProcessing: true,
        processingStage: 1,
        processingError: undefined
      }));

      const matches = await api.stashUrl(url, (status) => {
        if (status === "Extracting Audio..." || status === "Downloading...") {
          setState(prev => ({ ...prev, processingStage: 1 }));
        } else if (status === "Identifying Song...") {
          setState(prev => ({ ...prev, processingStage: 2 }));
        } else if (status === "Verifying with Spotify...") {
          setState(prev => ({ ...prev, processingStage: 3 }));
        }
      });

<<<<<<< HEAD
      setState((prev) => ({ ...prev, processingStage: 'success' }));

      setTimeout(async () => {
        setState((prev) => ({ ...prev, isProcessing: false, processingStage: 1 }));

        if (state.autoAddTopMatch && matches.length > 0) {
          await handleSongSelection(matches[0]);
        } else {
          setState((prev) => ({
            ...prev,
            currentMatches: matches,
            showModal: true,
          }));
        }
      }, 1000);

=======
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
>>>>>>> 36ab651fc45e4ea5236650b2c459320ba164a898
    } catch (error) {
      console.error('Failed to stash:', error);
      setState((prev) => ({
        ...prev,
        processingStage: 'error',
        processingError: 'Failed to find song. Please try again.'
      }));

      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          processingStage: 1,
          processingError: undefined
        }));
      }, 2000);

      toast.error('Failed to find song. Please try again.');
    }
  };
  stashSubmitRef.current = handleStashSubmit;

  const handleSongSelection = async (song: SongMatch) => {
    try {
      setState((prev) => ({ ...prev, showModal: false }));
      const source = extractSource(state.currentUrl);
<<<<<<< HEAD
      const newSong = await api.addTrack(song, source);
=======

      // Add track
      // playlistId is already in state.defaultPlaylistId (could be 'smart_sort' or a real ID)
      const { song: newSong, playlistName } = await api.addTrack(song, source, state.defaultPlaylistId);
>>>>>>> 36ab651fc45e4ea5236650b2c459320ba164a898

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
<<<<<<< HEAD
      setState((prev) => ({ ...prev, autoAddTopMatch: value }));
=======
>>>>>>> 36ab651fc45e4ea5236650b2c459320ba164a898
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
            onOpenStats={() => handleNavigate('stats')}
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

<<<<<<< HEAD
      <ProcessingOverlay
        isVisible={state.isProcessing}
        stage={state.processingStage}
        errorMessage={state.processingError}
        onClose={() => setState((prev) => ({
          ...prev,
          isProcessing: false,
          processingStage: 1,
          processingError: undefined
        }))}
      />
=======
      {state.processingStatus && !state.showModal && (
        <ProcessingOverlay status={state.processingStatus} />
      )}

>>>>>>> 36ab651fc45e4ea5236650b2c459320ba164a898
      <PWAInstallPrompt />
      <PWARegistration />

      <Toaster position="bottom-right" theme={state.theme} />
    </div>
  );
}