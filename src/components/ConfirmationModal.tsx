import { useState, useRef, useEffect } from 'react';
<<<<<<< HEAD
import { Play, Pause, CheckCircle2 } from 'lucide-react';
=======
import { Play, Pause, CheckCircle2, AlertTriangle, ExternalLink, Share2 } from 'lucide-react';
>>>>>>> 36ab651fc45e4ea5236650b2c459320ba164a898
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface SongMatch {
  id: string;
  song: string;
  artist: string;
  album_art_url: string;
  preview_url?: string;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  matches: SongMatch[];
  onClose: () => void;
  onSelectSong: (song: SongMatch) => void;
}

export function ConfirmationModal({
  isOpen,
  matches,
  onClose,
  onSelectSong,
}: ConfirmationModalProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Cleanup audio when modal closes
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingId(null);
      setProgress(0);
    };
  }, [isOpen]);

  const handlePlayPause = (match: SongMatch) => {
    if (!match.preview_url) return;

    // If clicking the same song that's playing, pause it
    if (playingId === match.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    // Stop current audio if any
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Play new audio
    const audio = new Audio(match.preview_url);
    audioRef.current = audio;
    setPlayingId(match.id);
    setProgress(0);

    audio.play();

    // Update progress
    audio.ontimeupdate = () => {
      const value = (audio.currentTime / audio.duration) * 100;
      setProgress(value);
    };

    // Reset playing state when audio ends
    audio.onended = () => {
      setPlayingId(null);
      setProgress(0);
    };
  };

  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelect = async (match: SongMatch) => {
    if (isSelecting) return;

    console.log('ConfirmationModal: handleSelect clicked for:', match.song);
    setIsSelecting(true);

    try {
      // Stop audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingId(null);
      setProgress(0);

      console.log('ConfirmationModal: Calling onSelectSong...');
      await onSelectSong(match);
      console.log('ConfirmationModal: onSelectSong completed');
    } catch (err) {
      console.error('ConfirmationModal: Error in handleSelect:', err);
    } finally {
      setIsSelecting(false);
    }
  };

  const generateReceipt = async (elementId: string) => {
    try {
      const element = document.getElementById(elementId);
      if (!element) return;

      const canvas = await (window as any).html2canvas(element, {
        useCORS: true,
        backgroundColor: '#000000',
        scale: 2 // High res
      });

      canvas.toBlob(async (blob: any) => {
        if (!blob) return;

        const file = new File([blob], 'stash_receipt.png', { type: 'image/png' });

        // Mobile Share
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Stash Receipt',
            text: 'Found this gem on Stash! 💎'
          });
        } else {
          // Desktop Download
          const link = document.createElement('a');
          link.download = 'stash_receipt.png';
          link.href = canvas.toDataURL();
          link.click();
        }
      });
    } catch (err) {
      console.error('Receipt Generation Failed:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden p-0 gap-0 border-none bg-transparent shadow-none z-[130]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#1DB954]" />
            Is this your song?
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Preview and select the correct match from the results below
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 md:space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {matches.map((match, index) => (
            <div
              id={`result-card-${match.id}`}
              key={match.id}
              className="group flex flex-col gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 hover:border-[#1DB954]/50 transition-all"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'slideInUp 0.3s ease-out forwards',
              }}
            >
              <div className="flex items-center gap-3 md:gap-4">
                <img
                  src={match.album_art_url}
                  alt={`${match.song} album art`}
                  className="w-14 h-14 md:w-16 md:h-16 rounded-lg object-cover shadow-lg"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="truncate text-sm md:text-base">{match.song}</h4>
                  <p className="text-gray-400 truncate text-sm">{match.artist}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={!match.preview_url}
                      onClick={() => handlePlayPause(match)}
<<<<<<< HEAD
                      className="bg-white/10 border-white/20 hover:bg-white/20 hover:border-[#1DB954] transition-all h-10 w-10"
                      disabled={isSelecting}
=======
                      className={`bg-white/10 border-white/20 transition-all h-10 w-10 ${!match.preview_url ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/20 hover:border-[#1DB954]'
                        }`}
                      title={!match.preview_url ? "Preview unavailable on Spotify" : "Listen to preview"}
>>>>>>> 36ab651fc45e4ea5236650b2c459320ba164a898
                    >
                      {playingId === match.id ? (
                        <Pause className="w-4 h-4 text-[#1DB954]" />
                      ) : (
                        <Play className={`w-4 h-4 ${!match.preview_url ? 'text-gray-600' : ''}`} />
                      )}
                    </Button>
                  </div>
                  <Button
                    onClick={() => handleSelect(match)}
                    className="bg-[#1DB954] hover:bg-[#1ed760] text-black shadow-lg shadow-[#1DB954]/20 hover:shadow-[#1DB954]/40 transition-all min-w-[80px]"
                    disabled={isSelecting}
                  >
                    {isSelecting ? 'Wait...' : 'Select'}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => generateReceipt(`result-card-${match.id}`)}
                  className="text-gray-400 hover:text-white text-xs flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share Receipt
                </Button>
              </div>
              {playingId === match.id && (
                <Progress
                  value={progress}
                  className="h-1 bg-white/10"
                />
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}