import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2, 
  VolumeX,
  Heart,
  List
} from "lucide-react";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useFavorites } from "@/hooks/use-favorites";
import type { Song } from "@shared/schema";

interface MusicPlayerProps {
  song: Song;
  onSongChange: (song: Song | null) => void;
}

export default function MusicPlayer({ song, onSongChange }: MusicPlayerProps) {
  const [nextSongs, setNextSongs] = useState<Song[]>([]);
  const queryClient = useQueryClient();
  const { toggleFavorite, isFavorite } = useFavorites();
  const isLiked = isFavorite(song.videoId);
  
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    seek,
    setVolume: updateVolume,
    toggleMute,
    audioRef
  } = useAudioPlayer();

  // Get streaming URL
  const { data: streamData } = useQuery({
    queryKey: ["/api/stream", song.videoId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/stream/${song.videoId}`);
      return response.json();
    },
  });



  useEffect(() => {
    if (streamData?.streamUrl && audioRef.current) {
      audioRef.current.src = streamData.streamUrl;
    }
  }, [streamData, audioRef]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (value: number[]) => {
    seek(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    updateVolume(value[0] / 100);
  };

  const handleToggleLike = () => {
    toggleFavorite(song);
  };

  // Fetch next songs based on current song for auto-play
  useEffect(() => {
    const fetchNextSongs = async () => {
      try {
        const data = await apiRequest("POST", "/api/search", { 
          query: `${song.artist} similar music`,
          limit: 5
        });
        if (data.songs) {
          setNextSongs(data.songs.filter((s: Song) => s.videoId !== song.videoId));
        }
      } catch (error) {
        console.error("Failed to fetch next songs:", error);
      }
    };
    
    fetchNextSongs();
  }, [song]);

  // Handle song end to play next
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (nextSongs.length > 0) {
        const nextSong = nextSongs[0];
        onSongChange(nextSong);
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [nextSongs, onSongChange]);

  return (
    <div className="bg-spotify-light-gray border-t border-spotify-gray p-2 md:p-4 flex flex-col md:flex-row items-center justify-between">
      {/* Currently Playing */}
      <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0 w-full md:w-auto">
        <div className="w-10 h-10 md:w-14 md:h-14 bg-spotify-gray rounded-lg flex-shrink-0 overflow-hidden">
          {song.thumbnail ? (
            <img 
              src={song.thumbnail} 
              alt={song.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="h-4 w-4 md:h-6 md:w-6 spotify-text-gray" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-white truncate text-sm md:text-base">{song.title}</h4>
          <p className="spotify-text-gray text-xs md:text-sm truncate">{song.artist}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleLike}
          className={`transition-colors duration-200 ${
            isLiked ? 'text-spotify-green hover:text-spotify-green' : 'spotify-text-gray hover:text-white'
          }`}
        >
          <Heart className={`h-4 w-4 md:h-5 md:w-5 ${isLiked ? 'fill-current' : ''}`} />
        </Button>
      </div>

      {/* Player Controls */}
      <div className="flex flex-col items-center space-y-2 flex-1 max-w-md w-full md:w-auto mt-2 md:mt-0">
        <div className="flex items-center space-x-3 md:space-x-4">
          <Button variant="ghost" size="sm" className="spotify-text-gray hover:text-white hidden md:flex">
            <Shuffle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="spotify-text-gray hover:text-white">
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            onClick={togglePlay}
            className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 p-0"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 md:h-5 md:w-5 text-black" />
            ) : (
              <Play className="h-4 w-4 md:h-5 md:w-5 text-black ml-0.5" />
            )}
          </Button>
          <Button variant="ghost" size="sm" className="spotify-text-gray hover:text-white">
            <SkipForward className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="spotify-text-gray hover:text-white hidden md:flex">
            <Repeat className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className="flex items-center space-x-2 w-full">
          <span className="text-xs spotify-text-gray">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleProgressChange}
            className="flex-1"
          />
          <span className="text-xs spotify-text-gray">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume Controls */}
      <div className="hidden md:flex items-center space-x-4 flex-1 justify-end">
        <Button variant="ghost" size="sm" className="spotify-text-gray hover:text-white">
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMute}
          className="spotify-text-gray hover:text-white"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
        <div className="w-24">
          <Slider
            value={[isMuted ? 0 : volume * 100]}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
          />
        </div>
      </div>

      {/* Mobile Volume Control */}
      <div className="md:hidden flex items-center space-x-2 mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMute}
          className="spotify-text-gray hover:text-white"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
        <div className="w-20">
          <Slider
            value={[isMuted ? 0 : volume * 100]}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
          />
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="metadata" />
    </div>
  );
}
