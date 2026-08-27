import React, { useState, useEffect } from 'react';
import { FileText, Eye, X } from 'lucide-react';
import { EmbeddedPdfViewer } from '../../components/UI/EmbeddedPdfViewer';
import { supabase } from '../../lib/supabase';
import { Newsletter as NewsletterType } from '../../types';
import { SkeletonPageHeader, SkeletonCard } from '../../components/UI/Skeleton';

export const Newsletter = () => {
  const [newsletters, setNewsletters] = useState<NewsletterType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewing, setViewing] = useState<NewsletterType | null>(null);

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNewsletters(data || []);
    } catch (error) {
      console.error('Error fetching newsletters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SkeletonPageHeader />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <SkeletonCard className="h-96" />
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

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-2xl md:text-4xl font-serif font-normal text-charcoal">Newsletters</h1>
        <p className="text-neutral mt-1">Church life updates.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-gold p-1 rounded-t-[8px] w-fit">
            <span className="text-charcoal font-bold text-xs px-4 uppercase tracking-widest">Latest</span>
          </div>
          <div className="glass-card p-8 md:p-16 text-center rounded-[8px] rounded-tl-none border-t-0 bg-white shadow-lg">
            <FileText size={64} className="text-gold mx-auto mb-6" />
            {latestNewsletter ? (
              <>
                <h2 className="text-3xl md:text-4xl font-serif text-charcoal mb-2 font-normal">
                  {latestNewsletter.title}
                </h2>
                <p className="text-neutral mb-8 font-medium">
                  {latestNewsletter.month} {latestNewsletter.year}
                </p>
                <button
                  type="button"
                  onClick={() => setViewing(latestNewsletter)}
                  className="bg-charcoal text-white px-8 py-3 rounded-[4px] font-bold uppercase tracking-wider hover:bg-gold hover:text-charcoal transition-colors shadow-lg w-full md:w-auto inline-flex items-center justify-center gap-2"
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

        <div>
          <h3 className="text-charcoal font-bold uppercase tracking-widest text-xs mb-4">Archive</h3>
          {newsletters.length === 0 ? (
            <p className="text-neutral text-sm">No archived newsletters</p>
          ) : (
            <div className="space-y-3">
              {newsletters.slice(1).map((newsletter) => (
                <button
                  key={newsletter.id}
                  type="button"
                  onClick={() => setViewing(newsletter)}
                  className={`w-full bg-white border p-4 flex justify-between items-center gap-3 cursor-pointer rounded-[4px] transition-all group min-w-0 text-left ${
                    viewing?.id === newsletter.id
                      ? 'border-gold shadow-md'
                      : 'border-gray-200 hover:shadow-md hover:border-gold'
                  }`}
                >
                  <span className="text-neutral font-medium group-hover:text-charcoal min-w-0 truncate">
                    {newsletter.title}
                  </span>
                  <Eye size={16} className="text-neutral group-hover:text-gold shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {viewing && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-charcoal font-bold uppercase tracking-widest text-xs">Reading</h3>
              <p className="text-lg font-serif text-charcoal">{viewing.title}</p>
            </div>
            <button
              type="button"
              onClick={() => setViewing(null)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-bold text-neutral hover:text-charcoal border border-gray-200 rounded-[4px] hover:bg-gray-50"
            >
              <X size={16} />
              Close
            </button>
          </div>
          <EmbeddedPdfViewer key={viewing.pdf_url} src={viewing.pdf_url} title={viewing.title} />
        </div>
      )}
    </div>
  );
};
