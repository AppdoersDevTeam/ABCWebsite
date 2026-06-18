import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { GlowingButton } from '../../../components/UI/GlowingButton';
import { ScrollReveal } from '../../../components/UI/ScrollReveal';
import { ArrowLeft, Youtube, ExternalLink, Loader2, ArrowDownToLine, Play, Search, X, ListMusic } from 'lucide-react';
import { StyledSelect } from '../../../components/UI/StyledSelect';
import {
  fetchChannelPlaylistData,
  fetchPlaylistVideos,
  isYouTubeApiConfigured,
  type YouTubeVideo as YouTubeVideoType,
  type YouTubePlaylist,
} from '../../../lib/youtube';

const ALL_VIDEOS_PLAYLIST_ID = '__all_videos__';
const PLAYLIST_PILL_MAX_COUNT = 4;
const PLAYLIST_PILL_MAX_TITLE_LENGTH = 22;
const PLAYLIST_PILL_MAX_TOTAL_CHARS = 72;

export const Sermons = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const skipNextPlaylistFetch = useRef(false);
  const [videos, setVideos] = useState<YouTubeVideoType[]>([]);
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(ALL_VIDEOS_PLAYLIST_ID);
  const [uploadsPlaylistId, setUploadsPlaylistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [activeVideos, setActiveVideos] = useState<Set<string>>(new Set());

  const youtubeChannelUrl = 'https://www.youtube.com/@AshburtonBaptistChurchNZ';
  const channelHandle = 'AshburtonBaptistChurchNZ';

  const placeholderVideos: YouTubeVideoType[] = [
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

  const playlistOptions = useMemo(() => {
    const options: YouTubePlaylist[] = [
      {
        id: ALL_VIDEOS_PLAYLIST_ID,
        title: 'All Videos',
        description: '',
        thumbnail: '',
        videoCount: 0,
      },
    ];

    const seen = new Set<string>();
    if (uploadsPlaylistId) {
      seen.add(uploadsPlaylistId);
    }

    playlists.forEach((playlist) => {
      if (!seen.has(playlist.id)) {
        options.push(playlist);
        seen.add(playlist.id);
      }
    });

    return options;
  }, [playlists, uploadsPlaylistId]);

  const filteredVideos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return videos;

    return videos.filter((video) => video.title.toLowerCase().includes(query));
  }, [videos, searchQuery]);

  const selectedPlaylistTitle = useMemo(() => {
    return playlistOptions.find((p) => p.id === selectedPlaylistId)?.title ?? 'All Videos';
  }, [playlistOptions, selectedPlaylistId]);

  const playlistSelectOptions = useMemo(
    () => playlistOptions.map((playlist) => ({ value: playlist.id, label: playlist.title })),
    [playlistOptions]
  );

  const usePlaylistDropdown = useMemo(() => {
    if (playlistOptions.length <= 1) return false;
    if (playlistOptions.length > PLAYLIST_PILL_MAX_COUNT) return true;

    const maxTitleLength = Math.max(...playlistOptions.map((playlist) => playlist.title.length));
    const totalTitleChars = playlistOptions.reduce((sum, playlist) => sum + playlist.title.length, 0);

    return (
      maxTitleLength > PLAYLIST_PILL_MAX_TITLE_LENGTH ||
      totalTitleChars > PLAYLIST_PILL_MAX_TOTAL_CHARS
    );
  }, [playlistOptions]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        if (isYouTubeApiConfigured()) {
          try {
            const { uploadsPlaylistId: uploadsId, playlists: channelPlaylists } =
              await fetchChannelPlaylistData(channelHandle);

            setUploadsPlaylistId(uploadsId);
            setPlaylists(channelPlaylists);
            setSelectedPlaylistId(ALL_VIDEOS_PLAYLIST_ID);

            if (uploadsId) {
              const fetchedVideos = await fetchPlaylistVideos(uploadsId, 50);
              setVideos(fetchedVideos);
              skipNextPlaylistFetch.current = true;
            }
            return;
          } catch (apiError) {
            console.warn('YouTube API error:', apiError);
          }
        } else {
          console.info('YouTube API key not configured. Using placeholder videos. See YOUTUBE_API_SETUP.md for setup instructions.');
        }

        setPlaylists([]);
        setVideos(placeholderVideos);
      } catch (err) {
        console.error('Error fetching sermons:', err);
        setPlaylists([]);
        setVideos(placeholderVideos);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [channelHandle]);

  useEffect(() => {
    if (loading) return;
    if (!isYouTubeApiConfigured()) return;

    if (skipNextPlaylistFetch.current) {
      skipNextPlaylistFetch.current = false;
      return;
    }

    const playlistId =
      selectedPlaylistId === ALL_VIDEOS_PLAYLIST_ID
        ? uploadsPlaylistId
        : selectedPlaylistId;

    if (!playlistId) return;

    const loadPlaylistVideos = async () => {
      try {
        setLoadingVideos(true);
        setActiveVideos(new Set());

        const fetchedVideos = await fetchPlaylistVideos(playlistId, 50);
        setVideos(fetchedVideos);
      } catch (err) {
        console.error('Error fetching playlist videos:', err);
        setVideos([]);
      } finally {
        setLoadingVideos(false);
      }
    };

    loadPlaylistVideos();
  }, [selectedPlaylistId, uploadsPlaylistId, loading]);

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

  const handlePlayVideo = (videoId: string) => {
    setActiveVideos(prev => new Set(prev).add(videoId));
  };

  const getYouTubeThumbnail = (videoId: string, apiThumbnail: string): string => {
    if (apiThumbnail) return apiThumbnail;
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  const showFilters = !loading && (playlistOptions.length > 1 || videos.length > 0);

  return (
    <div className="space-y-0 overflow-hidden">
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
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

        <div className="container relative z-10 px-4 mx-auto pt-[224px] md:pt-[256px]">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal direction="up" delay={150}>
              <h1 className="text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-250" style={{ fontFamily: 'Kaushan Script', fontSize: '4.25rem', lineHeight: '1.2' }}>
                Sermons
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-base sm:text-lg md:text-[1.375rem] lg:text-[1.5625rem] leading-relaxed text-white text-center max-w-5xl mx-auto mb-6 transition-all duration-1000 delay-300 px-2 sm:px-0">
                <span className="block font-raleway font-normal text-center">Watch & Listen.</span>
                <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">Catch up on our latest messages</span>
                <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">and never miss a sermon.</span>
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
        </div>

        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 pulse-arrow animate-ping-pong">
          <ArrowDownToLine size={32} className="text-gold" />
        </div>
      </section>

      <section className="section-plain py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="down" delay={0}>
            <div className="text-center mb-12">
              <Youtube className="text-gold mx-auto mb-6" size={64} />
              <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal mb-4">Watch & Listen</h2>
              <p className="text-gold mt-2 text-base font-bold">Catch up on our latest messages.</p>
            </div>
          </ScrollReveal>

        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="down" delay={0}>
            <div className="glass-card rounded-[16px] p-8 md:p-12 mb-12 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group hover-lift bg-white/70">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-[#fbcb05] rounded-full text-white flex-shrink-0 shadow-lg shadow-gold/30">
                    <Youtube size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-normal text-charcoal mb-1 group-hover:text-gold transition-colors duration-300">Subscribe to Our Channel</h3>
                    <p className="text-neutral group-hover:text-charcoal transition-colors">Never miss a sermon. Subscribe for new messages every week.</p>
                  </div>
                </div>
                <a
                  href={youtubeChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gold text-charcoal px-6 py-3 rounded-full font-bold hover:bg-gold/90 transition-all duration-300 hover:scale-110 active:scale-95 hover:-translate-y-1"
                >
                  Subscribe <ExternalLink size={18} />
                </a>
              </div>
            </div>
          </ScrollReveal>

          <div className="mb-8">
            <ScrollReveal direction="down" delay={200}>
              <h2 className="text-3xl md:text-4xl font-serif font-normal text-charcoal mb-2">Recent Sermons</h2>
              <p className="text-neutral mb-8">Watch our latest messages and catch up on past sermons.</p>
            </ScrollReveal>
          </div>

          {showFilters && (
            <ScrollReveal direction="up" delay={100} className="relative z-40">
              <div className="mb-8 space-y-5">
                <div className="relative max-w-xl mx-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral" size={20} aria-hidden="true" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search sermons by title..."
                    aria-label="Search sermons"
                    className="w-full pl-12 pr-12 py-3.5 rounded-full border border-white/60 bg-white/80 text-charcoal placeholder:text-neutral/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral hover:text-charcoal transition-colors"
                      aria-label="Clear search"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {playlistOptions.length > 1 && (
                  <div className="flex justify-center max-w-xl mx-auto w-full">
                    <div className={`w-full ${usePlaylistDropdown ? '' : 'md:hidden'}`}>
                      <StyledSelect
                        id="playlist-filter"
                        label="Filter by playlist"
                        value={selectedPlaylistId}
                        options={playlistSelectOptions}
                        onChange={setSelectedPlaylistId}
                        disabled={loadingVideos}
                        icon={<ListMusic size={20} aria-hidden="true" />}
                      />
                    </div>

                    {!usePlaylistDropdown && (
                      <div className="hidden md:inline-flex flex-wrap justify-center gap-2 bg-white/60 backdrop-blur-sm rounded-full p-1.5 border border-white/50 max-w-full">
                        {playlistOptions.map((playlist) => (
                          <button
                            key={playlist.id}
                            type="button"
                            onClick={() => setSelectedPlaylistId(playlist.id)}
                            disabled={loadingVideos}
                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 disabled:opacity-60 ${
                              selectedPlaylistId === playlist.id
                                ? 'bg-gold text-white shadow-lg shadow-gold/30'
                                : 'text-charcoal/80 hover:bg-white/80 hover:text-charcoal'
                            }`}
                          >
                            {playlist.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollReveal>
          )}

          {loading && (
            <div className="text-center py-20">
              <Loader2 className="animate-spin text-gold mx-auto mb-4" size={48} />
              <p className="text-neutral">Loading sermons from YouTube...</p>
            </div>
          )}

          {!loading && loadingVideos && (
            <div className="text-center py-12">
              <Loader2 className="animate-spin text-gold mx-auto mb-4" size={40} />
              <p className="text-neutral">Loading {selectedPlaylistTitle}...</p>
            </div>
          )}

          {!loading && !loadingVideos && filteredVideos.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="text-gold/60" size={36} />
              </div>
              <p className="text-charcoal text-lg font-serif">
                {searchQuery
                  ? `No sermons match "${searchQuery}"`
                  : `No videos found in ${selectedPlaylistTitle}`}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-gold text-sm font-bold hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {!loading && !loadingVideos && filteredVideos.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video, i) => {
                const isPlaceholder = video.id.startsWith('PLACEHOLDER');
                const isActive = activeVideos.has(video.id);
                const thumbnailUrl = !isPlaceholder ? getYouTubeThumbnail(video.id, video.thumbnail) : '';

                return (
                  <ScrollReveal key={video.id || i} direction="up" delay={i * 100}>
                    <div className="glass-card rounded-[16px] border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group hover-lift bg-white/70 overflow-hidden">
                      <div className="relative w-full pb-[56.25%] bg-gray-100">
                        {isPlaceholder ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gold/10 p-6 text-center">
                            <Youtube className="text-gold mb-4" size={48} />
                            <p className="text-charcoal font-bold mb-2">Video Coming Soon</p>
                            <p className="text-neutral text-sm">Check back shortly for this sermon</p>
                          </div>
                        ) : isActive ? (
                          <iframe
                            className="absolute top-0 left-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                            title={video.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                          ></iframe>
                        ) : (
                          <button
                            onClick={() => handlePlayVideo(video.id)}
                            className="absolute inset-0 w-full h-full focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 rounded-none"
                            aria-label={`Play ${video.title}`}
                          >
                            <img
                              src={thumbnailUrl}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors duration-200">
                              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200">
                                <Play size={28} className="text-white ml-1" fill="white" />
                              </div>
                            </div>
                          </button>
                        )}
                      </div>

                      <div className="p-4 sm:p-5 bg-white/90">
                        <h3 className="text-sm sm:text-[1rem] font-serif font-normal text-charcoal mb-2 leading-snug line-clamp-3 break-words min-h-[3.75rem] group-hover:text-gold transition-colors duration-300">
                          {video.title}
                        </h3>
                        <div className="space-y-1 text-sm text-neutral group-hover:text-charcoal transition-colors">
                          <p>{formatDate(video.publishedAt)}</p>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </div>
        </div>
      </section>
    </div>
  );
};
