import React from 'react';
import { Clock, Unlink, UserCheck } from 'lucide-react';
import { formatOverviewUserBreakdown } from '../../lib/overviewUserCounts';

export const OverviewUserBreakdown: React.FC<{
  approved: number;
  pending: number;
  notLinked: number;
}> = ({ approved, pending, notLinked }) => {
  return (
    <span
      className="flex flex-wrap items-center gap-x-3 gap-y-1"
      aria-label={formatOverviewUserBreakdown({ approved, pending, notLinked })}
    >
      <span className="inline-flex items-center gap-1 font-bold text-green-600" title="Approved">
        <UserCheck size={16} strokeWidth={2.5} aria-hidden="true" />
        {approved}
      </span>
      <span className="inline-flex items-center gap-1 font-bold text-red-600" title="Pending">
        <Clock size={16} strokeWidth={2.5} aria-hidden="true" />
        {pending}
      </span>
      <span className="inline-flex items-center gap-1 font-bold text-purple-700" title="Not linked">
        <Unlink size={16} strokeWidth={2.5} aria-hidden="true" />
        {notLinked}
      </span>
    </span>
  );
};
