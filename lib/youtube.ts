// YouTube API Helper Functions
// This file provides utilities for interacting with YouTube Data API v3

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  description: string;
  channelId?: string;
  channelTitle?: string;
  duration?: string;
  viewCount?: string;
}

/**
 * Get channel ID from channel handle (e.g., @AshburtonBaptistChurchNZ)
 * @param handle - YouTube channel handle (without @)
 * @returns Channel ID or null if not found
 */
export async function getChannelIdFromHandle(handle: string): Promise<string | null> {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key not configured');
    return null;
  }

  try {
    // Method 1: Try using forHandle parameter (available in newer API versions)
    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/channels?part=id&forHandle=${handle}&key=${YOUTUBE_API_KEY}`
    );
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        return data.items[0].id;
      }
    }

    // Method 2: Fallback - Use search endpoint to find channel by handle
    const searchResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/search?part=snippet&type=channel&q=${encodeURIComponent(handle)}&key=${YOUTUBE_API_KEY}&maxResults=1`
    );
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      
      if (searchData.items && searchData.items.length > 0) {
        // Verify it's the correct channel by checking the customUrl
        const channel = searchData.items[0];
        const customUrl = channel.snippet?.customUrl;
        
        if (customUrl && (customUrl.includes(handle) || customUrl === `@${handle}`)) {
          return channel.id.channelId;
        }
        
        // If customUrl doesn't match, still return the first result (might be correct)
        return channel.id.channelId;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching channel ID:', error);
    return null;
  }
}

/**
 * Fetch videos from a YouTube channel using channel ID
 * @param channelId - YouTube channel ID
 * @param maxResults - Maximum number of videos to fetch (default: 50, max: 50)
 * @returns Array of YouTube videos
 */
export async function fetchChannelVideos(
  channelId: string,
  maxResults: number = 50
): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key not configured. Falling back to RSS feed method.');
    return [];
  }

  try {
    // First, get the uploads playlist ID from the channel
    const channelResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );

    if (!channelResponse.ok) {
      throw new Error(`Failed to fetch channel details: ${channelResponse.statusText}`);
    }

    const channelData = await channelResponse.json();
    
    if (!channelData.items || channelData.items.length === 0) {
      throw new Error('Channel not found');
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails?.relatedPlaylists?.uploads;
    
    if (!uploadsPlaylistId) {
      throw new Error('Uploads playlist not found');
    }

    // Fetch videos from the uploads playlist
    const videosResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
    );

    if (!videosResponse.ok) {
      throw new Error(`Failed to fetch videos: ${videosResponse.statusText}`);
    }

    const videosData = await videosResponse.json();

    if (!videosData.items || videosData.items.length === 0) {
      return [];
    }

    // Get additional video details (duration, view count, etc.)
    const videoIds = videosData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');
    
    const videoDetailsResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );

    const videoDetailsData = await videoDetailsResponse.json();
    const videoDetailsMap = new Map(
      videoDetailsData.items.map((video: any) => [video.id, video])
    );

    // Map the data to our YouTubeVideo interface
    const videos: YouTubeVideo[] = videosData.items.map((item: any) => {
      const videoId = item.snippet.resourceId.videoId;
      const details = videoDetailsMap.get(videoId);
      
      return {
        id: videoId,
        title: item.snippet.title,
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
        description: item.snippet.description || '',
        channelId: item.snippet.channelId,
        channelTitle: item.snippet.channelTitle,
        duration: details?.contentDetails?.duration,
        viewCount: details?.statistics?.viewCount,
      };
    });

    return videos;
  } catch (error) {
    console.error('Error fetching channel videos:', error);
    throw error;
  }
}

/**
 * Fetch videos from a YouTube channel using channel handle
 * @param handle - YouTube channel handle (with or without @)
 * @param maxResults - Maximum number of videos to fetch (default: 50)
 * @returns Array of YouTube videos
 */
export async function fetchVideosByHandle(
  handle: string,
  maxResults: number = 50
): Promise<YouTubeVideo[]> {
  // Remove @ if present
  const cleanHandle = handle.replace('@', '');
  
  // Get channel ID from handle
  const channelId = await getChannelIdFromHandle(cleanHandle);
  
  if (!channelId) {
    throw new Error(`Could not find channel ID for handle: ${handle}`);
  }

  // Fetch videos using channel ID
  return fetchChannelVideos(channelId, maxResults);
}

/**
 * Check if YouTube API is configured
 * @returns true if API key is available
 */
export function isYouTubeApiConfigured(): boolean {
  return !!YOUTUBE_API_KEY;
}

