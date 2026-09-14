import React from 'react';
import { Youtube } from 'lucide-react';
import { YouTubeSermonCatalog } from '../../components/sermons/YouTubeSermonCatalog';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';

export const Sermons = () => {
  return (
    <div className="space-y-6 md:space-y-8 min-w-0">
      <AdminPageHeader
        title="Sermons"
        subtitle="Catch up on our latest messages from church."
        icon={<Youtube size={28} />}
      />

      <YouTubeSermonCatalog variant="dashboard" />
    </div>
  );
};
