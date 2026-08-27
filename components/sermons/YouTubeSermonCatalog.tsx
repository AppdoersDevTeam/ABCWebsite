import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Youtube, ExternalLink, Loader2, Play, Search, X, ListMusic } from 'lucide-react';
import { ScrollReveal } from '../UI/ScrollReveal';
import { StyledSelect } from '../UI/StyledSelect';
import { SkeletonCard } from '../UI/Skeleton';
import {
  fetchChannelPlaylistData,
  fetchPlaylistVideos,
  isYouTubeApiConfigured,
  type YouTubeVideo as YouTubeVideoType,
  type YouTubePlaylist,
} from '../../lib/youtube';

const ALL_VIDEOS_PLAYLIST_ID = '__all_videos__';
const PLAYLIST_PILL_MAX_COUNT = 4;
const PLAYLIST_PILL_MAX_TITLE_LENGTH = 22;
const PLAYLIST_PILL_MAX_TOTAL_CHARS = 72;

const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@AshburtonBaptistChurchNZ';
const CHANNEL_HANDLE = 'AshburtonBaptistChurchNZ';

const PLACEHOLDER_VIDEOS: YouTubeVideoType[] = [
  {
    id: 'PLACEHOLDER_1',
    title: 'Sunday Service - Recent Message',
    publishedAt: new Date().toISOString(),
    thumbnail: '',
    description: 'Join us for our latest Sunday service message. Visit our YouTube channel to watch this sermon.',
  },
  {
    id: 'PLACEHOLDER_2',
    title: 'Worship & Teaching',
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnail: '',
    description: 'A time of worship and biblical teaching from our weekly service.',
  },
  {
    id: 'PLACEHOLDER_3',
    title: 'Community Message',
    publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnail: '',
    description: "Connecting faith with our community and sharing God's love.",
  },
  {
    id: 'PLACEHOLDER_4',
    title: 'Bible Study Series',
    publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnail: '',
    description: "Deep dive into God's Word with practical application for daily life.",
  },
  {
    id: 'PLACEHOLDER_5',
    title: 'Special Service',
    publishedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnail: '',
    description: 'A special time of celebration and worship with our church family.',
  },
  {
    id: 'PLACEHOLDER_6',
    title: 'Weekly Devotion',
    publishedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnail: '',
    description: 'Encouragement and inspiration for your week ahead.',
  },
];

type CatalogVariant = 'public' | 'dashboard';

interface YouTubeSermonCatalogProps {
  variant?: CatalogVariant;
}

function Reveal({
  variant,
  children,
  direction = 'up',
  delay = 0,
  className = '',
}: {
  variant: CatalogVariant;
  children: React.ReactNode;
  direction?: 'up' | 'down';
  delay?: number;
  className?: string;
}) {
  if (variant === 'dashboard') {
    return <div className={className}>{children}</div>;
  }
  return (
    <ScrollReveal direction={direction} delay={delay} className={className}>
      {children}
    </ScrollReveal>
  );
}

