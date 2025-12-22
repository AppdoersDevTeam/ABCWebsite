# YouTube API Setup Guide

This guide will help you set up YouTube Data API v3 for embedding videos on your website.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter a project name (e.g., "Ashburton Baptist Church Website")
5. Click **"Create"**

## Step 2: Enable YouTube Data API v3

1. In your Google Cloud project, go to **"APIs & Services"** > **"Library"**
2. Search for **"YouTube Data API v3"**
3. Click on it and then click **"Enable"**

## Step 3: Create API Credentials

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"API Key"**
4. Your API key will be created and displayed
5. **Important:** Copy this key immediately - you won't be able to see it again!

## Step 4: Restrict Your API Key (Recommended for Security)

1. Click on your newly created API key to edit it
2. Under **"API restrictions"**, select **"Restrict key"**
3. Under **"Select APIs"**, choose **"YouTube Data API v3"**
4. Under **"Application restrictions"**, you can optionally:
   - Select **"HTTP referrers (web sites)"**
   - Add your website URLs:
     - `http://localhost:3000/*` (for development)
     - `https://www.ashburtonbaptist.co.nz/*` (for production)
     - `https://ashburtonbaptistchurch.vercel.app/*` (if using Vercel)
5. Click **"Save"**

## Step 5: Add API Key to Your Project

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add your YouTube API key:

```env
VITE_YOUTUBE_API_KEY=your_api_key_here
```

**Important:** 
- Replace `your_api_key_here` with your actual API key
- Never commit `.env.local` to version control (it should already be in `.gitignore`)
- The `VITE_` prefix is required for Vite to expose the variable to your frontend code

## Step 6: Update Your Code (Optional)

The current implementation uses RSS feeds which don't require an API key. If you want to use the YouTube Data API v3 for better reliability and more features, you can update the `Sermons.tsx` component to use the API.

### Benefits of Using YouTube Data API v3:
- More reliable than RSS feeds
- Better error handling
- Access to more video metadata
- No CORS proxy needed
- Official API support

### Current Implementation:
- Uses RSS feeds (no API key needed)
- Uses CORS proxy (may have rate limits)
- Works but less reliable

## Step 7: Test Your API Key

You can test your API key by making a request to:
```
https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=YOUR_CHANNEL_ID&type=video&key=YOUR_API_KEY
```

Replace:
- `YOUR_CHANNEL_ID` with your YouTube channel ID
- `YOUR_API_KEY` with your API key

## API Quota Limits

YouTube Data API v3 has default quotas:
- **10,000 units per day** (free tier)
- Each API call costs different units:
  - Search: 100 units
  - Videos list: 1 unit
  - Channels list: 1 unit

For most church websites, the free tier is sufficient. If you need more, you can request a quota increase in Google Cloud Console.

## Security Best Practices

1. ✅ **Restrict your API key** to only YouTube Data API v3
2. ✅ **Add HTTP referrer restrictions** to limit where the key can be used
3. ✅ **Never expose your API key** in client-side code if possible (use a backend proxy for production)
4. ✅ **Rotate your API key** if it's ever exposed
5. ✅ **Monitor usage** in Google Cloud Console to detect abuse

## Troubleshooting

### "API key not valid"
- Check that you've enabled YouTube Data API v3
- Verify the API key is correct in `.env.local`
- Make sure the key isn't restricted to the wrong APIs

### "Quota exceeded"
- You've hit the daily limit (10,000 units)
- Wait 24 hours or request a quota increase
- Consider caching video data to reduce API calls

### "Access denied"
- Check HTTP referrer restrictions match your website URL
- Verify the API key restrictions allow YouTube Data API v3

## Next Steps

Once your API key is set up, you can:
1. Update `Sermons.tsx` to use the YouTube Data API v3 instead of RSS feeds
2. Add more features like video search, playlists, or channel statistics
3. Implement caching to reduce API calls and improve performance

## Code Example: Using the YouTube API

A helper library has been created at `lib/youtube.ts` that you can use. Here's how to update your `Sermons.tsx` component:

```typescript
import { fetchVideosByHandle, isYouTubeApiConfigured } from '../../../lib/youtube';

// In your component:
useEffect(() => {
  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if API is configured
      if (isYouTubeApiConfigured()) {
        // Use YouTube Data API v3
        const fetchedVideos = await fetchVideosByHandle(channelHandle, 50);
        setVideos(fetchedVideos);
      } else {
        // Fallback to RSS feed method (current implementation)
        // ... existing RSS feed code ...
      }
    } catch (err: any) {
      console.error('Error fetching videos:', err);
      setVideos(placeholderVideos);
      setError('Failed to load videos. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  fetchVideos();
}, [channelHandle]);
```

The helper functions automatically handle:
- Getting channel ID from handle
- Fetching video metadata
- Error handling
- API quota management

