import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Settings, Tag, Briefcase, Plus, Save, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';
import { supabase } from '../../lib/supabase';
import type { Group, JobRole } from '../../types';
import { useBlocker } from 'react-router-dom';

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
  const [savedGroups, setSavedGroups] = useState<Group[]>([]);
  const [savedJobRoles, setSavedJobRoles] = useState<JobRole[]>([]);
  const isDiscardingRef = useRef(false);

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
      const gg = (g || []) as Group[];
      const rr = (r || []) as JobRole[];
      setGroups(gg);
      setJobRoles(rr);
      setSavedGroups(gg);
      setSavedJobRoles(rr);
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
      setSavedGroups((prev) => [...prev, data as Group]);
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
      setSavedJobRoles((prev) => [...prev, data as JobRole]);
      setNewJobRoleName('');
    } catch (e) {
      console.error('Create job role failed', e);
      alert('Failed to create job role. If one with the same name/slug exists, choose a different name.');
    }
  };

  const saveGroup = async (id: string) => {
    const g = groups.find((x) => x.id === id);
    if (!g) return;
    try {
      const payload: Partial<Group> = { name: g.name?.trim() || '', slug: slugify(g.name || ''), is_active: g.is_active !== false };
      const { error } = await supabase.from('groups').update(payload).eq('id', id);
      if (error) throw error;
      setGroups((prev) => prev.map((x) => (x.id === id ? { ...x, ...payload } : x)));
      setSavedGroups((prev) => prev.map((x) => (x.id === id ? { ...x, ...payload } : x)));
    } catch (e) {
      console.error('Save group failed', e);
      alert('Failed to update group.');
    }
  };

  const saveJobRole = async (id: string) => {
    const r = jobRoles.find((x) => x.id === id);
    if (!r) return;
    try {
      const payload: Partial<JobRole> = { name: r.name?.trim() || '', slug: slugify(r.name || ''), is_active: r.is_active !== false };
      const { error } = await supabase.from('job_roles').update(payload).eq('id', id);
      if (error) throw error;
      setJobRoles((prev) => prev.map((x) => (x.id === id ? { ...x, ...payload } : x)));
      setSavedJobRoles((prev) => prev.map((x) => (x.id === id ? { ...x, ...payload } : x)));
    } catch (e) {
      console.error('Save job role failed', e);
      alert('Failed to update job role.');
    }
  };

  const deleteGroup = async (id: string) => {
    if (!window.confirm('Delete this group? If it is assigned to people, deletion may fail.')) return;
    try {
      const { error } = await supabase.from('groups').delete().eq('id', id);
      if (error) throw error;
      setGroups((prev) => prev.filter((g) => g.id !== id));
      setSavedGroups((prev) => prev.filter((g) => g.id !== id));
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
      setSavedJobRoles((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error('Delete job role failed', e);
      alert('Delete failed (it may be in use). Try disabling it instead.');
    }
  };

  const hasUnsavedChanges = useMemo(() => {
    const norm = (xs: Array<Group | JobRole>) =>
      xs
        .map((x) => ({
          id: x.id,
          name: (x.name || '').trim(),
          is_active: (x as any).is_active !== false,
        }))
        .sort((a, b) => a.id.localeCompare(b.id));
    return (
      JSON.stringify(norm(groups)) !== JSON.stringify(norm(savedGroups)) ||
      JSON.stringify(norm(jobRoles)) !== JSON.stringify(norm(savedJobRoles))
    );
  }, [groups, jobRoles, savedGroups, savedJobRoles]);

  const discardChanges = () => {
    isDiscardingRef.current = true;
    setGroups(savedGroups);
    setJobRoles(savedJobRoles);
    // allow state to settle before we consider blocking again
    setTimeout(() => {
      isDiscardingRef.current = false;
    }, 0);
  };

  // Warn on browser tab close/refresh
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [hasUnsavedChanges]);

  // Block in-app navigation (discarding changes if user chooses to leave)
  const blocker = useBlocker(hasUnsavedChanges && !isDiscardingRef.current);
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    const leave = window.confirm('You have unsaved changes. Leave without saving? Your changes will be discarded.');
    if (leave) {
      discardChanges();
      blocker.proceed?.();
    } else {
      blocker.reset?.();
    }
  }, [blocker]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Directory Setup"
        subtitle="Manage groups and job roles used in Directory / People."
        icon={<Settings size={28} />}
      />

      <div className="glass-card bg-white/80 border border-white/60 rounded-[12px] p-2 flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => {
            if (tab === 'groups') return;
            if (hasUnsavedChanges) {
              const leave = window.confirm(
                'You have unsaved changes. Switch tabs without saving? Your changes will be discarded.'
              );
              if (!leave) return;
              discardChanges();
            }
            setTab('groups');
          }}
          className={`px-4 py-2 rounded-[8px] text-sm font-bold inline-flex items-center gap-2 ${
            tab === 'groups' ? 'bg-gold/15 text-charcoal border border-gold/40' : 'bg-white border border-gray-200 text-neutral'
          }`}
        >
          <Tag size={16} />
          Groups
        </button>
        <button
          type="button"
          onClick={() => {
            if (tab === 'job_roles') return;
            if (hasUnsavedChanges) {
              const leave = window.confirm(
                'You have unsaved changes. Switch tabs without saving? Your changes will be discarded.'
              );
              if (!leave) return;
              discardChanges();
            }
            setTab('job_roles');
          }}
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
                          onChange={(e) =>
                            setGroups((prev) =>
                              prev.map((x) => (x.id === g.id ? { ...x, is_active: e.target.checked } : x))
                            )
                          }
                        />
                        <span className="text-sm font-bold text-charcoal">{g.is_active !== false ? 'Yes' : 'No'}</span>
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveGroup(g.id)}
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

          {groups.length === 0 && (
            <div className="rounded-[8px] border border-dashed border-gray-200 bg-white/60 p-4 text-sm text-neutral">
              No groups yet. Add your first group above (e.g. Worship, Women, Sound).
            </div>
          )}

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
                          onChange={(e) =>
                            setJobRoles((prev) =>
                              prev.map((x) => (x.id === r.id ? { ...x, is_active: e.target.checked } : x))
                            )
                          }
                        />
                        <span className="text-sm font-bold text-charcoal">{r.is_active !== false ? 'Yes' : 'No'}</span>
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveJobRole(r.id)}
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

          {jobRoles.length === 0 && (
            <div className="rounded-[8px] border border-dashed border-gray-200 bg-white/60 p-4 text-sm text-neutral">
              No job roles yet. Run `ADD_GROUPS_AND_JOB_ROLES.sql` again (it seeds the default roles), or add roles here.
            </div>
          )}

          <p className="text-xs text-neutral">
            Active job roles ({activeJobRoles.length}) will show up in the Directory / People create/edit form and filters.
          </p>
        </div>
      )}
    </div>
  );
};