export const YouTubeSermonCatalog = ({ variant = 'public' }: YouTubeSermonCatalogProps) => {
  const skipNextPlaylistFetch = useRef(false);
  const [videos, setVideos] = useState<YouTubeVideoType[]>([]);
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(ALL_VIDEOS_PLAYLIST_ID);
  const [uploadsPlaylistId, setUploadsPlaylistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [activeVideos, setActiveVideos] = useState<Set<string>>(new Set());

  const isDashboard = variant === 'dashboard';

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
              await fetchChannelPlaylistData(CHANNEL_HANDLE);

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
          console.info(
            'YouTube API key not configured. Using placeholder videos. See YOUTUBE_API_SETUP.md for setup instructions.'
          );
        }

        setPlaylists([]);
        setVideos(PLACEHOLDER_VIDEOS);
      } catch (err) {
        console.error('Error fetching sermons:', err);
        setPlaylists([]);
        setVideos(PLACEHOLDER_VIDEOS);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!isYouTubeApiConfigured()) return;

    if (skipNextPlaylistFetch.current) {
      skipNextPlaylistFetch.current = false;
      return;
    }

    const playlistId =
      selectedPlaylistId === ALL_VIDEOS_PLAYLIST_ID ? uploadsPlaylistId : selectedPlaylistId;

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
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const handlePlayVideo = (videoId: string) => {
    setActiveVideos((prev) => new Set(prev).add(videoId));
  };

  const getYouTubeThumbnail = (videoId: string, apiThumbnail: string): string => {
    if (apiThumbnail) return apiThumbnail;
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  const showFilters = !loading && (playlistOptions.length > 1 || videos.length > 0);

  const subscribeCardClass = isDashboard
    ? 'bg-white rounded-[8px] p-6 md:p-8 mb-8 border border-gray-200 shadow-sm'
    : 'glass-card rounded-[16px] p-8 md:p-12 mb-12 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group hover-lift bg-white/70';

  const videoCardClass = isDashboard
    ? 'bg-white rounded-[8px] border border-gray-200 shadow-sm overflow-hidden'
    : 'glass-card rounded-[16px] border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group hover-lift bg-white/70 overflow-hidden';

  const searchInputClass = isDashboard
    ? 'w-full pl-12 pr-12 py-3.5 rounded-full border border-gray-200 bg-white text-charcoal placeholder:text-neutral/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition-all'
    : 'w-full pl-12 pr-12 py-3.5 rounded-full border border-white/60 bg-white/80 text-charcoal placeholder:text-neutral/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition-all';

  if (isDashboard && loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} className="h-64" />
        ))}
      </div>
    );
  }

  return (
    <div className={isDashboard ? 'space-y-6' : 'max-w-6xl mx-auto'}>
      {!isDashboard && (
        <Reveal variant={variant} direction="down" delay={0}>
          <div className="text-center mb-12">
            <Youtube className="text-gold mx-auto mb-6" size={64} />
            <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal mb-4">
              Watch & Listen
            </h2>
            <p className="text-gold mt-2 text-base font-bold">Catch up on our latest messages.</p>
          </div>
        </Reveal>
      )}

      <Reveal variant={variant} direction="down" delay={0}>
        <div className={subscribeCardClass}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`p-4 bg-[#fbcb05] rounded-full text-white flex-shrink-0 ${
                  isDashboard ? '' : 'shadow-lg shadow-gold/30'
                }`}
              >
                <Youtube size={isDashboard ? 28 : 32} />
              </div>
              <div>
                <h3
                  className={`font-serif font-normal text-charcoal mb-1 ${
                    isDashboard ? 'text-lg md:text-xl' : 'text-2xl group-hover:text-gold transition-colors duration-300'
                  }`}
                >
                  Subscribe to Our Channel
                </h3>
                <p className={`text-neutral ${isDashboard ? 'text-sm' : 'group-hover:text-charcoal transition-colors'}`}>
                  Never miss a sermon. Subscribe for new messages every week.
                </p>
              </div>
            </div>
            <a
              href={YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 bg-gold text-charcoal px-6 py-3 rounded-full font-bold hover:bg-gold/90 transition-all ${
                isDashboard ? '' : 'duration-300 hover:scale-110 active:scale-95 hover:-translate-y-1'
              }`}
            >
              Subscribe <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </Reveal>

      <div className={isDashboard ? '' : 'mb-8'}>
        <Reveal variant={variant} direction="down" delay={200}>
          <h2
            className={`font-serif font-normal text-charcoal mb-2 ${
              isDashboard ? 'text-xl md:text-2xl' : 'text-3xl md:text-4xl'
            }`}
          >
            Recent Sermons
          </h2>
          <p className={`text-neutral ${isDashboard ? 'text-sm mb-6' : 'mb-8'}`}>
            Watch our latest messages and catch up on past sermons.
          </p>
        </Reveal>
      </div>

      {showFilters && (
        <Reveal variant={variant} direction="up" delay={100} className={isDashboard ? '' : 'relative z-40'}>
          <div className={`space-y-5 ${isDashboard ? 'mb-6' : 'mb-8'}`}>
            <div className={`relative ${isDashboard ? 'max-w-xl' : 'max-w-xl mx-auto'}`}>
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral"
                size={20}
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sermons by title..."
                aria-label="Search sermons"
                className={searchInputClass}
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
              <div className={`flex justify-center w-full ${isDashboard ? 'max-w-xl' : 'max-w-xl mx-auto'}`}>
                <div className={`w-full ${usePlaylistDropdown ? '' : 'md:hidden'}`}>
                  <StyledSelect
                    id={`playlist-filter-${variant}`}
                    label="Filter by playlist"
                    value={selectedPlaylistId}
                    options={playlistSelectOptions}
                    onChange={setSelectedPlaylistId}
                    disabled={loadingVideos}
                    icon={<ListMusic size={20} aria-hidden="true" />}
                  />
                </div>

                {!usePlaylistDropdown && (
                  <div
                    className={`hidden md:inline-flex flex-wrap justify-center gap-2 rounded-full p-1.5 max-w-full ${
                      isDashboard
                        ? 'bg-gray-50 border border-gray-200'
                        : 'bg-white/60 backdrop-blur-sm border border-white/50'
                    }`}
                  >
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
        </Reveal>
      )}

      {!isDashboard && loading && (
        <div className="text-center py-20">
          <Loader2 className="animate-spin text-gold mx-auto mb-4" size={48} />
          <p className="text-neutral">Loading sermons from YouTube...</p>
        </div>
      )}

      {!loading && loadingVideos && (
        <div className={`text-center ${isDashboard ? 'py-8' : 'py-12'}`}>
          <Loader2 className="animate-spin text-gold mx-auto mb-4" size={isDashboard ? 32 : 40} />
          <p className="text-neutral">Loading {selectedPlaylistTitle}...</p>
        </div>
      )}

      {!loading && !loadingVideos && filteredVideos.length === 0 && (
        <div className={`text-center ${isDashboard ? 'py-12' : 'py-16'}`}>
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredVideos.map((video, i) => {
            const isPlaceholder = video.id.startsWith('PLACEHOLDER');
            const isActive = activeVideos.has(video.id);
            const thumbnailUrl = !isPlaceholder ? getYouTubeThumbnail(video.id, video.thumbnail) : '';

            return (
              <Reveal key={video.id || i} variant={variant} direction="up" delay={i * 100}>
                <div className={videoCardClass}>
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
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePlayVideo(video.id)}
                        className="absolute inset-0 w-full h-full focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 rounded-none"
                        aria-label={`Play ${video.title}`}
                      >
                        <img src={thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors duration-200">
                          <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200">
                            <Play size={28} className="text-white ml-1" fill="white" />
                          </div>
                        </div>
                      </button>
                    )}
                  </div>

                  <div className={`p-4 sm:p-5 ${isDashboard ? 'bg-white' : 'bg-white/90'}`}>
                    <h3
                      className={`text-sm sm:text-[1rem] font-serif font-normal text-charcoal mb-2 leading-snug line-clamp-3 break-words min-h-[3.75rem] ${
                        isDashboard ? '' : 'group-hover:text-gold transition-colors duration-300'
                      }`}
                    >
                      {video.title}
                    </h3>
                    <div className={`space-y-1 text-sm text-neutral ${isDashboard ? '' : 'group-hover:text-charcoal transition-colors'}`}>
                      <p>{formatDate(video.publishedAt)}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
};
