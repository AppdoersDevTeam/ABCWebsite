import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/UI/PageHeader';
import { VibrantCard } from '../../../components/UI/VibrantCard';
import { ScrollReveal } from '../../../components/UI/ScrollReveal';
import { ArrowLeft, Youtube, ExternalLink, Loader2 } from 'lucide-react';

interface YouTubeVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  description: string;
}

export const Sermons = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // YouTube channel URL
  const youtubeChannelUrl = 'https://www.youtube.com/@AshburtonBaptistChurchNZ';
  const channelHandle = 'AshburtonBaptistChurchNZ';

  // Placeholder videos to show if API fails or is missing
  const placeholderVideos: YouTubeVideo[] = [
    {
      id: 'PLACEHOLDER_1',
      title: 'Sunday Service - Recent Message',
      publishedAt: new Date().toISOString(),
      thumbnail: '',
      description: 'Join us for our latest Sunday service message. Visit our YouTube channel to watch this sermon.'
    },
    {
      id: 'PLACEHOLDER_2',
      title: 'Worship & Teaching',
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      thumbnail: '',
      description: 'A time of worship and biblical teaching from our weekly service.'
    },
    {
      id: 'PLACEHOLDER_3',
      title: 'Community Message',
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      thumbnail: '',
      description: 'Connecting faith with our community and sharing God\'s love.'
    },
    {
      id: 'PLACEHOLDER_4',
      title: 'Bible Study Series',
      publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      thumbnail: '',
      description: 'Deep dive into God\'s Word with practical application for daily life.'
    },
    {
      id: 'PLACEHOLDER_5',
      title: 'Special Service',
      publishedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
      thumbnail: '',
      description: 'A special time of celebration and worship with our church family.'
    },
    {
      id: 'PLACEHOLDER_6',
      title: 'Weekly Devotion',
      publishedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      thumbnail: '',
      description: 'Encouragement and inspiration for your week ahead.'
    }
  ];

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use YouTube RSS feed - this doesn't require an API key
        // First, we need to get the channel ID from the handle
        // We'll use a CORS proxy to fetch the channel page and extract the channel ID
        
        // Method 1: Try to get channel ID from YouTube's public data
        // Using a CORS proxy service (for development - in production use your own backend)
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const channelPageUrl = encodeURIComponent(`https://www.youtube.com/@${channelHandle}`);
        
        const channelResponse = await fetch(`${proxyUrl}${channelPageUrl}`);
        const channelData = await channelResponse.json();
        
        // Parse the HTML to find channel ID
        const htmlContent = channelData.contents;
        const channelIdMatch = htmlContent.match(/"channelId":"([^"]+)"/);
        
        if (!channelIdMatch) {
          // Fallback: Try using the handle directly with RSS
          // YouTube RSS format: https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID
          // But we can also try: https://www.youtube.com/feeds/videos.xml?user=USERNAME
          throw new Error('Could not find channel ID. Using alternative method...');
        }
        
        const channelId = channelIdMatch[1];
        
        // Fetch videos from RSS feed
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
        const rssResponse = await fetch(`${proxyUrl}${encodeURIComponent(rssUrl)}`);
        const rssData = await rssResponse.json();
        
        // Parse RSS XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(rssData.contents, 'text/xml');
        const entries = xmlDoc.getElementsByTagName('entry');
        
        const fetchedVideos: YouTubeVideo[] = Array.from(entries).slice(0, 50).map((entry: any) => {
          const videoId = entry.getElementsByTagName('yt:videoId')[0]?.textContent || 
                         entry.getElementsByTagName('yt:videoId')[0]?.textContent ||
                         entry.querySelector('yt\\:videoId')?.textContent ||
                         entry.querySelector('[name="videoId"]')?.textContent ||
                         '';
          
          // Extract from video URL if needed
          const videoUrl = entry.getElementsByTagName('link')[0]?.getAttribute('href') || '';
          const extractedId = videoUrl.match(/[?&]v=([^&]+)/)?.[1] || videoId;
          
          return {
            id: extractedId || videoUrl.split('/').pop()?.split('?')[0] || '',
            title: entry.getElementsByTagName('title')[0]?.textContent || 'Untitled',
            publishedAt: entry.getElementsByTagName('published')[0]?.textContent || '',
            thumbnail: `https://img.youtube.com/vi/${extractedId || ''}/mqdefault.jpg`,
            description: entry.getElementsByTagName('media:description')[0]?.textContent || 
                        entry.getElementsByTagName('description')[0]?.textContent || ''
          };
        }).filter((video: YouTubeVideo) => video.id); // Filter out videos without IDs
        
        if (fetchedVideos.length === 0) {
          throw new Error('No videos found. The channel may not have any public videos.');
        }
        
        setVideos(fetchedVideos);
      } catch (err: any) {
        console.error('Error fetching videos:', err);
        // Fallback: Use placeholder videos if API fails
        setVideos(placeholderVideos);
        setError(null); // Don't show error, just use placeholders
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [channelHandle]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-NZ', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="pb-32">
      <PageHeader title="SERMONS" subtitle="Watch & Listen" />
      
      <div className="container mx-auto px-4 -mt-10 relative z-10 max-w-6xl">
        {/* Back Button */}
        <ScrollReveal direction="right" delay={0}>
          <Link to="/events" className="inline-flex items-center gap-2 text-gold hover:text-charcoal mb-8 transition-colors font-bold">
            <ArrowLeft size={20} />
            Back to Events
          </Link>
        </ScrollReveal>

        {/* YouTube Channel Link */}
        <ScrollReveal direction="down" delay={100}>
          <VibrantCard className="p-6 md:p-8 mb-12 bg-white/80 border-t-4 border-t-gold hover-lift">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-gold/10 p-4 rounded-full">
                  <Youtube className="text-gold" size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-charcoal mb-1">Subscribe to Our Channel</h3>
                  <p className="text-neutral">Never miss a sermon. Watch live and catch up on past messages.</p>
                </div>
              </div>
              <a
                href={youtubeChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gold text-charcoal px-6 py-3 rounded-[8px] font-bold hover:bg-gold/90 transition-colors hover-lift"
              >
                Visit Channel <ExternalLink size={18} />
              </a>
            </div>
          </VibrantCard>
        </ScrollReveal>

        {/* Sermons Grid */}
        <div className="mb-8">
          <ScrollReveal direction="down" delay={200}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-charcoal mb-2">Recent Sermons</h2>
            <p className="text-neutral mb-8">Watch our latest messages and catch up on past sermons.</p>
          </ScrollReveal>
        </div>

        {loading && (
          <div className="text-center py-20">
            <Loader2 className="animate-spin text-gold mx-auto mb-4" size={48} />
            <p className="text-neutral">Loading sermons from YouTube...</p>
          </div>
        )}

        {!loading && videos.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video, i) => {
                const isPlaceholder = video.id.startsWith('PLACEHOLDER');
                return (
                  <ScrollReveal key={video.id || i} direction="up" delay={i * 100}>
                    <VibrantCard className="bg-white/80 hover-lift overflow-hidden">
                      {/* YouTube Embed or Placeholder */}
                      <div className="relative w-full pb-[56.25%] bg-gray-100">
                        {isPlaceholder ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gold/20 to-gold/5 p-6 text-center">
                            <Youtube className="text-gold mb-4" size={48} />
                            <p className="text-charcoal font-bold mb-2">Video Coming Soon</p>
                            <p className="text-neutral text-sm">Visit our YouTube channel to watch this sermon</p>
                          </div>
                        ) : (
                          <iframe
                            className="absolute top-0 left-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${video.id}`}
                            title={video.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                          ></iframe>
                        )}
                      </div>
                    
                    {/* Video Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-serif font-bold text-charcoal mb-2 line-clamp-2 hover:text-gold transition-colors">
                        {video.title}
                      </h3>
                      <div className="space-y-1 text-sm text-neutral">
                        <p>{formatDate(video.publishedAt)}</p>
                      </div>
                      {isPlaceholder ? (
                        <a
                          href={youtubeChannelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-gold hover:text-charcoal font-bold mt-4 transition-colors text-sm"
                        >
                          Visit Channel <ExternalLink size={14} />
                        </a>
                      ) : (
                        <a
                          href={`https://www.youtube.com/watch?v=${video.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-gold hover:text-charcoal font-bold mt-4 transition-colors text-sm"
                        >
                          Watch on YouTube <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </VibrantCard>
                </ScrollReveal>
              );
              })}
            </div>

            {/* Load More / View All */}
            <ScrollReveal direction="up" delay={videos.length * 100}>
              <div className="text-center mt-12">
                <a
                  href={youtubeChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white border-2 border-gold text-charcoal px-8 py-4 rounded-[8px] font-bold hover:bg-gold hover:text-charcoal transition-all hover-lift"
                >
                  View All Sermons on YouTube <Youtube size={20} />
                </a>
              </div>
            </ScrollReveal>
          </>
        )}
      </div>
    </div>
  );
};
