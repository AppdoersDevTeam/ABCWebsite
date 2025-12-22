import React from 'react';

// Base skeleton animation class
const shimmerClass = "animate-pulse bg-gray-200 rounded";

// Skeleton Text Component
interface SkeletonTextProps {
  lines?: number;
  className?: string;
  width?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({ 
  lines = 1, 
  className = '', 
  width = '100%' 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={shimmerClass}
          style={{
            height: '1rem',
            width: i === lines - 1 ? (width === '100%' ? '80%' : width) : width,
          }}
        />
      ))}
    </div>
  );
};

// Skeleton Card Component
interface SkeletonCardProps {
  className?: string;
  showIcon?: boolean;
  showFooter?: boolean;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  className = '', 
  showIcon = true,
  showFooter = true 
}) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-[8px] p-6 shadow-sm ${className}`}>
      {showIcon && (
        <div className={`${shimmerClass} w-16 h-16 rounded-full mb-4`} />
      )}
      <div className="space-y-3">
        <div className={`${shimmerClass} h-6 w-3/4`} />
        <div className={`${shimmerClass} h-4 w-full`} />
        <div className={`${shimmerClass} h-4 w-5/6`} />
      </div>
      {showFooter && (
        <div className={`${shimmerClass} h-4 w-1/3 mt-4 pt-4 border-t border-gray-100`} />
      )}
    </div>
  );
};

// Skeleton List Item Component
interface SkeletonListItemProps {
  showAvatar?: boolean;
  showActions?: boolean;
  className?: string;
}

export const SkeletonListItem: React.FC<SkeletonListItemProps> = ({ 
  showAvatar = true,
  showActions = false,
  className = '' 
}) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-[8px] p-6 ${className}`}>
      <div className="flex items-start gap-4">
        {showAvatar && (
          <div className={`${shimmerClass} w-12 h-12 rounded-full flex-shrink-0`} />
        )}
        <div className="flex-1 space-y-3">
          <div className={`${shimmerClass} h-5 w-1/3`} />
          <div className={`${shimmerClass} h-4 w-full`} />
          <div className={`${shimmerClass} h-4 w-2/3`} />
        </div>
        {showActions && (
          <div className="flex gap-2 flex-shrink-0">
            <div className={`${shimmerClass} w-20 h-10 rounded-[4px]`} />
            <div className={`${shimmerClass} w-20 h-10 rounded-[4px]`} />
          </div>
        )}
      </div>
    </div>
  );
};

// Skeleton Stats Card Component
export const SkeletonStatsCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-[8px] p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className={`${shimmerClass} h-4 w-24`} />
          <div className={`${shimmerClass} h-8 w-16`} />
        </div>
        <div className={`${shimmerClass} w-12 h-12 rounded-full`} />
      </div>
    </div>
  );
};

// Skeleton Grid Component
interface SkeletonGridProps {
  count?: number;
  columns?: 2 | 3 | 4;
  renderItem: (index: number) => React.ReactNode;
  className?: string;
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({ 
  count = 3, 
  columns = 3,
  renderItem,
  className = '' 
}) => {
  const gridCols = columns === 2 ? 'md:grid-cols-2' : columns === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3';
  return (
    <div className={`grid ${gridCols} gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <React.Fragment key={i}>{renderItem(i)}</React.Fragment>
      ))}
    </div>
  );
};

// Skeleton Page Header Component
export const SkeletonPageHeader: React.FC = () => {
  return (
    <div className="flex justify-between items-end border-b border-gray-200 pb-6">
      <div className="space-y-2">
        <div className={`${shimmerClass} h-10 w-64`} />
        <div className={`${shimmerClass} h-5 w-96`} />
      </div>
      <div className={`${shimmerClass} w-32 h-8 rounded-full`} />
    </div>
  );
};

// Skeleton Event Card Component
export const SkeletonEventCard: React.FC = () => {
  return (
    <div className="flex items-center p-6 bg-white border border-gray-100 rounded-[8px]">
      <div className="flex-shrink-0 w-20 text-center border-r border-gray-100 pr-6 mr-6">
        <div className={`${shimmerClass} h-4 w-12 mb-2 mx-auto`} />
        <div className={`${shimmerClass} h-8 w-12 mx-auto`} />
      </div>
      <div className="flex-1 space-y-2">
        <div className={`${shimmerClass} h-6 w-2/3`} />
        <div className={`${shimmerClass} h-4 w-1/2`} />
        <div className={`${shimmerClass} h-4 w-full`} />
      </div>
    </div>
  );
};

// Skeleton Prayer Request Card Component
export const SkeletonPrayerCard: React.FC = () => {
  return (
    <div className="bg-white border border-gray-100 rounded-[8px] p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <div className={`${shimmerClass} w-10 h-10 rounded-full flex-shrink-0`} />
        <div className="space-y-2 flex-1">
          <div className={`${shimmerClass} h-5 w-32`} />
          <div className={`${shimmerClass} h-3 w-24`} />
        </div>
      </div>
      <div className="space-y-2 mb-6 pl-12">
        <div className={`${shimmerClass} h-4 w-full`} />
        <div className={`${shimmerClass} h-4 w-full`} />
        <div className={`${shimmerClass} h-4 w-3/4`} />
      </div>
      <div className="flex items-center space-x-6 border-t border-gray-100 pt-4 pl-12">
        <div className={`${shimmerClass} h-4 w-32`} />
        <div className={`${shimmerClass} h-4 w-28`} />
      </div>
    </div>
  );
};

// Skeleton User Card Component
export const SkeletonUserCard: React.FC = () => {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-[8px] p-6">
      <div className="flex items-start gap-4">
        <div className={`${shimmerClass} w-12 h-12 rounded-full flex-shrink-0`} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className={`${shimmerClass} h-6 w-32`} />
            <div className={`${shimmerClass} h-5 w-16 rounded`} />
          </div>
          <div className={`${shimmerClass} h-4 w-48`} />
          <div className={`${shimmerClass} h-4 w-40`} />
          <div className={`${shimmerClass} h-3 w-32`} />
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <div className={`${shimmerClass} w-24 h-10 rounded-[4px]`} />
          <div className={`${shimmerClass} w-24 h-10 rounded-[4px]`} />
        </div>
      </div>
    </div>
  );
};

// Skeleton Table Row Component
export const SkeletonTableRow: React.FC<{ columns?: number }> = ({ columns = 4 }) => {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className={`${shimmerClass} h-4 w-full`} />
        </td>
      ))}
    </tr>
  );
};

