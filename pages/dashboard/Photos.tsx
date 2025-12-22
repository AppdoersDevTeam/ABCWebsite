import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Photo } from '../../types';
import { SkeletonPageHeader, SkeletonCard } from '../../components/UI/Skeleton';

export const Photos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SkeletonPageHeader />
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="space-y-8">
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-4xl font-serif font-bold text-charcoal">Gallery</h1>
          <p className="text-neutral mt-1">Moments captured.</p>
        </div>
        <div className="text-center py-12">
          <p className="text-neutral">No photos available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-4xl font-serif font-bold text-charcoal">Gallery</h1>
        <p className="text-neutral mt-1">Moments captured.</p>
      </div>

      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative break-inside-avoid rounded-[8px] overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-shadow">
            <img 
              src={photo.url} 
              alt={photo.title || 'Gallery photo'} 
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gold/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-multiply"></div>
            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white font-serif italic text-lg border-b border-white pb-1">View</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};