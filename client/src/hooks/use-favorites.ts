import { useState, useEffect } from 'react';
import type { Song } from '@shared/schema';

const FAVORITES_STORAGE_KEY = 'streamtube_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Song[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favorites]);

  const addToFavorites = (song: Song) => {
    setFavorites(prev => {
      const exists = prev.some(fav => fav.videoId === song.videoId);
      if (!exists) {
        return [...prev, song];
      }
      return prev;
    });
  };

  const removeFromFavorites = (videoId: string) => {
    setFavorites(prev => prev.filter(fav => fav.videoId !== videoId));
  };

  const toggleFavorite = (song: Song) => {
    const isFavorite = favorites.some(fav => fav.videoId === song.videoId);
    if (isFavorite) {
      removeFromFavorites(song.videoId);
    } else {
      addToFavorites(song);
    }
    return !isFavorite;
  };

  const isFavorite = (videoId: string) => {
    return favorites.some(fav => fav.videoId === videoId);
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
  };
}