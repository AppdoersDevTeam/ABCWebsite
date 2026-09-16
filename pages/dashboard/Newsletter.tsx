import React, { useState, useEffect } from 'react';
import { FileText, Eye, Newspaper } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { DocumentReaderPanel } from '../../components/UI/DocumentReaderPanel';
import { NewsletterMonthArchive } from '../../components/UI/NewsletterMonthArchive';
import { Newsletter as NewsletterType } from '../../types';
import { SkeletonPageHeader, SkeletonCard } from '../../components/UI/Skeleton';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';
import { formatWeekDate, resolveNewsletterWeekDate } from '../../lib/dateUtils';
import { fetchNewslettersOrdered } from '../../lib/newsletters';

export const Newsletter = () => {
  const [searchParams] = useSearchParams();
  const [newsletters, setNewsletters] = useState<NewsletterType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewing, setViewing] = useState<NewsletterType | null>(null);

  useEffect(() => {
    fetchNewsletters();
  }, []);

  useEffect(() => {
    const openId = searchParams.get('id');
    if (!openId || newsletters.length === 0) return;
    const match = newsletters.find((item) => item.id === openId);
    if (match) setViewing(match);
  }, [searchParams, newsletters]);

  useEffect(() => {
    if (viewing) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [viewing]);

  const fetchNewsletters = async () => {
    try {
      const data = await fetchNewslettersOrdered();
      setNewsletters(data);
    } catch (error) {
      console.error('Error fetching newsletters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 md:space-y-8">
        <SkeletonPageHeader />
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          <div className="md:col-span-2">
            <SkeletonCard className="h-72 md:h-96" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} className="h-20" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const latestNewsletter = newsletters[0];
  const latestWeekDate = latestNewsletter ? resolveNewsletterWeekDate(latestNewsletter) : '';

  return (
    <div className="space-y-6 md:space-y-8 min-w-0">
      <AdminPageHeader
        title="Newsletters"
        subtitle="Church life updates."
        icon={<Newspaper size={28} />}
      />

      {viewing && (
        <div className="md:hidden">
          <DocumentReaderPanel
            label="Reading"
            title={viewing.title}
            meta={`Week of ${formatWeekDate(resolveNewsletterWeekDate(viewing))}`}
            pdfUrl={viewing.pdf_url}
            pdfTitle={viewing.title}
            onClose={() => setViewing(null)}
          />
        </div>
      )}

      <div className={`grid md:grid-cols-3 gap-4 md:gap-6 ${viewing ? 'hidden md:grid' : ''}`}>
        <div className="md:col-span-2 min-w-0">
          <div className="bg-gold p-1 rounded-t-[8px] w-fit">
            <span className="text-charcoal font-bold text-xs px-4 uppercase tracking-widest">Latest</span>
          </div>
          <div className="glass-card p-5 sm:p-8 md:p-16 text-center rounded-[8px] rounded-tl-none border-t-0 bg-white shadow-lg">
            <FileText className="text-gold mx-auto mb-4 md:mb-6 w-12 h-12 sm:w-16 sm:h-16" />
            {latestNewsletter ? (
              <>
                <h2 className="text-xl sm:text-2xl md:text-4xl font-serif text-charcoal mb-2 font-normal break-words">
                  {latestNewsletter.title}
                </h2>
                {latestWeekDate && (
                  <p className="text-neutral mb-6 md:mb-8 font-medium text-sm md:text-base">
                    Week of {formatWeekDate(latestWeekDate)}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setViewing(latestNewsletter)}
                  className="bg-charcoal text-white px-6 py-3 rounded-[4px] font-bold uppercase tracking-wider hover:bg-gold hover:text-charcoal transition-colors shadow-lg w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Eye size={18} />
                  Read Online
                </button>
              </>
            ) : (
              <p className="text-neutral">No newsletters available yet</p>
            )}
          </div>
        </div>

        <div className="min-w-0 flex flex-col">
          <h3 className="text-charcoal font-bold uppercase tracking-widest text-xs mb-4 shrink-0">Archive</h3>
          <NewsletterMonthArchive
            items={newsletters.slice(1)}
            emptyMessage="No archived newsletters"
            renderItem={(newsletter) => {
              const weekDate = resolveNewsletterWeekDate(newsletter);
              return (
                <button
                  key={newsletter.id}
                  type="button"
                  onClick={() => setViewing(newsletter)}
                  className={`w-full bg-white border p-3 sm:p-4 flex justify-between items-center gap-3 cursor-pointer rounded-[4px] transition-all group min-w-0 text-left min-h-[44px] ${
                    viewing?.id === newsletter.id
                      ? 'border-gold shadow-md'
                      : 'border-gray-200 hover:shadow-md hover:border-gold'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block text-neutral font-medium group-hover:text-charcoal truncate">
                      {newsletter.title}
                    </span>
                    {weekDate && (
                      <span className="block text-xs text-neutral/80">Week of {formatWeekDate(weekDate)}</span>
                    )}
                  </span>
                  <Eye size={16} className="text-neutral group-hover:text-gold shrink-0" />
                </button>
              );
            }}
          />
        </div>
      </div>

      {viewing && (
        <div className="hidden md:block">
          <DocumentReaderPanel
            label="Reading"
            title={viewing.title}
            meta={`Week of ${formatWeekDate(resolveNewsletterWeekDate(viewing))}`}
            pdfUrl={viewing.pdf_url}
            pdfTitle={viewing.title}
            onClose={() => setViewing(null)}
          />
        </div>
      )}
    </div>
  );
};
