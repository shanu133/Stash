import { ArrowLeft, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Playlist } from '../lib/api';

interface SettingsViewProps {
    userName: string;
    userEmail: string;
    autoAddTopMatch: boolean;
    defaultPlaylistId: string;
    playlists: Playlist[];
    theme: 'light' | 'dark';
    onBack: () => void;
    onLogout: () => void;
    onToggleAutoAdd: (value: boolean) => void;
    onPlaylistChange: (playlistId: string) => void;
    onToggleTheme: (value: 'light' | 'dark') => void;
    onOpenStats: () => void;
}

export function SettingsView({
    userName,
    userEmail,
    autoAddTopMatch,
    defaultPlaylistId,
    playlists,
    theme,
    onBack,
    onLogout,
    onToggleAutoAdd,
    onPlaylistChange,
    onToggleTheme,
    onOpenStats,
}: SettingsViewProps) {
    return (
        <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
            {/* Header */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-white/10">
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
                        <h1 className="text-xl font-semibold">Settings</h1>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="container mx-auto px-4 md:px-6 py-8 max-w-2xl">
                <div className="space-y-6">
                    {/* Account Section */}
                    <div className="glass-card rounded-2xl p-6 space-y-4">
                        <h2 className="text-lg font-semibold">Account</h2>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                            <p className="font-medium">{userName}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                            <p className="font-medium">{userEmail}</p>
                        </div>
                    </div>

                    {/* Preferences Section */}
                    <div className="glass-card rounded-2xl p-6 space-y-6">
                        <h2 className="text-lg font-semibold">Preferences</h2>

                        {/* Auto-add Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label htmlFor="auto-add">Auto-add top match</Label>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Automatically save the best match without preview
                                </p>
                            </div>
                            <Switch
                                id="auto-add"
                                checked={autoAddTopMatch}
                                onCheckedChange={onToggleAutoAdd}
                                className="data-[state=checked]:bg-[#1DB954]"
                            />
                        </div>

                        {/* Default Playlist */}
                        <div className="space-y-2">
                            <Label htmlFor="playlist">Default Playlist</Label>
                            <Select value={defaultPlaylistId} onValueChange={onPlaylistChange}>
                                <SelectTrigger id="playlist">
                                    <SelectValue placeholder="Select a playlist" />
                                </SelectTrigger>
                                <SelectContent>
                                    {playlists.map((playlist) => (
                                        <SelectItem key={playlist.id} value={playlist.id}>
                                            {playlist.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Theme Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label htmlFor="theme">Dark Mode</Label>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Toggle dark mode theme
                                </p>
                            </div>
                            <Switch
                                id="theme"
                                checked={theme === 'dark'}
                                onCheckedChange={(checked) => onToggleTheme(checked ? 'dark' : 'light')}
                                className="data-[state=checked]:bg-[#1DB954]"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Button
                            onClick={onOpenStats}
                            variant="outline"
                            className="w-full"
                        >
                            View Stats
                        </Button>
                        <Button
                            onClick={onLogout}
                            variant="destructive"
                            className="w-full"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
