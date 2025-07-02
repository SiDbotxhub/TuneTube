import { 
  users, songs, playlists, playlistSongs, recentlyPlayed, likedSongs,
  type User, type InsertUser, type Song, type InsertSong, 
  type Playlist, type InsertPlaylist, type RecentlyPlayed, type LikedSong 
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Song methods
  getSong(id: number): Promise<Song | undefined>;
  getSongByVideoId(videoId: string): Promise<Song | undefined>;
  createSong(song: InsertSong): Promise<Song>;
  searchSongs(query: string): Promise<Song[]>;
  
  // Playlist methods
  getPlaylist(id: number): Promise<Playlist | undefined>;
  getUserPlaylists(userId: number): Promise<Playlist[]>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  
  // Recently played methods
  getRecentlyPlayed(userId: number, limit?: number): Promise<(RecentlyPlayed & { song: Song })[]>;
  addRecentlyPlayed(userId: number, songId: number): Promise<void>;
  
  // Liked songs methods
  getLikedSongs(userId: number): Promise<(LikedSong & { song: Song })[]>;
  toggleLikedSong(userId: number, songId: number): Promise<boolean>;
  isLikedSong(userId: number, songId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private songs: Map<number, Song>;
  private playlists: Map<number, Playlist>;
  private recentlyPlayedList: Map<string, RecentlyPlayed>;
  private likedSongsList: Map<string, LikedSong>;
  private currentId: number;
  private currentUserId: number;
  private currentSongId: number;
  private currentPlaylistId: number;
  private currentRecentlyPlayedId: number;
  private currentLikedSongId: number;

  constructor() {
    this.users = new Map();
    this.songs = new Map();
    this.playlists = new Map();
    this.recentlyPlayedList = new Map();
    this.likedSongsList = new Map();
    this.currentId = 1;
    this.currentUserId = 1;
    this.currentSongId = 1;
    this.currentPlaylistId = 1;
    this.currentRecentlyPlayedId = 1;
    this.currentLikedSongId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getSong(id: number): Promise<Song | undefined> {
    return this.songs.get(id);
  }

  async getSongByVideoId(videoId: string): Promise<Song | undefined> {
    return Array.from(this.songs.values()).find(song => song.videoId === videoId);
  }

  async createSong(insertSong: InsertSong): Promise<Song> {
    const id = this.currentSongId++;
    const song: Song = { 
      ...insertSong, 
      id,
      createdAt: new Date()
    };
    this.songs.set(id, song);
    return song;
  }

  async searchSongs(query: string): Promise<Song[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.songs.values()).filter(song => 
      song.title.toLowerCase().includes(lowercaseQuery) ||
      song.artist.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getPlaylist(id: number): Promise<Playlist | undefined> {
    return this.playlists.get(id);
  }

  async getUserPlaylists(userId: number): Promise<Playlist[]> {
    return Array.from(this.playlists.values()).filter(playlist => playlist.userId === userId);
  }

  async createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist> {
    const id = this.currentPlaylistId++;
    const playlist: Playlist = { 
      id,
      name: insertPlaylist.name,
      description: insertPlaylist.description ?? null,
      userId: insertPlaylist.userId ?? null,
      createdAt: new Date()
    };
    this.playlists.set(id, playlist);
    return playlist;
  }

  async getRecentlyPlayed(userId: number, limit = 20): Promise<(RecentlyPlayed & { song: Song })[]> {
    const userRecentlyPlayed = Array.from(this.recentlyPlayedList.values())
      .filter(rp => rp.userId === userId)
      .sort((a, b) => b.playedAt!.getTime() - a.playedAt!.getTime())
      .slice(0, limit);

    return userRecentlyPlayed.map(rp => {
      const song = this.songs.get(rp.songId!)!;
      return { ...rp, song };
    });
  }

  async addRecentlyPlayed(userId: number, songId: number): Promise<void> {
    const id = this.currentRecentlyPlayedId++;
    const recentlyPlayed: RecentlyPlayed = {
      id,
      userId,
      songId,
      playedAt: new Date()
    };
    this.recentlyPlayedList.set(`${userId}-${songId}`, recentlyPlayed);
  }

  async getLikedSongs(userId: number): Promise<(LikedSong & { song: Song })[]> {
    const userLikedSongs = Array.from(this.likedSongsList.values())
      .filter(ls => ls.userId === userId)
      .sort((a, b) => b.likedAt!.getTime() - a.likedAt!.getTime());

    return userLikedSongs.map(ls => {
      const song = this.songs.get(ls.songId!)!;
      return { ...ls, song };
    });
  }

  async toggleLikedSong(userId: number, songId: number): Promise<boolean> {
    const key = `${userId}-${songId}`;
    const existing = this.likedSongsList.get(key);
    
    if (existing) {
      this.likedSongsList.delete(key);
      return false;
    } else {
      const id = this.currentLikedSongId++;
      const likedSong: LikedSong = {
        id,
        userId,
        songId,
        likedAt: new Date()
      };
      this.likedSongsList.set(key, likedSong);
      return true;
    }
  }

  async isLikedSong(userId: number, songId: number): Promise<boolean> {
    return this.likedSongsList.has(`${userId}-${songId}`);
  }
}

export const storage = new MemStorage();
