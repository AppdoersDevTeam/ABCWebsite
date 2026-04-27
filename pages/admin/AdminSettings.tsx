import React, { useEffect, useMemo, useState } from 'react';
import { Settings, Tag, Briefcase, Plus, Save, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';
import { supabase } from '../../lib/supabase';
import type { Group, JobRole } from '../../types';

type Tab = 'groups' | 'job_roles';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const AdminSettings = () => {
  const [tab, setTab] = useState<Tab>('groups');
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);

  const [newGroupName, setNewGroupName] = useState('');
  const [newJobRoleName, setNewJobRoleName] = useState('');

  useEffect(() => {
    void loadAll();
  }, []);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [{ data: g, error: gErr }, { data: r, error: rErr }] = await Promise.all([
        supabase.from('groups').select('*').order('sort_order', { ascending: true }).order('name', { ascending: true }),
        supabase.from('job_roles').select('*').order('sort_order', { ascending: true }).order('name', { ascending: true }),
      ]);
      if (gErr) throw gErr;
      if (rErr) throw rErr;
      setGroups((g || []) as Group[]);
      setJobRoles((r || []) as JobRole[]);
    } catch (e) {
      console.error('Failed to load settings lists', e);
      alert('Failed to load Groups / Job Roles. Make sure ADD_GROUPS_AND_JOB_ROLES.sql has been run in Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeGroups = useMemo(() => groups.filter((g) => g.is_active !== false), [groups]);
  const activeJobRoles = useMemo(() => jobRoles.filter((r) => r.is_active !== false), [jobRoles]);

  const createGroup = async () => {
    const name = newGroupName.trim();
    if (!name) return;
    try {
      const payload = { name, slug: slugify(name), is_active: true };
      const { data, error } = await supabase.from('groups').insert([payload]).select('*').single();
      if (error) throw error;
      setGroups((prev) => [...prev, data as Group]);
      setNewGroupName('');
    } catch (e) {
      console.error('Create group failed', e);
      alert('Failed to create group. If a group with the same name/slug exists, choose a different name.');
    }
  };

  const createJobRole = async () => {
    const name = newJobRoleName.trim();
    if (!name) return;
    try {
      const payload = { name, slug: slugify(name), is_active: true };
      const { data, error } = await supabase.from('job_roles').insert([payload]).select('*').single();
      if (error) throw error;
      setJobRoles((prev) => [...prev, data as JobRole]);
      setNewJobRoleName('');
    } catch (e) {
      console.error('Create job role failed', e);
      alert('Failed to create job role. If one with the same name/slug exists, choose a different name.');
    }
  };

  const updateGroup = async (id: string, patch: Partial<Group>) => {
    try {
      const { error } = await supabase.from('groups').update(patch).eq('id', id);
      if (error) throw error;
      setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
    } catch (e) {
      console.error('Update group failed', e);
      alert('Failed to update group.');
    }
  };

  const updateJobRole = async (id: string, patch: Partial<JobRole>) => {
    try {
      const { error } = await supabase.from('job_roles').update(patch).eq('id', id);
      if (error) throw error;
      setJobRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    } catch (e) {
      console.error('Update job role failed', e);
      alert('Failed to update job role.');
    }
  };

  const deleteGroup = async (id: string) => {
    if (!window.confirm('Delete this group? If it is assigned to people, deletion may fail.')) return;
    try {
      const { error } = await supabase.from('groups').delete().eq('id', id);
      if (error) throw error;
      setGroups((prev) => prev.filter((g) => g.id !== id));
    } catch (e) {
      console.error('Delete group failed', e);
      alert('Delete failed (it may be in use). Try disabling it instead.');
    }
  };

  const deleteJobRole = async (id: string) => {
    if (!window.confirm('Delete this job role? If it is assigned to people, deletion may fail.')) return;
    try {
      const { error } = await supabase.from('job_roles').delete().eq('id', id);
      if (error) throw error;
      setJobRoles((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error('Delete job role failed', e);
      alert('Delete failed (it may be in use). Try disabling it instead.');
    }
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Settings"
        subtitle="Manage Groups and Job Roles used in the directory."
        icon={<Settings size={28} />}
      />

      <div className="glass-card bg-white/80 border border-white/60 rounded-[12px] p-2 flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setTab('groups')}
          className={`px-4 py-2 rounded-[8px] text-sm font-bold inline-flex items-center gap-2 ${
            tab === 'groups' ? 'bg-gold/15 text-charcoal border border-gold/40' : 'bg-white border border-gray-200 text-neutral'
          }`}
        >
          <Tag size={16} />
          Groups
        </button>
        <button
          type="button"
          onClick={() => setTab('job_roles')}
          className={`px-4 py-2 rounded-[8px] text-sm font-bold inline-flex items-center gap-2 ${
            tab === 'job_roles' ? 'bg-gold/15 text-charcoal border border-gold/40' : 'bg-white border border-gray-200 text-neutral'
          }`}
        >
          <Briefcase size={16} />
          Job Roles
        </button>
      </div>

      {isLoading ? (
        <div className="glass-card bg-white/80 border border-white/60 rounded-[12px] p-6 text-neutral">Loading…</div>
      ) : tab === 'groups' ? (
        <div className="glass-card bg-white/80 border border-white/60 rounded-[12px] p-6 space-y-6">
          <div className="flex gap-2 flex-wrap items-end">
            <div className="flex-1 min-w-[240px]">
              <label className="block text-sm font-bold text-charcoal mb-2">New group</label>
              <input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full p-3 rounded-[6px] border border-gray-200 focus:border-gold focus:outline-none bg-white"
                placeholder="e.g. Worship, Women, Sound, Children’s"
              />
            </div>
            <button
              type="button"
              onClick={createGroup}
              className="px-4 py-3 bg-white border border-gray-200 rounded-[6px] text-charcoal font-bold hover:border-gold hover:text-gold transition-colors inline-flex items-center gap-2"
              disabled={!newGroupName.trim()}
            >
              <Plus size={16} />
              Add
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left">
              <thead className="bg-white/60">
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral">Name</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral">Active</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral w-[160px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g, idx) => (
                  <tr
                    key={g.id}
                    className={`border-b border-gray-100 hover:bg-gold/5 transition-colors ${
                      idx % 2 === 0 ? 'bg-white/40' : 'bg-white/20'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        value={g.name || ''}
                        onChange={(e) =>
                          setGroups((prev) => prev.map((x) => (x.id === g.id ? { ...x, name: e.target.value } : x)))
                        }
                        className="w-full p-2 rounded-[6px] border border-gray-200 focus:border-gold focus:outline-none bg-white"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={g.is_active !== false}
                          onChange={(e) => updateGroup(g.id, { is_active: e.target.checked })}
                        />
                        <span className="text-sm font-bold text-charcoal">{g.is_active !== false ? 'Yes' : 'No'}</span>
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateGroup(g.id, { name: g.name?.trim() || '', slug: slugify(g.name || '') })}
                          className="px-3 py-2 bg-white border border-gray-200 rounded-[6px] text-neutral hover:text-gold hover:border-gold transition-colors text-sm font-bold inline-flex items-center gap-2"
                          title="Save"
                        >
                          <Save size={16} />
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteGroup(g.id)}
                          className="px-3 py-2 bg-white border border-red-200 rounded-[6px] text-red-600 hover:bg-red-50 transition-colors text-sm font-bold inline-flex items-center gap-2"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-neutral">
            Active groups ({activeGroups.length}) will show up in the Directory / People create/edit form and filters.
          </p>
        </div>
      ) : (
        <div className="glass-card bg-white/80 border border-white/60 rounded-[12px] p-6 space-y-6">
          <div className="flex gap-2 flex-wrap items-end">
            <div className="flex-1 min-w-[240px]">
              <label className="block text-sm font-bold text-charcoal mb-2">New job role</label>
              <input
                value={newJobRoleName}
                onChange={(e) => setNewJobRoleName(e.target.value)}
                className="w-full p-3 rounded-[6px] border border-gray-200 focus:border-gold focus:outline-none bg-white"
                placeholder="e.g. Pastor, Administrator, Youth Leader"
              />
            </div>
            <button
              type="button"
              onClick={createJobRole}
              className="px-4 py-3 bg-white border border-gray-200 rounded-[6px] text-charcoal font-bold hover:border-gold hover:text-gold transition-colors inline-flex items-center gap-2"
              disabled={!newJobRoleName.trim()}
            >
              <Plus size={16} />
              Add
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left">
              <thead className="bg-white/60">
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral">Name</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral">Active</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral w-[160px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobRoles.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={`border-b border-gray-100 hover:bg-gold/5 transition-colors ${
                      idx % 2 === 0 ? 'bg-white/40' : 'bg-white/20'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        value={r.name || ''}
                        onChange={(e) =>
                          setJobRoles((prev) => prev.map((x) => (x.id === r.id ? { ...x, name: e.target.value } : x)))
                        }
                        className="w-full p-2 rounded-[6px] border border-gray-200 focus:border-gold focus:outline-none bg-white"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={r.is_active !== false}
                          onChange={(e) => updateJobRole(r.id, { is_active: e.target.checked })}
                        />
                        <span className="text-sm font-bold text-charcoal">{r.is_active !== false ? 'Yes' : 'No'}</span>
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateJobRole(r.id, { name: r.name?.trim() || '', slug: slugify(r.name || '') })}
                          className="px-3 py-2 bg-white border border-gray-200 rounded-[6px] text-neutral hover:text-gold hover:border-gold transition-colors text-sm font-bold inline-flex items-center gap-2"
                          title="Save"
                        >
                          <Save size={16} />
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteJobRole(r.id)}
                          className="px-3 py-2 bg-white border border-red-200 rounded-[6px] text-red-600 hover:bg-red-50 transition-colors text-sm font-bold inline-flex items-center gap-2"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-neutral">
            Active job roles ({activeJobRoles.length}) will show up in the Directory / People create/edit form and filters.
          </p>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useMemo, useState } from 'react';
import { Settings, Tag, Briefcase, Plus, Save, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';
import { supabase } from '../../lib/supabase';
import type { Group, JobRole } from '../../types';

type Tab = 'groups' | 'job_roles';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const AdminSettings = () => {
  const [tab, setTab] = useState<Tab>('groups');
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);

  const [newGroupName, setNewGroupName] = useState('');
  const [newJobRoleName, setNewJobRoleName] = useState('');

  useEffect(() => {
    void loadAll();
  }, []);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [{ data: g, error: gErr }, { data: r, error: rErr }] = await Promise.all([
        supabase.from('groups').select('*').order('sort_order', { ascending: true }).order('name', { ascending: true }),
        supabase.from('job_roles').select('*').order('sort_order', { ascending: true }).order('name', { ascending: true }),
      ]);
      if (gErr) throw gErr;
      if (rErr) throw rErr;
      setGroups((g || []) as Group[]);
      setJobRoles((r || []) as JobRole[]);
    } catch (e) {
      console.error('Failed to load settings lists', e);
      alert('Failed to load Groups / Job Roles. Make sure the SQL for groups/job_roles has been run in Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeGroups = useMemo(() => groups.filter((g) => g.is_active !== false), [groups]);
  const activeJobRoles = useMemo(() => jobRoles.filter((r) => r.is_active !== false), [jobRoles]);

  const createGroup = async () => {
    const name = newGroupName.trim();
    if (!name) return;
    try {
      const payload = { name, slug: slugify(name), is_active: true };
      const { data, error } = await supabase.from('groups').insert([payload]).select('*').single();
      if (error) throw error;
      setGroups((prev) => [...prev, data as Group]);
      setNewGroupName('');
    } catch (e) {
      console.error('Create group failed', e);
      alert('Failed to create group. If a group with the same name/slug exists, choose a different name.');
    }
  };

  const createJobRole = async () => {
    const name = newJobRoleName.trim();
    if (!name) return;
    try {
      const payload = { name, slug: slugify(name), is_active: true };
      const { data, error } = await supabase.from('job_roles').insert([payload]).select('*').single();
      if (error) throw error;
      setJobRoles((prev) => [...prev, data as JobRole]);
      setNewJobRoleName('');
    } catch (e) {
      console.error('Create job role failed', e);
      alert('Failed to create job role. If one with the same name/slug exists, choose a different name.');
    }
  };

  const updateGroup = async (id: string, patch: Partial<Group>) => {
    try {
      const { error } = await supabase.from('groups').update(patch).eq('id', id);
      if (error) throw error;
      setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
    } catch (e) {
      console.error('Update group failed', e);
      alert('Failed to update group.');
    }
  };

  const updateJobRole = async (id: string, patch: Partial<JobRole>) => {
    try {
      const { error } = await supabase.from('job_roles').update(patch).eq('id', id);
      if (error) throw error;
      setJobRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    } catch (e) {
      console.error('Update job role failed', e);
      alert('Failed to update job role.');
    }
  };

  const deleteGroup = async (id: string) => {
    if (!window.confirm('Delete this group? If it is assigned to people, deletion may fail.')) return;
    try {
      const { error } = await supabase.from('groups').delete().eq('id', id);
      if (error) throw error;
      setGroups((prev) => prev.filter((g) => g.id !== id));
    } catch (e) {
      console.error('Delete group failed', e);
      alert('Delete failed (it may be in use). Try disabling it instead.');
    }
  };

  const deleteJobRole = async (id: string) => {
    if (!window.confirm('Delete this job role? If it is assigned to people, deletion may fail.')) return;
    try {
      const { error } = await supabase.from('job_roles').delete().eq('id', id);
      if (error) throw error;
      setJobRoles((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error('Delete job role failed', e);
      alert('Delete failed (it may be in use). Try disabling it instead.');
    }
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Settings"
        subtitle="Manage Groups and Job Roles used in the directory."
        icon={<Settings size={28} />}
      />

      <div className="glass-card bg-white/80 border border-white/60 rounded-[12px] p-2 flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setTab('groups')}
          className={`px-4 py-2 rounded-[8px] text-sm font-bold inline-flex items-center gap-2 ${
            tab === 'groups' ? 'bg-gold/15 text-charcoal border border-gold/40' : 'bg-white border border-gray-200 text-neutral'
          }`}
        >
          <Tag size={16} />
          Groups
        </button>
        <button
          type="button"
          onClick={() => setTab('job_roles')}
          className={`px-4 py-2 rounded-[8px] text-sm font-bold inline-flex items-center gap-2 ${
            tab === 'job_roles' ? 'bg-gold/15 text-charcoal border border-gold/40' : 'bg-white border border-gray-200 text-neutral'
          }`}
        >
          <Briefcase size={16} />
          Job Roles
        </button>
      </div>

      {isLoading ? (
        <div className="glass-card bg-white/80 border border-white/60 rounded-[12px] p-6 text-neutral">Loading…</div>
      ) : tab === 'groups' ? (
        <div className="glass-card bg-white/80 border border-white/60 rounded-[12px] p-6 space-y-6">
          <div className="flex gap-2 flex-wrap items-end">
            <div className="flex-1 min-w-[240px]">
              <label className="block text-sm font-bold text-charcoal mb-2">New group</label>
              <input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full p-3 rounded-[6px] border border-gray-200 focus:border-gold focus:outline-none bg-white"
                placeholder="e.g. Worship, Women, Sound, Children’s"
              />
            </div>
            <button
              type="button"
              onClick={createGroup}
              className="px-4 py-3 bg-white border border-gray-200 rounded-[6px] text-charcoal font-bold hover:border-gold hover:text-gold transition-colors inline-flex items-center gap-2"
              disabled={!newGroupName.trim()}
            >
              <Plus size={16} />
              Add
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left">
              <thead className="bg-white/60">
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral">Name</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral">Active</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral w-[160px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g, idx) => (
                  <tr
                    key={g.id}
                    className={`border-b border-gray-100 hover:bg-gold/5 transition-colors ${
                      idx % 2 === 0 ? 'bg-white/40' : 'bg-white/20'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        value={g.name || ''}
                        onChange={(e) => setGroups((prev) => prev.map((x) => (x.id === g.id ? { ...x, name: e.target.value } : x)))}
                        className="w-full p-2 rounded-[6px] border border-gray-200 focus:border-gold focus:outline-none bg-white"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={g.is_active !== false}
                          onChange={(e) => updateGroup(g.id, { is_active: e.target.checked })}
                        />
                        <span className="text-sm font-bold text-charcoal">{g.is_active !== false ? 'Yes' : 'No'}</span>
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateGroup(g.id, { name: g.name?.trim() || '', slug: slugify(g.name || '') })}
                          className="px-3 py-2 bg-white border border-gray-200 rounded-[6px] text-neutral hover:text-gold hover:border-gold transition-colors text-sm font-bold inline-flex items-center gap-2"
                          title="Save"
                        >
                          <Save size={16} />
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteGroup(g.id)}
                          className="px-3 py-2 bg-white border border-red-200 rounded-[6px] text-red-600 hover:bg-red-50 transition-colors text-sm font-bold inline-flex items-center gap-2"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-neutral">
            Active groups ({activeGroups.length}) will show up in the Directory / People create/edit form and filters.
          </p>
        </div>
      ) : (
        <div className="glass-card bg-white/80 border border-white/60 rounded-[12px] p-6 space-y-6">
          <div className="flex gap-2 flex-wrap items-end">
            <div className="flex-1 min-w-[240px]">
              <label className="block text-sm font-bold text-charcoal mb-2">New job role</label>
              <input
                value={newJobRoleName}
                onChange={(e) => setNewJobRoleName(e.target.value)}
                className="w-full p-3 rounded-[6px] border border-gray-200 focus:border-gold focus:outline-none bg-white"
                placeholder="e.g. Pastor, Administrator, Youth Leader"
              />
            </div>
            <button
              type="button"
              onClick={createJobRole}
              className="px-4 py-3 bg-white border border-gray-200 rounded-[6px] text-charcoal font-bold hover:border-gold hover:text-gold transition-colors inline-flex items-center gap-2"
              disabled={!newJobRoleName.trim()}
            >
              <Plus size={16} />
              Add
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left">
              <thead className="bg-white/60">
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral">Name</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral">Active</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral w-[160px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobRoles.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={`border-b border-gray-100 hover:bg-gold/5 transition-colors ${
                      idx % 2 === 0 ? 'bg-white/40' : 'bg-white/20'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        value={r.name || ''}
                        onChange={(e) =>
                          setJobRoles((prev) => prev.map((x) => (x.id === r.id ? { ...x, name: e.target.value } : x)))
                        }
                        className="w-full p-2 rounded-[6px] border border-gray-200 focus:border-gold focus:outline-none bg-white"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={r.is_active !== false}
                          onChange={(e) => updateJobRole(r.id, { is_active: e.target.checked })}
                        />
                        <span className="text-sm font-bold text-charcoal">{r.is_active !== false ? 'Yes' : 'No'}</span>
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateJobRole(r.id, { name: r.name?.trim() || '', slug: slugify(r.name || '') })}
                          className="px-3 py-2 bg-white border border-gray-200 rounded-[6px] text-neutral hover:text-gold hover:border-gold transition-colors text-sm font-bold inline-flex items-center gap-2"
                          title="Save"
                        >
                          <Save size={16} />
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteJobRole(r.id)}
                          className="px-3 py-2 bg-white border border-red-200 rounded-[6px] text-red-600 hover:bg-red-50 transition-colors text-sm font-bold inline-flex items-center gap-2"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-neutral">
            Active job roles ({activeJobRoles.length}) will show up in the Directory / People create/edit form and filters.
          </p>
        </div>
      )}
    </div>
  );
};

