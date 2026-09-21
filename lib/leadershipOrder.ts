type RoleSource = {
  name?: string | null;
  role?: string | null;
  staff_role?: string | null;
  job_roles?: Array<{ name?: string | null } | null> | null;
};

function normalisedTitles(member: RoleSource): Set<string> {
  const titles = new Set<string>();
  const add = (value?: string | null) => {
    const trimmed = (value || '').trim().toLowerCase();
    if (trimmed) titles.add(trimmed);
  };
  add(member.staff_role);
  add(member.role);
  for (const job of member.job_roles || []) {
    add(job?.name);
  }
  return titles;
}

/** 0 Senior Pastor, 1 Elder, 2 everyone else. */
export function leadershipSortRank(member: RoleSource): number {
  const titles = normalisedTitles(member);
  if (titles.has('senior pastor')) return 0;
  if (titles.has('elder')) return 1;
  return 2;
}

export function sortLeadershipTeam<T extends RoleSource>(members: T[]): T[] {
  return [...members].sort((a, b) => {
    const rankDiff = leadershipSortRank(a) - leadershipSortRank(b);
    if (rankDiff !== 0) return rankDiff;
    return (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
  });
}
