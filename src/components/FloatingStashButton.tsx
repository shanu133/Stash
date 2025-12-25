import { Plus } from 'lucide-react';
import { Button } from './ui/button';

interface FloatingStashButtonProps {
  onClick: () => void;
}

export function FloatingStashButton({ onClick }: FloatingStashButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="md:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-[#1DB954] to-[#1ed760] hover:from-[#1ed760] hover:to-[#1DB954] shadow-2xl shadow-[#1DB954]/40 hover:shadow-[#1DB954]/60 transition-all hover:scale-110 active:scale-95"
    >
      <Plus className="w-6 h-6 text-black" />
    </Button>
  );
}
