import type { TeamMember } from '../types';

export function inferProfileType(m: TeamMember): 'staff' | 'attendee' | 'member' {
  if (m.profile_type) return m.profile_type;
  const r = m.role?.toLowerCase().trim();
  if (r === 'attendee') return 'attendee';
  if (r === 'member') return 'member';
  return 'staff';
}

/** Label shown under the name (job title for staff; Member / Attendee otherwise). */
export function getDisplayRole(m: TeamMember): string {
  const pt = inferProfileType(m);
  if (pt === 'staff') return (m.staff_role || m.role || '').trim() || 'Staff';
  if (pt === 'member') return 'Member';
  return 'Attendee';
}

export function buildStoredRole(
  profileType: 'staff' | 'attendee' | 'member',
  staffRole: string
): string {
  if (profileType === 'member') return 'Member';
  if (profileType === 'attendee') return 'Attendee';
  return staffRole.trim() || 'Staff';
}
