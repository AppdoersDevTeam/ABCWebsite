import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, FileText } from 'lucide-react';
import { RosterImage } from '../../types';
import { supabase } from '../../lib/supabase';
import { SkeletonPageHeader } from '../../components/UI/Skeleton';

export const Roster = () => {
  const [rosterImages, setRosterImages] = useState<RosterImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchRosterImages();
  }, []);

  useEffect(() => {
    // Set current index to most recent date when PDFs load
    if (rosterImages.length > 0 && currentIndex === 0) {
      setCurrentIndex(0); // Already sorted by date DESC, so index 0 is most recent
    }
  }, [rosterImages]);

  const fetchRosterImages = async () => {
    try {
      const { data, error } = await supabase
        .from('roster_images')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setRosterImages(data || []);
    } catch (error) {
      console.error('Error fetching roster PDFs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < rosterImages.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SkeletonPageHeader />
        <div className="bg-white border border-gray-100 rounded-[8px] p-8">
          <div className="h-96 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (rosterImages.length === 0) {
    return (
      <div className="space-y-8">
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-4xl font-serif font-normal text-charcoal">Roster</h1>
          <p className="text-neutral mt-1">View roster schedules.</p>
        </div>
        <div className="text-center py-12 bg-white border border-gray-100 rounded-[8px]">
          <FileText size={48} className="mx-auto text-neutral mb-4" />
          <p className="text-neutral text-lg mb-2">No roster PDFs available</p>
          <p className="text-neutral text-sm">Check back later for updated rosters</p>
        </div>
      </div>
    );
  }

  const currentRoster = rosterImages[currentIndex];

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-4xl font-serif font-normal text-charcoal">Roster</h1>
        <p className="text-neutral mt-1">View roster schedules.</p>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-white p-4 rounded-[8px] border border-gray-200 shadow-sm">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={`p-2 rounded-full text-charcoal transition-colors ${
            currentIndex === 0
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:bg-gray-100'
          }`}
        >
          <ChevronLeft size={24} />
        </button>
        <div className="text-center flex-1">
          <div className="flex items-center justify-center gap-2 text-gold mb-1">
            <Calendar size={18} />
            <span className="text-sm font-bold uppercase tracking-wider">
              {formatDateShort(currentRoster.date)}
            </span>
          </div>
          <h3 className="font-bold text-xl text-charcoal">{formatDate(currentRoster.date)}</h3>
          {rosterImages.length > 1 && (
            <p className="text-xs text-neutral mt-1">
              {currentIndex + 1} of {rosterImages.length}
            </p>
          )}
        </div>
        <button
          onClick={handleNext}
          disabled={currentIndex === rosterImages.length - 1}
          className={`p-2 rounded-full text-charcoal transition-colors ${
            currentIndex === rosterImages.length - 1
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:bg-gray-100'
          }`}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Roster PDF Display */}
      <div className="bg-white border border-gray-100 rounded-[8px] p-6 shadow-sm">
        <div className="relative w-full">
          <iframe
            src={currentRoster.pdf_url}
            className="w-full h-[800px] rounded-[4px] border border-gray-200"
            title={`Roster for ${formatDateShort(currentRoster.date)}`}
          />
        </div>
        <div className="mt-4 text-center">
          <a
            href={currentRoster.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:text-charcoal font-bold text-sm transition-colors inline-flex items-center gap-2"
          >
            <FileText size={16} />
            Open PDF in new tab
          </a>
        </div>
      </div>

      {/* Date List (Optional - shows all available dates) */}
      {rosterImages.length > 1 && (
        <div className="bg-white border border-gray-100 rounded-[8px] p-4">
          <p className="text-sm font-bold text-charcoal mb-3">Available Rosters:</p>
          <div className="flex flex-wrap gap-2">
            {rosterImages.map((roster, index) => (
              <button
                key={roster.id}
                onClick={() => setCurrentIndex(index)}
                className={`px-3 py-1 rounded-[4px] text-sm font-bold transition-colors ${
                  index === currentIndex
                    ? 'bg-gold text-white'
                    : 'bg-gray-100 text-charcoal hover:bg-gray-200'
                }`}
              >
                {formatDateShort(roster.date)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
