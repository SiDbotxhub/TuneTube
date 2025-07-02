import { Home, Search, List, Plus, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  return (
    <div className="w-64 bg-black p-6 flex flex-col hidden md:flex">
      {/* Logo */}
      <div className="flex items-center mb-8">
        <div className="w-8 h-8 spotify-bg-green rounded-full flex items-center justify-center mr-3">
          <div className="w-0 h-0 border-l-[6px] border-l-black border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1" />
        </div>
        <span className="text-xl font-bold">StreamTube</span>
      </div>

      {/* Main Navigation */}
      <nav className="mb-8">
        <ul className="space-y-4">
          <li>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:text-primary bg-spotify-light-gray px-4 py-2 rounded-md"
            >
              <Home className="mr-4 h-5 w-5" />
              <span className="font-medium">Home</span>
            </Button>
          </li>
          <li>
            <Button 
              variant="ghost" 
              className="w-full justify-start spotify-text-gray hover:text-white px-4 py-2 rounded-md"
            >
              <Search className="mr-4 h-5 w-5" />
              <span className="font-medium">Search</span>
            </Button>
          </li>
          <li>
            <Button 
              variant="ghost" 
              className="w-full justify-start spotify-text-gray hover:text-white px-4 py-2 rounded-md"
            >
              <List className="mr-4 h-5 w-5" />
              <span className="font-medium">Your Library</span>
            </Button>
          </li>
        </ul>
      </nav>

      {/* Library Actions */}
      <div className="mb-8">
        <ul className="space-y-4">
          <li>
            <Button 
              variant="ghost" 
              className="w-full justify-start spotify-text-gray hover:text-white px-4 py-2 rounded-md"
            >
              <Plus className="mr-4 h-5 w-5" />
              <span className="font-medium">Create Playlist</span>
            </Button>
          </li>
          <li>
            <Button 
              variant="ghost" 
              className="w-full justify-start spotify-text-gray hover:text-white px-4 py-2 rounded-md"
            >
              <Heart className="mr-4 h-5 w-5" />
              <span className="font-medium">Liked Songs</span>
            </Button>
          </li>
        </ul>
      </div>

      {/* Recently Played */}
      <div className="flex-1">
        <h3 className="spotify-text-gray text-sm font-medium mb-4 px-4">RECENTLY PLAYED</h3>
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start px-4 py-2 spotify-text-gray hover:text-white cursor-pointer rounded-md hover:bg-spotify-light-gray"
          >
            <span className="text-sm">My Playlist #1</span>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start px-4 py-2 spotify-text-gray hover:text-white cursor-pointer rounded-md hover:bg-spotify-light-gray"
          >
            <span className="text-sm">Discover Weekly</span>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start px-4 py-2 spotify-text-gray hover:text-white cursor-pointer rounded-md hover:bg-spotify-light-gray"
          >
            <span className="text-sm">Top Hits 2024</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
