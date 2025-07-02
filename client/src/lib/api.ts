import { apiRequest } from "./queryClient";
import type { Song } from "@shared/schema";

export const api = {
  search: async (query: string): Promise<{ songs: Song[] }> => {
    const response = await apiRequest("POST", "/api/search", { query });
    return response.json();
  },

  getLocation: async () => {
    const response = await apiRequest("GET", "/api/location");
    return response.json();
  },

  getTrending: async (countryCode: string): Promise<{ songs: Song[] }> => {
    const response = await apiRequest("POST", "/api/trending", { countryCode });
    return response.json();
  },

  getStreamUrl: async (videoId: string): Promise<{ streamUrl: string }> => {
    const response = await apiRequest("GET", `/api/stream/${videoId}`);
    return response.json();
  },

  getRecentlyPlayed: async (): Promise<{ songs: Song[] }> => {
    const response = await apiRequest("GET", "/api/recently-played");
    return response.json();
  },

  addRecentlyPlayed: async (videoId: string): Promise<void> => {
    await apiRequest("POST", "/api/recently-played", { videoId });
  },

  getLikedSongs: async (): Promise<{ songs: Song[] }> => {
    const response = await apiRequest("GET", "/api/liked-songs");
    return response.json();
  },

  toggleLike: async (videoId: string): Promise<{ isLiked: boolean }> => {
    const response = await apiRequest("POST", "/api/toggle-like", { videoId });
    return response.json();
  },

  isLiked: async (videoId: string): Promise<{ isLiked: boolean }> => {
    const response = await apiRequest("GET", `/api/is-liked/${videoId}`);
    return response.json();
  },
};
