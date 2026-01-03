import { supabase } from './supabase';

export interface Song {
  id: string;
  song: string;
  artist: string;
  source: string;
  album_art_url: string;
  preview_url?: string;
  created_at?: string;
}

export interface SongMatch {
  id: string;
  song: string;
  artist: string;
  album_art_url: string;
  preview_url?: string;
  spotify_url?: string;
  confidence?: number;
}

export interface Playlist {
  id: string;
  name: string;
}

const API_BASE_URL = "https://stash-production-ed8d.up.railway.app";

export const api = {
  async connectSpotify(): Promise<void> {
    const redirectUrl = window.location.origin;

    try {
      console.log('API: Initiating Spotify OAuth manually...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'spotify',
        options: {
          scopes: 'user-library-read user-library-modify playlist-read-private playlist-modify-public',
          redirectTo: redirectUrl,
          skipBrowserRedirect: true, // Manual redirect is more reliable in various browsers
        }
      });

      if (error) {
        console.error('API: Supabase Auth Error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('API: Redirecting to:', data.url);
        window.location.assign(data.url);
      } else {
        throw new Error('No redirect URL returned from Supabase');
      }

    } catch (err: any) {
      console.error('API: connectSpotify() error:', err);
      throw err;
    }
  },

  async logoutUser(): Promise<void> {
    console.log('API: logoutUser()');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async stashUrl(url: string, onStatusUpdate?: (status: string) => void): Promise<SongMatch[]> {
    console.log('API: stashUrl()', url);

    // Provide some status updates if callback provided
    if (onStatusUpdate) {
      onStatusUpdate("Downloading...");
    }

    try {
      const response = await fetch(`${API_BASE_URL}/recognize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) throw new Error("Backend Error");

      const data = await response.json();

      if (data.success) {
        return [{
          id: data.spotify_uri || Date.now().toString(),
          song: data.track,
          artist: data.artist,
          album_art_url: data.album_art,
          preview_url: data.preview_url || '',
          spotify_url: data.spotify_url,
          confidence: data.confidence
        }];
      } else {
        throw new Error(data.error || "Failed to recognize song");
      }
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async addTrack(song: SongMatch, source: string): Promise<Song> {
    console.log('API: addTrack()', song);

    // 1. Save to Supabase History
    const { data, error } = await supabase
      .from('history')
      .insert({
        song: song.song,
        artist: song.artist,
        source: source,
        album_art_url: song.album_art_url,
        preview_url: song.preview_url,
      })
      .select()
      .single();

    if (error) throw error;

    return data as Song;
  },

  async getUserHistory(): Promise<Song[]> {
    console.log('API: getUserHistory()');
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async deleteSong(id: string): Promise<void> {
    console.log('API: deleteSong()', id);
    const { error } = await supabase
      .from('history')
      .delete()
      .match({ id });

    if (error) throw error;
  },

  async updateUserPreferences(prefs: {
    autoAddTopMatch?: boolean;
    defaultPlaylistId?: string;
    theme?: 'light' | 'dark';
  }): Promise<void> {
    console.log('API: updateUserPreferences()', prefs);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...prefs,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  },

  async getUserData(): Promise<{ name: string; email: string }> {
    console.log('API: getUserData()');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user found");

    return {
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      email: user.email || ''
    };
  },

  async getUserPlaylists(): Promise<Playlist[]> {
    console.log('API: getUserPlaylists()');
    // For now, return mock playlists until Spotify token refresh is handled
    return [
      { id: '1', name: 'Liked Songs' },
      { id: '2', name: 'My Stash' },
      { id: '3', name: 'Discover Weekly' },
      { id: '4', name: 'Chill Vibes' },
      { id: '5', name: 'Workout Mix' },
    ];
  },

  async getVibeAnalysis(history: any[]): Promise<string> {
    try {
      const songs = history.slice(0, 15).map(s => `${s.song} by ${s.artist}`);
      const response = await fetch(`${API_BASE_URL}/analyze_vibe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songs })
      });
      const data = await response.json();
      return data.vibe || "Eclectic and mysterious.";
    } catch (err) {
      return "Eclectic and mysterious.";
    }
  }
};