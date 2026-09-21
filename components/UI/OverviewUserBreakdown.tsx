import React from 'react';
import { Clock, Unlink, UserCheck } from 'lucide-react';
import { formatOverviewUserBreakdown } from '../../lib/overviewUserCounts';

const COUNT_ICON_SIZE = 16;

export const OverviewUserBreakdown: React.FC<{
  approved: number;
  pending: number;
  notLinked: number;
}> = ({ approved, pending, notLinked }) => {
  return (
    <span
      className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 text-sm md:text-base"
      aria-label={formatOverviewUserBreakdown({ approved, pending, notLinked })}
    >
      <span className="inline-flex items-center gap-1 font-bold text-charcoal" title="Approved">
        <UserCheck size={COUNT_ICON_SIZE} strokeWidth={2.5} aria-hidden="true" />
        {approved}
      </span>
      <span className="inline-flex items-center gap-1 font-bold text-red-600" title="Pending">
        <Clock size={COUNT_ICON_SIZE} strokeWidth={2.5} aria-hidden="true" />
        {pending}
      </span>
      <span className="inline-flex items-center gap-1 font-bold text-neutral" title="Not linked">
        <Unlink size={COUNT_ICON_SIZE} strokeWidth={2.5} aria-hidden="true" />
        {notLinked}
      </span>
    </span>
  );
};
