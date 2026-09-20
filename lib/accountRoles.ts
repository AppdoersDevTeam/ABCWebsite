import type { User } from '../types';

export type AccountRoleType = 'account' | 'member' | 'group_leader';

export type AccountRole = {
  id: string;
  name: string;
  slug: string;
  role_type: AccountRoleType;
  is_system: boolean;
  sort_order: number;
};

export const ACCOUNT_ROLE_TYPE_OPTIONS: { value: AccountRoleType; label: string }[] = [
  { value: 'account', label: 'Account' },
  { value: 'member', label: 'Member' },
  { value: 'group_leader', label: 'Group Leader' },
];

export const ACCOUNT_ROLE_TYPE_LABELS: Record<AccountRoleType, string> = {
  account: 'Account',
  member: 'Member',
  group_leader: 'Group Leader',
};

export function slugifyRoleName(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function fallbackRoleSlug(user: Pick<User, 'role' | 'is_super_admin'>): string {
  if (user.is_super_admin) return 'owner';
  if (user.role === 'admin') return 'admin';
  return 'member';
}

export function roleForUser(user: User, roles: AccountRole[]): AccountRole | undefined {
  if (user.account_role_id) {
    const assigned = roles.find((role) => role.id === user.account_role_id);
    if (assigned) return assigned;
  }
  const slug = fallbackRoleSlug(user);
  return roles.find((role) => role.slug === slug);
}

export function userMatchesRoleFilter(user: User, roleId: string, roles: AccountRole[]): boolean {
  if (!roleId || roleId === 'all') return true;
  const selected = roles.find((role) => role.id === roleId);
  if (!selected) return false;
  const current = roleForUser(user, roles);
  return current?.id === selected.id;
}

export function websiteAccessForSlug(slug: string): { role: 'admin' | 'member'; is_super_admin: boolean } | null {
  if (slug === 'owner') return { role: 'admin', is_super_admin: true };
  if (slug === 'admin') return { role: 'admin', is_super_admin: false };
  if (slug === 'member') return { role: 'member', is_super_admin: false };
  return null;
}
