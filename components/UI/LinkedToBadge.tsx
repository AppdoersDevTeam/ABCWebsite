import React from 'react';
import { linkedToCaption } from '../../lib/linkedToCaption';

export const LinkedToBadge: React.FC<{ name?: string | null }> = ({ name }) => {
  const trimmed = (name || '').trim();
  return (
    <p className="truncate text-[11px] font-bold text-purple-700" title={linkedToCaption(trimmed)}>
      <span className="uppercase">Linked to</span>
      {trimmed ? ` ${trimmed}` : ''}
    </p>
  );
};
