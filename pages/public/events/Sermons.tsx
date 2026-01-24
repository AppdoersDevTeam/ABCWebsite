import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { GlowingButton } from '../../../components/UI/GlowingButton';
import { ScrollReveal } from '../../../components/UI/ScrollReveal';
import { ArrowLeft, Youtube, ExternalLink, Loader2, ArrowDownToLine } from 'lucide-react';
import { fetchVideosByHandle, isYouTubeApiConfigured, type YouTubeVideo as YouTubeVideoType } from '../../../lib/youtube';

interface YouTubeVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  description: string;
}

export const Sermons = () => {
  const heroRef = useRef<HTMLDivElement>(null);
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

        // Try to use YouTube Data API v3 if configured
        if (isYouTubeApiConfigured()) {
          try {
            const fetchedVideos = await fetchVideosByHandle(channelHandle, 50);
            
            // Map the API response to our interface
            const mappedVideos: YouTubeVideo[] = fetchedVideos.map((video: YouTubeVideoType) => ({
              id: video.id,
              title: video.title,
              publishedAt: video.publishedAt,
              thumbnail: video.thumbnail,
              description: video.description
            }));
            
            if (mappedVideos.length > 0) {
              setVideos(mappedVideos);
              return; // Success, exit early
            }
          } catch (apiError: any) {
            console.warn('YouTube API error:', apiError);
            // Fall through to use placeholders
          }
        } else {
          console.info('YouTube API key not configured. Using placeholder videos. See YOUTUBE_API_SETUP.md for setup instructions.');
        }
        
        // Fallback: Use placeholder videos if API is not configured or fails
        setVideos(placeholderVideos);
        setError(null); // Don't show error, just use placeholders
      } catch (err: any) {
        console.error('Error fetching videos:', err);
        // Fallback: Use placeholder videos if everything fails
        setVideos(placeholderVideos);
        setError(null);
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
    <div className="space-y-0 overflow-hidden">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/ABC background01.png" 
            alt="Ashburton Baptist Church" 
            className="w-full h-full object-cover brightness-110 saturate-125 contrast-105"
          />
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-gray-700/45"></div>
        </div>

        {/* Hero Content */}
        <div className="container relative z-10 px-4 mx-auto pt-[224px] md:pt-[256px]">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal direction="up" delay={100}>
              <h1 className="text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-200" style={{ fontFamily: 'Inter', fontSize: '2.5rem', lineHeight: '1.2', marginTop: '63px' }}>
                Watch & Listen
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={150}>
              <h1 className="text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-250" style={{ fontFamily: 'Kaushan Script', fontSize: '4.25rem', lineHeight: '1.2' }}>
                Sermons
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-[1.5625rem] leading-6 text-white text-center max-w-5xl mx-auto mb-6 transition-all duration-1000 delay-300">
                <span className="block whitespace-nowrap font-raleway font-normal text-center">Catch up on our latest messages</span>
                <span className="block whitespace-nowrap mt-[12px] font-raleway font-normal text-center">and never miss a sermon.</span>
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={400}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24">
                <Link to="/events" className="group">
                  <GlowingButton variant="outline" size="md" className="!px-6 !py-[14px] !border-gold !bg-gold/20 !text-white hover:!bg-gold hover:!text-white !rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 hover:!border-gold active:scale-95 hover:-translate-y-1 !normal-case">
                    <ArrowLeft size={18} className="mr-2 text-gold transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:h-5 group-hover:w-5 group-hover:translate-x-1 group-hover:text-white" />
                    <span className="text-white font-normal text-base leading-6 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:font-semibold group-hover:tracking-wider">Back to Events</span>
                  </GlowingButton>
                </Link>
              </div>
            </ScrollReveal>
          </div>
          
          {/* Pulsing Down Arrow */}
          <div className="absolute bottom-[29px] left-1/2 -translate-x-1/2 z-20 pulse-arrow animate-ping-pong">
            <ArrowDownToLine size={32} className="text-gold" />
          </div>
        </div>
      </section>
      
      <section className="section-gradient-soft py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="down" delay={0}>
            <div className="text-center mb-12">
              <Youtube className="text-gold mx-auto mb-6" size={64} />
              <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal mb-4">Watch & Listen</h2>
              <p className="text-gold mt-2 text-base font-bold">Catch up on our latest messages.</p>
            </div>
          </ScrollReveal>
        <div className="max-w-6xl mx-auto">
          {/* YouTube Channel Link */}
          <ScrollReveal direction="down" delay={0}>
            <div className="glass-card rounded-[16px] p-8 md:p-12 mb-12 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group hover-lift bg-white/70">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-[#fbcb05] rounded-full text-white flex-shrink-0 shadow-lg shadow-gold/30">
                    <Youtube size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-normal text-charcoal mb-1 group-hover:text-gold transition-colors duration-300">Subscribe to Our Channel</h3>
                    <p className="text-neutral group-hover:text-charcoal transition-colors">Never miss a sermon. Watch live and catch up on past messages.</p>
                  </div>
                </div>
                <a
                  href={youtubeChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gold text-charcoal px-6 py-3 rounded-full font-bold hover:bg-gold/90 transition-all duration-300 hover:scale-110 active:scale-95 hover:-translate-y-1"
                >
                  Visit Channel <ExternalLink size={18} />
                </a>
              </div>
            </div>
          </ScrollReveal>

          {/* Sermons Grid */}
          <div className="mb-8">
            <ScrollReveal direction="down" delay={200}>
              <h2 className="text-3xl md:text-4xl font-serif font-normal text-charcoal mb-2">Recent Sermons</h2>
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
                      <div className="glass-card rounded-[16px] border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group hover-lift bg-white/70 overflow-hidden">
                        {/* YouTube Embed or Placeholder */}
                        <div className="relative w-full pb-[56.25%] bg-gray-100">
                          {isPlaceholder ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gold/10 p-6 text-center">
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
                          <h3 className="text-xl font-serif font-normal text-charcoal mb-2 line-clamp-2 group-hover:text-gold transition-colors duration-300">
                            {video.title}
                          </h3>
                          <div className="space-y-1 text-sm text-neutral group-hover:text-charcoal transition-colors">
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
                      </div>
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
                    className="inline-flex items-center gap-2 bg-white border-2 border-gold text-charcoal px-8 py-4 rounded-full font-bold hover:bg-gold hover:text-charcoal transition-all duration-300 hover:scale-110 active:scale-95 hover:-translate-y-1 group/link"
                  >
                    <span className="transition-all duration-300 group-hover/link:tracking-wider">View All Sermons on YouTube</span>
                    <Youtube size={20} className="transition-all duration-500 group-hover/link:scale-125" />
                  </a>
                </div>
              </ScrollReveal>
            </>
          )}
        </div>
        </div>
      </section>
    </div>
  );
};
