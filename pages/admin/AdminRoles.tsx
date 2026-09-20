import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Building2, MoreVertical, Pencil, Plus, Shield, Trash2, User as UserIcon, UsersRound } from 'lucide-react';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';
import { Modal } from '../../components/UI/Modal';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { supabase } from '../../lib/supabase';
import { appConfirm } from '../../lib/appDialog';
import { logAuditEventSafe } from '../../lib/auditLog';
import {
  ACCOUNT_ROLE_TYPE_LABELS,
  ACCOUNT_ROLE_TYPE_OPTIONS,
  slugifyRoleName,
  type AccountRole,
  type AccountRoleType,
} from '../../lib/accountRoles';
import { filterUsersForAdminView } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../types';

type RoleForm = {
  name: string;
  role_type: AccountRoleType;
};

const EMPTY_FORM: RoleForm = { name: '', role_type: 'account' };

function RoleTypeIcon({ roleType }: { roleType: AccountRoleType }) {
  if (roleType === 'member') return <UserIcon size={16} className="text-neutral" />;
  if (roleType === 'group_leader') return <UsersRound size={16} className="text-neutral" />;
  return <Building2 size={16} className="text-neutral" />;
}

export const AdminRoles = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AccountRole[]>([]);
  const [userCounts, setUserCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [nameFilter, setNameFilter] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [menuRoleId, setMenuRoleId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AccountRole | null>(null);
  const [form, setForm] = useState<RoleForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const [{ data: roleRows, error: roleError }, { data: userRows, error: userError }] = await Promise.all([
        supabase.from('account_roles').select('id,name,slug,role_type,is_system,sort_order').order('sort_order'),
        supabase.from('users').select('id,email,role,is_super_admin,account_role_id'),
      ]);
      if (roleError) throw roleError;
      if (userError) throw userError;

      const list = (roleRows || []) as AccountRole[];
      setRoles(list);

      const visibleUsers = filterUsersForAdminView((userRows || []) as User[], user);
      const counts: Record<string, number> = {};
      list.forEach((role) => {
        counts[role.id] = visibleUsers.filter((u) => {
          if (u.account_role_id) return u.account_role_id === role.id;
          if (role.slug === 'owner') return !!u.is_super_admin;
          if (role.slug === 'admin') return u.role === 'admin' && !u.is_super_admin;
          if (role.slug === 'member') return u.role !== 'admin' && !u.is_super_admin;
          return false;
        }).length;
      });
      setUserCounts(counts);
    } catch (error) {
      console.error('AdminRoles - load failed', error);
      setRoles([]);
      setUserCounts({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!menuRoleId) return;
    const onPointer = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuRoleId(null);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuRoleId(null);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuRoleId]);

  const listed = useMemo(() => {
    const q = nameFilter.trim().toLowerCase();
    const filtered = roles.filter((role) => !q || role.name.toLowerCase().includes(q));
    const sorted = [...filtered].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
    return sortDir === 'desc' ? sorted.reverse() : sorted;
  }, [roles, nameFilter, sortDir]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (role: AccountRole) => {
    setMenuRoleId(null);
    setEditing(role);
    setForm({ name: role.name, role_type: role.role_type });
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (isSaving) return;
    setFormOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  };

  const handleSave = async () => {
    const name = form.name.trim();
    if (!name) {
      setFormError('Role name is required.');
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      if (editing) {
        const { error } = await supabase
          .from('account_roles')
          .update({
            name,
            role_type: form.role_type,
            updated_at: new Date().toISOString(),
            ...(editing.is_system ? {} : { slug: slugifyRoleName(name) || editing.slug }),
          })
          .eq('id', editing.id);
        if (error) throw error;
        logAuditEventSafe({
          action: 'update',
          category: 'users',
          entityType: 'account_roles',
          entityId: editing.id,
          summary: `Updated role ${name}`,
        });
      } else {
        const slug = slugifyRoleName(name) || `role-${Date.now()}`;
        const { data, error } = await supabase
          .from('account_roles')
          .insert({
            name,
            slug,
            role_type: form.role_type,
            is_system: false,
            sort_order: 100 + roles.length,
          })
          .select('id')
          .single();
        if (error) throw error;
        logAuditEventSafe({
          action: 'create',
          category: 'users',
          entityType: 'account_roles',
          entityId: data?.id,
          summary: `Created role ${name}`,
        });
      }
      setFormOpen(false);
      await load();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not save role.';
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (role: AccountRole) => {
    setMenuRoleId(null);
    if (role.is_system) {
      alert('System roles cannot be deleted.');
      return;
    }
    if (!await appConfirm(`Delete the ${role.name} role? People on this role will be moved to Member.`)) {
      return;
    }
    const member = roles.find((item) => item.slug === 'member');
    try {
      if (member) {
        const { error: reassignError } = await supabase
          .from('users')
          .update({ account_role_id: member.id })
          .eq('account_role_id', role.id);
        if (reassignError) throw reassignError;
      }
      const { error } = await supabase.from('account_roles').delete().eq('id', role.id);
      if (error) throw error;
      logAuditEventSafe({
        action: 'delete',
        category: 'users',
        entityType: 'account_roles',
        entityId: role.id,
        summary: `Deleted role ${role.name}`,
      });
      await load();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Could not delete role.');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Roles"
        subtitle="Create and assign named roles. These labels do not change website permissions."
        icon={<Shield size={28} />}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg border-2 border-gold px-4 py-2.5 font-semibold text-gold transition-colors hover:bg-gold hover:text-charcoal"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gold">
            <Plus size={14} />
          </span>
          Add Role
        </button>
        <label className="sm:w-64">
          <span className="mb-1 block text-sm font-bold text-charcoal">Role Name</span>
          <input
            type="text"
            value={nameFilter}
            onChange={(event) => setNameFilter(event.target.value)}
            className="w-full border-0 border-b border-gray-300 bg-transparent px-0 py-2 text-sm text-charcoal focus:border-gold focus:outline-none"
            placeholder="Search roles"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-white text-[11px] font-bold uppercase tracking-wider text-neutral">
                <th className="px-6 py-4">
                  <button
                    type="button"
                    className="uppercase tracking-wider"
                    onClick={() => setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))}
                  >
                    Role Name {sortDir === 'asc' ? '↑' : '↓'}
                  </button>
                </th>
                <th className="px-6 py-4">Role Type</th>
                <th className="px-6 py-4">Users</th>
                <th className="w-12 px-4 py-4">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-neutral">
                    Loading roles…
                  </td>
                </tr>
              ) : listed.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-neutral">
                    No roles found
                  </td>
                </tr>
              ) : (
                listed.map((role) => (
                  <tr key={role.id} className="border-t border-gray-100">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gold">{role.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 text-sm text-charcoal">
                        <RoleTypeIcon roleType={role.role_type} />
                        {ACCOUNT_ROLE_TYPE_LABELS[role.role_type]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-charcoal">{userCounts[role.id] ?? 0}</td>
                    <td className="px-4 py-4 text-right">
                      {role.slug === 'owner' ? null : (
                        <div
                          className="relative inline-block"
                          ref={menuRoleId === role.id ? menuRef : undefined}
                        >
                          <button
                            type="button"
                            className="rounded-full p-1.5 text-neutral hover:bg-gray-100 hover:text-charcoal"
                            aria-label={`${role.name} actions`}
                            onClick={() =>
                              setMenuRoleId((current) => (current === role.id ? null : role.id))
                            }
                          >
                            <MoreVertical size={18} />
                          </button>
                          {menuRoleId === role.id && (
                            <div
                              role="menu"
                              className="absolute right-0 top-full z-30 mt-1 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                            >
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-charcoal hover:bg-gray-50"
                                onClick={() => openEdit(role)}
                              >
                                <Pencil size={16} className="text-gold" />
                                Edit
                              </button>
                              {!role.is_system && (
                                <button
                                  type="button"
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                                  onClick={() => void handleDelete(role)}
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 bg-white px-6 py-3 text-right text-sm text-neutral">
          {listed.length} {listed.length === 1 ? 'item' : 'items'}
        </div>
      </div>

      <Modal isOpen={formOpen} onClose={closeForm} title={editing ? 'Edit Role' : 'Add Role'}>
        <div className="space-y-4 p-1">
          {formError && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </p>
          )}
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-charcoal">Role Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-md border border-gray-200 px-3 py-2 focus:border-gold focus:outline-none"
              placeholder="Elders"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-charcoal">Role Type</span>
            <select
              value={form.role_type}
              onChange={(event) =>
                setForm((current) => ({ ...current, role_type: event.target.value as AccountRoleType }))
              }
              className="w-full rounded-md border border-gray-200 px-3 py-2 focus:border-gold focus:outline-none"
            >
              {ACCOUNT_ROLE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-neutral">
            Role type is a label only. It does not grant extra website permissions.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeForm}
              className="px-4 py-2 text-sm font-bold text-neutral hover:text-charcoal"
              disabled={isSaving}
            >
              Cancel
            </button>
            <GlowingButton type="button" onClick={() => void handleSave()} disabled={isSaving}>
              {isSaving ? 'Saving…' : editing ? 'Save Role' : 'Add Role'}
            </GlowingButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};
