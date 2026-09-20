export function formatOverviewUserBreakdown(counts: {
  approved: number;
  pending: number;
  notLinked: number;
}): string {
  return `Approved ${counts.approved} · Pending ${counts.pending} · Not linked ${counts.notLinked}`;
}
