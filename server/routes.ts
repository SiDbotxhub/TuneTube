import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSongSchema } from "@shared/schema";
import { spawn } from "child_process";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Search YouTube videos
  app.post("/api/search", async (req, res) => {
    try {
      const { query, limit = 10 } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Search query is required" });
      }

      const result = await executeYouTubeSearch(query, limit);
      
      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      // Store searched songs in our database
      const songs = [];
      for (const songData of result.results) {
        let song = await storage.getSongByVideoId(songData.videoId);
        if (!song) {
          song = await storage.createSong(songData);
        }
        songs.push(song);
      }

      res.json({ songs });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get user location from IP
  app.get("/api/location", async (req, res) => {
    try {
      const clientIp = req.headers['x-forwarded-for'] as string || 
                      req.connection.remoteAddress || 
                      req.socket.remoteAddress;
      
      const result = await getLocationFromIP(clientIp);
      
      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      res.json(result.location);
    } catch (error) {
      console.error("Location error:", error);
      res.status(500).json({ error: "Failed to get location" });
    }
  });

  // Get trending music by location
  app.post("/api/trending", async (req, res) => {
    try {
      const { countryCode, limit = 20 } = req.body;
      
      if (!countryCode) {
        return res.status(400).json({ error: "Country code is required" });
      }

      const result = await getTrendingMusic(countryCode, limit);
      
      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      // Store trending songs
      const songs = [];
      for (const songData of result.results) {
        let song = await storage.getSongByVideoId(songData.videoId);
        if (!song) {
          song = await storage.createSong(songData);
        }
        songs.push(song);
      }

      res.json({ songs });
    } catch (error) {
      console.error("Trending error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get song streaming URL
  app.get("/api/stream/:videoId", (req, res) => {
    const { videoId } = req.params;
    const streamingKey = process.env.STREAMING_KEY || "dc5lhBaaA2qHctJMQFjMyJgF";
    const streamUrl = `http://deadlinetech.site/stream/${videoId}?key=${streamingKey}`;
    
    res.json({ streamUrl });
  });

  // Get recently played songs
  app.get("/api/recently-played", async (req, res) => {
    try {
      // For demo purposes, using user ID 1
      // In real app, this would come from authentication
      const userId = 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const recentlyPlayed = await storage.getRecentlyPlayed(userId, limit);
      res.json({ songs: recentlyPlayed.map(rp => rp.song) });
    } catch (error) {
      console.error("Recently played error:", error);
      res.status(500).json({ error: "Failed to get recently played songs" });
    }
  });

  // Add song to recently played
  app.post("/api/recently-played", async (req, res) => {
    try {
      const { videoId } = req.body;
      
      if (!videoId) {
        return res.status(400).json({ error: "Video ID is required" });
      }

      // For demo purposes, using user ID 1
      const userId = 1;
      
      let song = await storage.getSongByVideoId(videoId);
      if (!song) {
        return res.status(404).json({ error: "Song not found" });
      }

      await storage.addRecentlyPlayed(userId, song.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Add recently played error:", error);
      res.status(500).json({ error: "Failed to add to recently played" });
    }
  });

  // Get liked songs
  app.get("/api/liked-songs", async (req, res) => {
    try {
      // For demo purposes, using user ID 1
      const userId = 1;
      
      const likedSongs = await storage.getLikedSongs(userId);
      res.json({ songs: likedSongs.map(ls => ls.song) });
    } catch (error) {
      console.error("Liked songs error:", error);
      res.status(500).json({ error: "Failed to get liked songs" });
    }
  });

  // Toggle liked song
  app.post("/api/toggle-like", async (req, res) => {
    try {
      const { videoId } = req.body;
      
      if (!videoId) {
        return res.status(400).json({ error: "Video ID is required" });
      }

      // For demo purposes, using user ID 1
      const userId = 1;
      
      let song = await storage.getSongByVideoId(videoId);
      if (!song) {
        return res.status(404).json({ error: "Song not found" });
      }

      const isLiked = await storage.toggleLikedSong(userId, song.id);
      res.json({ isLiked });
    } catch (error) {
      console.error("Toggle like error:", error);
      res.status(500).json({ error: "Failed to toggle like" });
    }
  });

  // Check if song is liked
  app.get("/api/is-liked/:videoId", async (req, res) => {
    try {
      const { videoId } = req.params;
      
      // For demo purposes, using user ID 1
      const userId = 1;
      
      const song = await storage.getSongByVideoId(videoId);
      if (!song) {
        return res.json({ isLiked: false });
      }

      const isLiked = await storage.isLikedSong(userId, song.id);
      res.json({ isLiked });
    } catch (error) {
      console.error("Check liked error:", error);
      res.status(500).json({ error: "Failed to check if song is liked" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions to execute Python scripts
function executeYouTubeSearch(query: string, limit: number): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'server', 'youtube-search.py');
    const child = spawn('python3', [pythonScript, 'search', query, limit.toString()]);
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed: ${stderr}`));
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse Python output: ${error}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

function getLocationFromIP(ip?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'server', 'youtube-search.py');
    const args = ['python3', pythonScript, 'location'];
    if (ip) args.push(ip);
    
    const child = spawn(args[0], args.slice(1));
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed: ${stderr}`));
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse Python output: ${error}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

function getTrendingMusic(countryCode: string, limit: number): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'server', 'youtube-search.py');
    const child = spawn('python3', [pythonScript, 'trending', countryCode, limit.toString()]);
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed: ${stderr}`));
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse Python output: ${error}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}
