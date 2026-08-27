import React from 'react';
import { YouTubeSermonCatalog } from '../../components/sermons/YouTubeSermonCatalog';

export const Sermons = () => {
  return (
    <div className="space-y-6 md:space-y-8 min-w-0">
      <div className="border-b border-gray-200 pb-4 md:pb-6">
        <h1 className="text-2xl md:text-4xl font-serif font-normal text-charcoal">Watch Sermons</h1>
        <p className="text-neutral mt-1 text-sm md:text-base">
          Catch up on our latest messages from church.
        </p>
      </div>

      <YouTubeSermonCatalog variant="dashboard" />
    </div>
  );
};
