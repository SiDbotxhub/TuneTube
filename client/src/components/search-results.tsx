import { useQuery } from "@tanstack/react-query";
import SongCard from "./song-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { Song } from "@shared/schema";

interface SearchResultsProps {
  query: string;
  onSongPlay: (song: Song) => void;
  isLoading: boolean;
}

export default function SearchResults({ query, onSongPlay, isLoading }: SearchResultsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const songsPerPage = 12;
  
  const { data: searchData } = useQuery({
    queryKey: ["/api/search-results", query],
    queryFn: async () => {
      // This would be updated after the search mutation completes
      return { songs: [] };
    },
    enabled: false, // We'll rely on the mutation to update the cache
  });

  const totalSongs = searchData?.songs?.length || 0;
  const totalPages = Math.ceil(totalSongs / songsPerPage);
  const startIndex = (currentPage - 1) * songsPerPage;
  const endIndex = startIndex + songsPerPage;
  const currentSongs = searchData?.songs?.slice(startIndex, endIndex) || [];

  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Searching for "{query}"...</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="song-card">
              <Skeleton className="w-full aspect-square rounded-lg mb-4" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!searchData?.songs?.length) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Search Results for "{query}"</h2>
        <div className="text-center py-8">
          <p className="spotify-text-gray">No results found. Try a different search term.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6">Search Results for "{query}"</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-3">
        {currentSongs.map((song: Song) => (
          <SongCard
            key={song.id}
            song={song}
            onPlay={() => onSongPlay(song)}
          />
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>
          
          <span className="text-sm spotify-text-gray">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center space-x-2"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
