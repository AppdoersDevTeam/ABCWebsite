import React from 'react';
import { Clock, Unlink, UserCheck } from 'lucide-react';
import { formatOverviewUserBreakdown } from '../../lib/overviewUserCounts';

export const OverviewUserBreakdown: React.FC<{
  approved: number;
  pending: number;
  notLinked: number;
}> = ({ approved, pending, notLinked }) => {
  return (
    <span className="flex flex-col gap-1.5" aria-label={formatOverviewUserBreakdown({ approved, pending, notLinked })}>
      <span className="inline-flex items-center gap-1.5 font-bold text-green-600">
        <UserCheck size={16} strokeWidth={2.5} aria-hidden="true" />
        Approved {approved}
      </span>
      <span className="inline-flex items-center gap-1.5 font-bold text-red-600">
        <Clock size={16} strokeWidth={2.5} aria-hidden="true" />
        Pending {pending}
      </span>
      <span className="inline-flex items-center gap-1.5 font-bold text-purple-700">
        <Unlink size={16} strokeWidth={2.5} aria-hidden="true" />
        Not linked {notLinked}
      </span>
    </span>
  );
};
