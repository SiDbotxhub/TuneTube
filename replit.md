# StreamTube - Music Streaming Application

## Overview

StreamTube is a Spotify-inspired music streaming application that allows users to search for YouTube videos as music tracks, play them, and manage playlists. The application integrates YouTube search functionality with a custom database to store song information and user preferences. It features a modern dark-themed interface built with React and shadcn/ui components.

## System Architecture

The application follows a full-stack architecture with clear separation between frontend, backend, and data layers:

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components based on Radix UI primitives
- **Styling**: Tailwind CSS with custom Spotify-inspired color variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design
- **External Integration**: Python scripts for YouTube search and IP geolocation
- **Session Management**: Express sessions with PostgreSQL session store

### Database Architecture
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Fallback Storage**: In-memory storage implementation for development

## Key Components

### Database Schema
- **users**: User authentication and profile information
- **songs**: YouTube video metadata (videoId, title, artist, thumbnail, duration)
- **playlists**: User-created playlists with metadata
- **playlistSongs**: Many-to-many relationship between playlists and songs
- **recentlyPlayed**: User's listening history
- **likedSongs**: User's favorite tracks

### API Endpoints
- **POST /api/search**: Search YouTube videos and store results
- **GET /api/location**: Get user's geographical location from IP
- **POST /api/trending**: Get trending music by country
- **GET /api/stream/:videoId**: Get streaming URL for video playback
- **GET /api/recently-played**: User's recent listening history
- **POST/GET /api/liked-songs**: Manage user's liked songs

### Core Features
- **Music Search**: YouTube video search with metadata extraction
- **Audio Player**: Custom HTML5 audio player with controls
- **Playlist Management**: Create, manage, and organize playlists
- **User Preferences**: Track recently played and liked songs
- **Location-Based Content**: Show trending music based on user location
- **Responsive Design**: Mobile-first responsive interface

## Data Flow

1. **Search Flow**: User searches → Python script queries YouTube → Results stored in database → Frontend displays cached results
2. **Playback Flow**: User selects song → Backend fetches streaming URL → Audio player streams content → Usage tracked in database
3. **User Data Flow**: User interactions → API endpoints → Database updates → UI state updates via React Query

## External Dependencies

### Python Integration
- **youtubesearchpython**: YouTube video search functionality
- **httpx**: HTTP client for IP geolocation services
- **Child Process**: Node.js spawns Python scripts for external operations

### Key NPM Packages
- **@neondatabase/serverless**: Neon database connectivity
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-**: Component primitives for UI
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight React router

### External APIs
- **YouTube (via Python library)**: Video search and metadata
- **ipapi.co**: IP-based geolocation services

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Hot module replacement for frontend development
- **tsx**: TypeScript execution for backend development
- **Concurrent Development**: Frontend and backend run simultaneously

### Production Build
- **Frontend**: Vite builds optimized React bundle
- **Backend**: esbuild bundles server code for Node.js execution
- **Database**: Drizzle migrations ensure schema consistency
- **Static Assets**: Served directly by Express in production

### Environment Configuration
- **Database**: PostgreSQL connection via DATABASE_URL environment variable
- **Development Tools**: Replit-specific plugins for debugging and error handling
- **TypeScript**: Strict type checking with path aliases for clean imports

## Changelog

```
Changelog:
- June 29, 2025. Initial setup
- June 29, 2025. Made application fully responsive for mobile devices:
  * Hidden desktop sidebar on mobile with hamburger menu
  * Added mobile navigation overlay and bottom navigation bar
  * Optimized music player for mobile with stacked layout
  * Adjusted grid layouts and text sizes for mobile screens
  * Added touch-friendly button sizes and spacing
- June 29, 2025. Major UI improvements and favorites functionality:
  * Removed StreamTube header for cleaner look
  * Enhanced search bar with better styling and positioning
  * Made song cards YouTube-sized (16:9 aspect ratio) and fully clickable
  * Moved music player to bottom with dark backdrop
  * Added functional favorites system with localStorage
  * Improved bottom navigation with working Home/Liked buttons
  * Enhanced grid layouts for better YouTube-like appearance
- June 29, 2025. Advanced UX improvements and functionality:
  * Fixed Library button with comprehensive library view
  * Implemented real-time search with debouncing (no enter required)
  * Added clickable search button that focuses input
  * Created compact, expandable music player
  * Added suggested music categories on home page
  * Enhanced song click-to-play (instant playback on card click)
  * Improved navigation state management between sections
- June 29, 2025. Complete UI/UX overhaul with advanced features:
  * Fixed home button navigation from Library view
  * Reduced search result grid gaps for better visual density
  * Created moveable mini player icon that can be dragged anywhere on screen
  * Implemented auto-play next song functionality with YouTube-like suggestions
  * Fixed direct song click-to-play without requiring additional play button click
  * Added touch support for mobile drag functionality
  * Created expandable player overlay with minimize button
- June 29, 2025. Final polish and advanced player features:
  * Enhanced mini player with song thumbnail background and dark overlay
  * Added click-to-pause/resume functionality on mini player (short tap)
  * Implemented hold-and-drag functionality for repositioning player
  * Added dedicated expand button on mini player
  * Fixed music continuity when closing expanded player
  * Added pagination controls for search results (Previous/Next buttons)
  * Added curated song suggestions on home page with popular tracks
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```