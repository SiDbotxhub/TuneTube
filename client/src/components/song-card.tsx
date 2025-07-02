import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import type { Song } from "@shared/schema";

interface SongCardProps {
  song: Song;
  onPlay: () => void;
}

export default function SongCard({ song, onPlay }: SongCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPlay();
  };

  return (
    <div 
      className="song-card bg-spotify-light-gray p-3 rounded-lg hover:bg-spotify-gray transition-colors duration-200 group cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative w-full aspect-video mb-3 overflow-hidden rounded-lg">
        <img 
          src={song.thumbnail} 
          alt={song.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
          <div className="w-12 h-12 bg-spotify-green/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
            <Play className="h-5 w-5 text-black ml-0.5" />
          </div>
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="font-medium text-white truncate text-sm leading-tight">{song.title}</h3>
        <p className="spotify-text-gray text-xs truncate">{song.artist}</p>
        {song.duration && (
          <span className="spotify-text-gray text-xs">{song.duration}</span>
        )}
      </div>
    </div>
  );
}
