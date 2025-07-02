import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import MusicPlayer from "@/components/music-player";
import SearchResults from "@/components/search-results";
import SongCard from "@/components/song-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search, Bell, Music, Menu, Home as HomeIcon, List, Heart, Plus, Play } from "lucide-react";
import { useLocation } from "@/hooks/use-location";
import { useFavorites } from "@/hooks/use-favorites";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Song } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [activeView, setActiveView] = useState<'home' | 'liked' | 'library'>('home');
  const showFavorites = activeView === 'liked';
  const showLibrary = activeView === 'library';
  const showHome = activeView === 'home';
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [playerPosition, setPlayerPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const queryClient = useQueryClient();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const { location, isLoading: locationLoading } = useLocation();
  
  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("POST", "/api/search", { query });
      return response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data.songs || []);
    },
  });

  // Trending music query
  const { data: trendingSongs } = useQuery({
    queryKey: ["/api/trending", location?.countryCode],
    queryFn: async () => {
      if (!location?.countryCode) return { songs: [] };
      const response = await apiRequest("POST", "/api/trending", { 
        countryCode: location.countryCode 
      });
      return response.json();
    },
    enabled: !!location?.countryCode,
  });

  // Recently played query
  const { data: recentlyPlayedData } = useQuery({
    queryKey: ["/api/recently-played"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/recently-played");
      return response.json();
    },
  });

  // Handle search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setShowSearchResults(true);
    setActiveView('home');
    await searchMutation.mutateAsync(searchQuery);
  };

  // Real-time search with debouncing
  useEffect(() => {
    if (searchQuery.trim() && searchQuery.length > 0) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else if (searchQuery.length === 0) {
      setShowSearchResults(false);
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearchButtonClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!showSearchResults) {
      setShowSearchResults(true);
      setActiveView('home');
    }
  };

  const handleSongPlay = async (song: Song) => {
    setCurrentSong(song);
    setIsPlayerExpanded(false); // Start with mini player for better UX
    
    // Auto-play the song immediately
    setTimeout(() => {
      const audio = document.querySelector('audio') as HTMLAudioElement;
      if (audio) {
        audio.play().catch(console.error);
      }
    }, 100);
    
    // Add to recently played
    try {
      await apiRequest("POST", "/api/recently-played", { videoId: song.videoId });
      queryClient.invalidateQueries({ queryKey: ["/api/recently-played"] });
    } catch (error) {
      console.error("Failed to add to recently played:", error);
    }
  };

  return (
    <div className="flex h-screen bg-spotify-dark text-white">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <div className="spotify-bg-gray p-4 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-8 h-8 bg-black/70 rounded-full p-0"
              onClick={() => setShowMobileNav(!showMobileNav)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="w-8 h-8 bg-black/70 rounded-full p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 bg-black/70 rounded-full p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Logo for Mobile - Hidden to save space */}
          <div className="md:hidden flex items-center">
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-2 md:mx-8">
            <div className="relative">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search for songs, artists, or videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-black px-4 py-2.5 pl-12 pr-4 rounded-full border-0 text-sm md:text-base shadow-lg focus:shadow-xl transition-shadow"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
            </div>
          </form>

          <div className="flex items-center space-x-2 md:space-x-4">
            <Button variant="ghost" size="sm" className="w-8 h-8 bg-black/70 rounded-full p-0 hidden md:flex">
              <Bell className="h-4 w-4" />
            </Button>
            <div className="w-6 h-6 md:w-8 md:h-8 spotify-bg-green rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-xs md:text-sm">U</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        {showMobileNav && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileNav(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-black p-6 flex flex-col">
              {/* Mobile Logo */}
              <div className="flex items-center mb-8">
                <div className="w-8 h-8 spotify-bg-green rounded-full flex items-center justify-center mr-3">
                  <div className="w-0 h-0 border-l-[6px] border-l-black border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1" />
                </div>
                <span className="text-xl font-bold">StreamTube</span>
              </div>

              {/* Mobile Navigation */}
              <nav className="mb-8">
                <ul className="space-y-4">
                  <li>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-white hover:text-primary bg-spotify-light-gray px-4 py-2 rounded-md"
                      onClick={() => setShowMobileNav(false)}
                    >
                      <HomeIcon className="mr-4 h-5 w-5" />
                      <span className="font-medium">Home</span>
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start spotify-text-gray hover:text-white px-4 py-2 rounded-md"
                      onClick={() => setShowMobileNav(false)}
                    >
                      <Search className="mr-4 h-5 w-5" />
                      <span className="font-medium">Search</span>
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start spotify-text-gray hover:text-white px-4 py-2 rounded-md"
                      onClick={() => setShowMobileNav(false)}
                    >
                      <List className="mr-4 h-5 w-5" />
                      <span className="font-medium">Your Library</span>
                    </Button>
                  </li>
                </ul>
              </nav>

              {/* Mobile Library Actions */}
              <div className="mb-8">
                <ul className="space-y-4">
                  <li>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start spotify-text-gray hover:text-white px-4 py-2 rounded-md"
                      onClick={() => setShowMobileNav(false)}
                    >
                      <Plus className="mr-4 h-5 w-5" />
                      <span className="font-medium">Create Playlist</span>
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start spotify-text-gray hover:text-white px-4 py-2 rounded-md"
                      onClick={() => setShowMobileNav(false)}
                    >
                      <Heart className="mr-4 h-5 w-5" />
                      <span className="font-medium">Liked Songs</span>
                    </Button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-spotify-gray to-spotify-dark">
          <div className="p-4 md:p-8 pb-40 md:pb-32">
            {showLibrary ? (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6">Your Library</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-spotify-green" />
                      Liked Songs ({favorites.length})
                    </h3>
                    {favorites.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
                        {favorites.slice(0, 6).map((song: Song) => (
                          <SongCard
                            key={song.id}
                            song={song}
                            onPlay={() => handleSongPlay(song)}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="spotify-text-gray">No liked songs yet</p>
                    )}
                  </div>
                  
                  {recentlyPlayedData?.songs && recentlyPlayedData.songs.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Music className="h-5 w-5 mr-2 text-spotify-green" />
                        Recently Played
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
                        {recentlyPlayedData.songs.slice(0, 6).map((song: Song) => (
                          <SongCard
                            key={song.id}
                            song={song}
                            onPlay={() => handleSongPlay(song)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : showFavorites ? (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6">Your Liked Songs</h2>
                {favorites.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
                    {favorites.map((song: Song) => (
                      <SongCard
                        key={song.id}
                        song={song}
                        onPlay={() => handleSongPlay(song)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 spotify-text-gray mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No liked songs yet</h3>
                    <p className="spotify-text-gray">Songs you like will appear here</p>
                  </div>
                )}
              </div>
            ) : showSearchResults && searchQuery ? (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6">Search Results for "{searchQuery}"</h2>
                {searchMutation.isPending ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="song-card">
                        <div className="w-full aspect-square bg-muted rounded-lg mb-4 animate-pulse" />
                        <div className="h-4 bg-muted rounded mb-2 animate-pulse" />
                        <div className="h-3 bg-muted/70 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
                    {searchResults.map((song: Song) => (
                      <SongCard
                        key={song.id}
                        song={song}
                        onPlay={() => handleSongPlay(song)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="spotify-text-gray">No results found. Try a different search term.</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Welcome Section */}
                <div className="mb-6 md:mb-8">
                  <div className="gradient-header rounded-xl p-4 md:p-8 relative overflow-hidden">
                    <div className="relative z-10">
                      <h1 className="text-2xl md:text-4xl font-bold mb-2">{getGreeting()}</h1>
                      <p className="text-sm md:text-lg opacity-90">
                        {locationLoading 
                          ? "Getting your location..." 
                          : location 
                            ? `Ready to discover amazing music from ${location.city}, ${location.country}?`
                            : "Ready to discover amazing music?"
                        }
                      </p>
                    </div>
                    <div className="absolute right-4 md:right-8 top-2 md:top-4 opacity-30">
                      <Music className="h-8 w-8 md:h-16 md:w-16" />
                    </div>
                  </div>
                </div>

                {/* Quick Access Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                  <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-4 md:p-6 cursor-pointer hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <Music className="h-6 w-6 md:h-8 md:w-8 mb-2" />
                        <h3 className="font-bold text-base md:text-lg">Liked Songs</h3>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-xl p-4 md:p-6 cursor-pointer hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <Music className="h-6 w-6 md:h-8 md:w-8 mb-2" />
                        <h3 className="font-bold text-base md:text-lg">Recently Played</h3>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl p-4 md:p-6 cursor-pointer hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <Music className="h-6 w-6 md:h-8 md:w-8 mb-2" />
                        <h3 className="font-bold text-base md:text-lg">Discover Weekly</h3>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Suggested Songs */}
                <div className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
                    Suggested for You
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-3">
                    {[
                      { title: "Shape of You", artist: "Ed Sheeran", videoId: "JGwWNGJdvx8", thumbnail: "https://img.youtube.com/vi/JGwWNGJdvx8/maxresdefault.jpg" },
                      { title: "Blinding Lights", artist: "The Weeknd", videoId: "4NRXx6U8ABQ", thumbnail: "https://img.youtube.com/vi/4NRXx6U8ABQ/maxresdefault.jpg" },
                      { title: "Tum Hi Ho", artist: "Arijit Singh", videoId: "Jt_2Zl78ZvQ", thumbnail: "https://img.youtube.com/vi/Jt_2Zl78ZvQ/maxresdefault.jpg" },
                      { title: "Senorita", artist: "Shawn Mendes", videoId: "Pkh8UtuejGw", thumbnail: "https://img.youtube.com/vi/Pkh8UtuejGw/maxresdefault.jpg" },
                      { title: "Duniya", artist: "Akhil", videoId: "CK8tyQGb8Ho", thumbnail: "https://img.youtube.com/vi/CK8tyQGb8Ho/maxresdefault.jpg" },
                      { title: "Bad Guy", artist: "Billie Eilish", videoId: "DyDfgMOUjCI", thumbnail: "https://img.youtube.com/vi/DyDfgMOUjCI/maxresdefault.jpg" }
                    ].map((song, index) => (
                      <SongCard
                        key={index}
                        song={{ 
                          id: index, 
                          videoId: song.videoId, 
                          title: song.title, 
                          artist: song.artist, 
                          thumbnail: song.thumbnail,
                          duration: "3:30",
                          createdAt: new Date()
                        }}
                        onPlay={() => handleSongPlay({ 
                          id: index, 
                          videoId: song.videoId, 
                          title: song.title, 
                          artist: song.artist, 
                          thumbnail: song.thumbnail,
                          duration: "3:30",
                          createdAt: new Date()
                        })}
                      />
                    ))}
                  </div>
                </div>

                {/* Search Categories */}
                <div className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
                    Browse by Category
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <Button
                      onClick={() => {
                        setSearchQuery("popular hindi songs");
                        handleSearch();
                      }}
                      className="p-4 h-auto bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white rounded-lg"
                    >
                      <div className="text-left w-full">
                        <h3 className="font-semibold mb-1">Hindi Hits</h3>
                        <p className="text-sm opacity-90">Latest Bollywood songs</p>
                      </div>
                    </Button>
                    <Button
                      onClick={() => {
                        setSearchQuery("popular english songs");
                        handleSearch();
                      }}
                      className="p-4 h-auto bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-lg"
                    >
                      <div className="text-left w-full">
                        <h3 className="font-semibold mb-1">Global Hits</h3>
                        <p className="text-sm opacity-90">Top English tracks</p>
                      </div>
                    </Button>
                    <Button
                      onClick={() => {
                        setSearchQuery("trending music 2024");
                        handleSearch();
                      }}
                      className="p-4 h-auto bg-gradient-to-br from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white rounded-lg"
                    >
                      <div className="text-left w-full">
                        <h3 className="font-semibold mb-1">Trending Now</h3>
                        <p className="text-sm opacity-90">What's hot right now</p>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Location-based Recommendations */}
                {trendingSongs?.songs && trendingSongs.songs.length > 0 && (
                  <div className="mb-6 md:mb-8">
                    <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
                      Popular in {location?.city || "Your Area"}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
                      {trendingSongs.songs.slice(0, 12).map((song: Song) => (
                        <SongCard
                          key={song.id}
                          song={song}
                          onPlay={() => handleSongPlay(song)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Recently Played Section */}
                {recentlyPlayedData?.songs && recentlyPlayedData.songs.length > 0 && (
                  <div className="mb-6 md:mb-8">
                    <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Recently Played</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
                      {recentlyPlayedData.songs.slice(0, 12).map((song: Song) => (
                        <SongCard
                          key={song.id}
                          song={song}
                          onPlay={() => handleSongPlay(song)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {(!trendingSongs?.songs?.length && !recentlyPlayedData?.songs?.length) && (
                  <div className="text-center py-16">
                    <div className="mb-6">
                      <Music className="h-16 w-16 text-primary opacity-50 mx-auto" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Start your music journey</h3>
                    <p className="spotify-text-gray mb-8 max-w-md mx-auto">
                      Search for your favorite songs on YouTube and start building your library
                    </p>
                    <Button 
                      onClick={() => document.querySelector('input')?.focus()}
                      className="spotify-bg-green text-black px-8 py-3 rounded-full font-semibold hover:spotify-bg-light-green"
                    >
                      Search Music
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-spotify-light-gray px-4 py-3 z-50">
        <div className="flex items-center justify-around">
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center space-y-1 transition-colors ${showHome ? 'text-spotify-green' : 'spotify-text-gray hover:text-white'}`}
            onClick={() => {
              setActiveView('home');
              setShowSearchResults(false);
            }}
          >
            <HomeIcon className="h-5 w-5" />
            <span className="text-xs font-medium">Home</span>
          </Button>
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center space-y-1 transition-colors ${showSearchResults && !showFavorites && !showLibrary ? 'text-spotify-green' : 'spotify-text-gray hover:text-white'}`}
            onClick={handleSearchButtonClick}
          >
            <Search className="h-5 w-5" />
            <span className="text-xs font-medium">Search</span>
          </Button>
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center space-y-1 transition-colors ${showLibrary ? 'text-spotify-green' : 'spotify-text-gray hover:text-white'}`}
            onClick={() => {
              setActiveView('library');
              setShowSearchResults(false);
            }}
          >
            <List className="h-5 w-5" />
            <span className="text-xs font-medium">Library</span>
          </Button>
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center space-y-1 transition-colors ${showFavorites ? 'text-spotify-green' : 'spotify-text-gray hover:text-white'}`}
            onClick={() => {
              setActiveView('liked');
              setShowSearchResults(false);
            }}
          >
            <Heart className="h-5 w-5" />
            <span className="text-xs font-medium">Liked</span>
          </Button>
        </div>
      </div>

      {/* Moveable Mini Player */}
      {currentSong && !isPlayerExpanded && (
        <div 
          className="fixed z-50"
          style={{ left: `${playerPosition.x}px`, top: `${playerPosition.y}px` }}
        >
          <div className="relative group">
            {/* Thumbnail Background */}
            <div 
              className="w-16 h-16 rounded-full shadow-2xl overflow-hidden cursor-pointer hover:scale-110 transition-transform duration-200"
              style={{
                backgroundImage: `url(${currentSong.thumbnail})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              onMouseDown={(e) => {
                let startTime = Date.now();
                const rect = e.currentTarget.getBoundingClientRect();
                const offsetX = e.clientX - rect.left;
                const offsetY = e.clientY - rect.top;
                
                const handleMouseMove = (e: MouseEvent) => {
                  if (Date.now() - startTime > 150) { // Only drag after 150ms hold
                    setPlayerPosition({
                      x: Math.max(0, Math.min(window.innerWidth - 80, e.clientX - offsetX)),
                      y: Math.max(0, Math.min(window.innerHeight - 80, e.clientY - offsetY))
                    });
                  }
                };
                
                const handleMouseUp = () => {
                  if (Date.now() - startTime < 150) {
                    // Quick click - toggle play/pause
                    const audio = document.querySelector('audio') as HTMLAudioElement;
                    if (audio) {
                      if (audio.paused) {
                        audio.play();
                      } else {
                        audio.pause();
                      }
                    }
                  }
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            >
              {/* Dark overlay with play/pause icon */}
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Play className="h-6 w-6 text-white" />
              </div>
            </div>
            
            {/* Expand Button */}
            <Button
              size="sm"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-spotify-green text-black hover:bg-spotify-green/80 p-0"
              onClick={() => setIsPlayerExpanded(true)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Expanded Music Player */}
      {currentSong && isPlayerExpanded && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-spotify-dark rounded-xl w-full max-w-md p-6 relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-white hover:text-spotify-green"
              onClick={() => {
                setIsPlayerExpanded(false);
                // Keep music playing - don't stop the audio
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-white">Now Playing</h3>
            </div>
            <MusicPlayer 
              song={currentSong} 
              onSongChange={setCurrentSong}
            />
          </div>
        </div>
      )}
    </div>
  );
}
