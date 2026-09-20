import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';
import { CalendarDays, Trash2, User, Upload, X, Download, Search, Archive, ArchiveRestore, Plus, MoreVertical, Pencil, Building2, UsersRound } from 'lucide-react';
import type { Group, JobRole, TeamMember } from '../../types';
import { supabase } from '../../lib/supabase';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';
import { buildStoredRole, getDisplayRole, inferProfileType } from '../../lib/teamMemberUtils';
import { downloadDirectoryCsv, downloadDirectoryPdf } from '../../lib/exportDirectoryPeople';
import { logAuditEventSafe } from '../../lib/auditLog';
import { formatDdMmYyyy } from '../../lib/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { CHURCH_NAME, displayInitials, PEOPLE_LABEL } from '../../lib/constants';
import metadata from '../../metadata.json';

type ProfileType = 'staff' | 'attendee' | 'member';

const PROFILE_LABEL: Record<ProfileType, string> = {
  staff: 'Staff',
  attendee: 'Attendee',
  member: 'Member',
};

const NAME_PARTICLES = new Set(['da', 'de', 'do', 'dos', 'das', 'van', 'von', 'del', 'della', 'di', 'le', 'la', 'du', 'st', 'saint']);

function lastFirstFromFullName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '';
  if (trimmed.includes(',')) return trimmed;
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return trimmed;
  let lastStart = parts.length - 1;
  while (lastStart > 0 && NAME_PARTICLES.has(parts[lastStart - 1].toLowerCase())) {
    lastStart -= 1;
  }
  const last = parts.slice(lastStart).join(' ');
  const first = parts.slice(0, lastStart).join(' ');
  return first ? `${last}, ${first}` : last;
}

function ministryGroupLabel(member: TeamMember): string {
  const groups = (member.groups || []).map((g) => g.name).filter(Boolean);
  if (inferProfileType(member) === 'staff') {
    return groups.length ? `${CHURCH_NAME} ${groups.join(', ')}` : `${CHURCH_NAME} Staff`;
  }
  return groups.length ? groups.join(', ') : CHURCH_NAME;
}

function StatusGlyph({ profileType }: { profileType: ProfileType }) {
  if (profileType === 'member') return <User size={14} className="text-gold" />;
  if (profileType === 'attendee') return <UsersRound size={14} className="text-gold" />;
  return <Building2 size={14} className="text-gold" />;
}

const MAX_DIRECTORY_PHONE_DIGITS = 17;

function countPhoneDigits(phone: string): number {
  return (phone.match(/\d/g) || []).length;
}

const STAFF_ROLE_OPTIONS = [
  'Administrator',
  'Associated Pastor',
  'Children Pastor',
  'Deacon',
  'Elder',
  'Ministry Leader',
  'Receptionist',
  'Senior Pastor',
  'Youth Adult Pastor',
  'Youth Pastor',
];

const emptyForm = (): FormState => ({
  name: '',
  profile_type: 'attendee',
  staff_role: '',
  email: '',
  phone: '',
  img: '',
  description: '',
  group_ids: [],
  job_role_ids: [],
  is_baptised: null,
  baptism_date: '',
  membership_start_date: '',
});

interface FormState {
  name: string;
  profile_type: ProfileType;
  staff_role: string;
  email: string;
  phone: string;
  img: string;
  description: string;
  group_ids: string[];
  job_role_ids: string[];
  is_baptised: boolean | null;
  baptism_date: string;
  membership_start_date: string;
}

/** Supabase/Postgrest errors are often plain objects, not `instanceof Error`. */
function getSupabaseErrorMessage(error: unknown): string {
  if (error == null) return 'Unknown error';
  if (error instanceof Error) return error.message;
  if (typeof error === 'object') {
    const o = error as Record<string, unknown>;
    const parts: string[] = [];
    if (typeof o.message === 'string' && o.message) parts.push(o.message);
    if (typeof o.details === 'string' && o.details) parts.push(`Details: ${o.details}`);
    if (typeof o.hint === 'string' && o.hint) parts.push(`Hint: ${o.hint}`);
    if (typeof o.code === 'string' && o.code) parts.push(`Code: ${o.code}`);
    if (parts.length > 0) return parts.join('\n');
  }
  return String(error);
}

function teamMemberSaveErrorHint(message: string): string {
  const m = message.toLowerCase();
  const hints: string[] = [];
  if (
    m.includes('too long') ||
    m.includes('right truncation') ||
    m.includes('22001') ||
    m.includes('character varying')
  ) {
    hints.push(
      'Text is longer than the database allows (often `description`). In Supabase SQL editor, run: ALTER_TEAM_MEMBERS_DESCRIPTION_TO_1500.sql (or widen that column to at least your max length).'
    );
  }
  if (m.includes('does not exist') || m.includes('42703')) {
    hints.push('A column may be missing. Run ADD_TEAM_MEMBER_PROFILE_FIELDS.sql in Supabase.');
  }
  if (m.includes('row-level security') || m.includes('rls') || m.includes('42501')) {
    hints.push('Row-level security blocked this update. Check RLS policies on `team_members` for admin users.');
  }
  if (hints.length === 0) {
    return '\n\nOpen the browser console (F12) for the full error. Common fixes: ADD_TEAM_MEMBER_PROFILE_FIELDS.sql; ALTER_TEAM_MEMBERS_DESCRIPTION_TO_1500.sql for long bios.';
  }
  return `\n\n${hints.join('\n\n')}`;
}

function memberToForm(m: TeamMember): FormState {
  const pt = inferProfileType(m);
  return {
    name: m.name,
    profile_type: pt,
    staff_role:
      pt === 'staff'
        ? (m.staff_role || m.role || STAFF_ROLE_OPTIONS[0]).trim()
        : pt === 'member'
          ? (m.staff_role || '').trim()
          : '',
    email: m.email || '',
    phone: m.phone || '',
    img: m.img || '',
    description: m.description || '',
    group_ids: (m.groups || []).map((g) => g.id),
    job_role_ids: (m.job_roles || []).map((r) => r.id),
    is_baptised: m.is_baptised ?? null,
    baptism_date: m.baptism_date ? String(m.baptism_date).slice(0, 10) : '',
    membership_start_date: m.membership_start_date ? String(m.membership_start_date).slice(0, 10) : '',
  };
}

function formatArchivedDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return formatDdMmYyyy(d) || '—';
}

export const AdminTeam = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [directorySetupWarning, setDirectorySetupWarning] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [statusFilter, setStatusFilter] = useState<'all' | ProfileType>('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [actionsMenuId, setActionsMenuId] = useState<string | null>(null);
  const actionsMenuRef = useRef<HTMLDivElement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [archiveTarget, setArchiveTarget] = useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const activeMembersList = useMemo(() => members.filter((m) => !m.is_archived), [members]);
  const archivedMembersList = useMemo(() => members.filter((m) => m.is_archived), [members]);

  const tabMembers = activeTab === 'active' ? activeMembersList : archivedMembersList;

  const filteredMembers = useMemo(() => {
    return tabMembers.filter((m) => {
      const pt = inferProfileType(m);
      if (statusFilter !== 'all' && pt !== statusFilter) return false;
      if (activeTab === 'active' && groupFilter !== 'all') {
        const memberGroupIds = new Set((m.groups || []).map((g) => g.id));
        if (!memberGroupIds.has(groupFilter)) return false;
      }
      return true;
    });
  }, [tabMembers, statusFilter, groupFilter, activeTab]);

  const visibleMembers = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return filteredMembers;

    return filteredMembers.filter((m) => {
      const haystack = [
        m.name ?? '',
        m.email ?? '',
        m.phone ?? '',
        getDisplayRole(m) ?? '',
        (m.groups || []).map((g) => g.name).filter(Boolean).join(' '),
        (m.job_roles || []).map((r) => r.name).filter(Boolean).join(' '),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [filteredMembers, searchText]);

  const churchName = (metadata as any)?.name ? String((metadata as any).name) : 'Church';

  const sortedVisibleMembers = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    const cmpStr = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'base' });
    return [...visibleMembers].sort((a, b) => {
      const c = cmpStr(lastFirstFromFullName(a.name || ''), lastFirstFromFullName(b.name || ''));
      if (c !== 0) return c * dir;
      return cmpStr(a.name || '', b.name || '');
    });
  }, [sortDir, visibleMembers]);

  const deleteNameMatches =
    deleteTarget != null &&
    deleteConfirmText.trim().toLowerCase() === deleteTarget.name.trim().toLowerCase();

  const filenameBase = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `people-${yyyy}-${mm}-${dd}`;
  }, []);

  /** Normalized emails that appear on more than one active directory row (data hygiene warning). */
  const duplicateEmails = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of activeMembersList) {
      const e = (m.email || '').trim().toLowerCase();
      if (!e) continue;
      counts.set(e, (counts.get(e) || 0) + 1);
    }
    return new Set([...counts.entries()].filter(([, n]) => n > 1).map(([e]) => e));
  }, [activeMembersList]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchMembers();
    fetchLookups();
  }, []);

  useEffect(() => {
    if (!actionsMenuId) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setActionsMenuId(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActionsMenuId(null);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [actionsMenuId]);

  const fetchLookups = async () => {
    try {
      const [{ data: g, error: gErr }, { data: r, error: rErr }] = await Promise.all([
        supabase.from('groups').select('*').order('sort_order', { ascending: true }).order('name', { ascending: true }),
        supabase.from('job_roles').select('*').order('sort_order', { ascending: true }).order('name', { ascending: true }),
      ]);
      if (gErr) throw gErr;
      if (rErr) throw rErr;
      setGroups((g || []) as Group[]);
      setJobRoles((r || []) as JobRole[]);
      setDirectorySetupWarning(null);
    } catch (e) {
      console.warn('Groups/job roles not loaded (SQL may not be applied yet).', e);
      setGroups([]);
      setJobRoles([]);
      setDirectorySetupWarning(
        'Groups/Job Roles could not be loaded (likely missing RLS policies). Re-run ADD_GROUPS_AND_JOB_ROLES.sql, then refresh.'
      );
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(
          `
          *,
          team_member_groups:team_member_groups(
            group_id,
            groups:groups(id, name, slug, sort_order, is_active)
          ),
          team_member_job_roles:team_member_job_roles(
            job_role_id,
            job_roles:job_roles(id, name, slug, sort_order, is_active)
          )
        `
        )
        .order('name', { ascending: true });

      if (error) throw error;
      const withJoins = (data || []).map((row: any) => {
        const groupsArr: Group[] =
          (row.team_member_groups || [])
            .map((x: any) => x.groups)
            .filter(Boolean) || [];
        const rolesArr: JobRole[] =
          (row.team_member_job_roles || [])
            .map((x: any) => x.job_roles)
            .filter(Boolean) || [];

        const member: TeamMember = {
          ...(row as TeamMember),
          groups: groupsArr,
          job_roles: rolesArr,
        };
        return member;
      });
      setMembers(withJoins);
    } catch (error) {
      console.error('Error fetching team members:', error);
      alert(`Failed to load ${PEOPLE_LABEL}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a PNG, JPEG, or PDF file');
        return;
      }

      const maxSize = 300 * 1024;
      if (file.size > maxSize) {
        alert('File size must be less than 300KB');
        return;
      }

      setSelectedFile(file);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData((prev) => ({ ...prev, img: '' }));
  };

  const resetModal = () => {
    handleRemoveFile();
    setFormData(emptyForm());
  };

  const syncMemberGroups = async (teamMemberId: string, groupIds: string[]) => {
    await supabase.from('team_member_groups').delete().eq('team_member_id', teamMemberId);
    if (groupIds.length === 0) return;
    const rows = groupIds.map((group_id) => ({ team_member_id: teamMemberId, group_id }));
    const { error } = await supabase.from('team_member_groups').insert(rows);
    if (error) throw error;
  };

  const syncMemberJobRoles = async (teamMemberId: string, jobRoleIds: string[]) => {
    await supabase.from('team_member_job_roles').delete().eq('team_member_id', teamMemberId);
    if (jobRoleIds.length === 0) return;
    const rows = jobRoleIds.map((job_role_id) => ({ team_member_id: teamMemberId, job_role_id }));
    const { error } = await supabase.from('team_member_job_roles').insert(rows);
    if (error) throw error;
  };

  const validate = (trimmed: {
    name: string;
    staff_role: string;
    email: string;
    phone: string;
    description: string;
    profile_type: ProfileType;
    membership_start_date: string;
  }): string | null => {
    if (!trimmed.name) return 'Name is required.';
    if (!trimmed.email) return 'Email is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed.email)) return 'Please enter a valid email address.';
    if (!trimmed.phone) return 'Phone is required.';
    const phoneRegex = /^[0-9\s\-()]+$/;
    if (!phoneRegex.test(trimmed.phone)) return 'Phone number can only contain numbers, spaces, hyphens, and parentheses.';
    if (countPhoneDigits(trimmed.phone) > MAX_DIRECTORY_PHONE_DIGITS) {
      return `Phone number cannot exceed ${MAX_DIRECTORY_PHONE_DIGITS} digits.`;
    }
    if (trimmed.description.length > 1500) return 'Description must not exceed 1500 characters.';

    if (trimmed.profile_type === 'staff' && formData.job_role_ids.length === 0) {
      return 'Select at least one job role for staff.';
    }

    // Baptism: Staff & Member must choose Yes/No. Date is always optional.
    const baptismRequired = trimmed.profile_type === 'staff' || trimmed.profile_type === 'member';
    if (baptismRequired && formData.is_baptised === null) {
      return 'Please select Baptised: Yes or No.';
    }

    if (trimmed.profile_type === 'member') {
      if (!trimmed.membership_start_date) {
        return 'Membership start date is required for members.';
      }
    }

    return null;
  };

  const photoRequired = formData.profile_type === 'staff';
  const hasPhoto = !!(selectedFile || formData.img || editingMember?.img || previewUrl);

  const runUpload = async (): Promise<string> => {
    if (!selectedFile) return formData.img;

    let imageUrl = formData.img;
    try {
      const fileExt = selectedFile.name.split('.').pop() || 'png';
      const fileName = `team-images/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('team-images')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.warn('Storage upload failed, saving as base64:', uploadError.message);
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            if (reader.result) resolve(reader.result as string);
            else reject(new Error('Failed to convert file to base64'));
          };
          reader.onerror = reject;
        });
        reader.readAsDataURL(selectedFile);
        imageUrl = await base64Promise;
      } else {
        const { data: urlData } = supabase.storage.from('team-images').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
    } catch (uploadError: unknown) {
      console.warn('Storage upload failed, using base64 fallback:', uploadError);
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          if (reader.result) resolve(reader.result as string);
          else reject(new Error('Failed to convert file to base64'));
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(selectedFile);
      imageUrl = await base64Promise;
    }
    return imageUrl;
  };

  const buildRow = (imageUrl: string, trimmed: ReturnType<typeof trimForm>) => {
    const pt = trimmed.profile_type;
    const storedRole = buildStoredRole(pt, trimmed.staff_role);

    const row: Record<string, unknown> = {
      name: trimmed.name,
      profile_type: pt,
      // Keep staff_role for staff and members (hidden for attendees).
      staff_role:
        pt === 'staff'
          ? trimmed.staff_role
          : pt === 'member'
            ? trimmed.staff_role.trim()
              ? trimmed.staff_role.trim()
              : null
            : null,
      role: storedRole,
      email: trimmed.email,
      phone: trimmed.phone,
      img: imageUrl || '',
      description: trimmed.description,
    };

    if (pt === 'member') {
      row.is_baptised = formData.is_baptised;
      row.baptism_date =
        formData.is_baptised === true && formData.baptism_date.trim()
          ? formData.baptism_date.trim()
          : null;
      row.membership_start_date = trimmed.membership_start_date.trim();
    } else {
      // Staff/Attendee may optionally store baptism info too
      row.is_baptised = formData.is_baptised;
      row.baptism_date =
        formData.is_baptised === true && formData.baptism_date.trim()
          ? formData.baptism_date.trim()
          : null;
      row.membership_start_date = pt === 'staff' ? trimmed.membership_start_date.trim() || null : null;
    }

    return row;
  };

  function trimForm() {
    const firstJobRoleName =
      formData.profile_type === 'staff'
        ? (jobRoles.find((r) => r.id === formData.job_role_ids[0])?.name || '').trim()
        : '';
    return {
      name: formData.name.trim(),
      staff_role: firstJobRoleName,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      description: formData.description.trim(),
      profile_type: formData.profile_type,
      membership_start_date: formData.membership_start_date.trim(),
    };
  }

  const handleCreate = async () => {
    const trimmed = trimForm();
    const err = validate(trimmed);
    if (err) {
      alert(err);
      return;
    }

    if (photoRequired && !selectedFile && !formData.img) {
      alert('Photo is required for staff. Please upload a photo.');
      return;
    }

    setIsUploading(true);

    try {
      const imageUrl = await runUpload();
      const insertData = buildRow(imageUrl, trimmed);

      const { data, error } = await supabase.from('team_members').insert([insertData]).select().single();

      if (error) throw error;

      const created = data as TeamMember;

      // Attendees stay as-is: no groups/job roles
      const desiredGroupIds = trimmed.profile_type === 'attendee' ? [] : formData.group_ids;
      const desiredJobRoleIds = trimmed.profile_type === 'attendee' ? [] : formData.job_role_ids;

      try {
        await syncMemberGroups(created.id, desiredGroupIds);
        await syncMemberJobRoles(created.id, desiredJobRoleIds);
      } catch (joinErr) {
        console.warn('Join-table save failed (run ADD_GROUPS_AND_JOB_ROLES.sql in Supabase).', joinErr);
      }

      logAuditEventSafe({
        action: 'create',
        category: 'team',
        entityType: 'team_members',
        entityId: created.id,
        summary: `Added person "${trimmed.name}"`,
        details: { profile_type: trimmed.profile_type },
      });

      await fetchMembers();
      resetModal();
      setIsModalOpen(false);
    } catch (error: unknown) {
      console.error('Error creating team member:', error);
      const msg = getSupabaseErrorMessage(error) || `Failed to add person to ${PEOPLE_LABEL}`;
      alert(msg + teamMemberSaveErrorHint(msg));
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData(memberToForm(member));
    setSelectedFile(null);
    setPreviewUrl(member.img || null);
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingMember) return;

    const trimmed = trimForm();
    const err = validate(trimmed);
    if (err) {
      alert(err);
      return;
    }

    if (photoRequired && !selectedFile && !formData.img && !editingMember.img) {
      alert('Photo is required for staff. Please upload a photo.');
      return;
    }

    setIsUploading(true);

    try {
      let imageUrl = formData.img;
      let oldImageUrl = editingMember.img;

      if (selectedFile) {
        imageUrl = await runUpload();

        if (oldImageUrl && oldImageUrl.includes('team-images') && !oldImageUrl.startsWith('data:')) {
          try {
            const urlParts = oldImageUrl.split('/team-images/');
            if (urlParts.length > 1) {
              const filePath = `team-images/${urlParts[1]}`;
              await supabase.storage.from('team-images').remove([filePath]);
            }
          } catch (deleteError) {
            console.warn('Error deleting old image:', deleteError);
          }
        }
      }

      const updateData = buildRow(imageUrl, trimmed);

      const { error } = await supabase.from('team_members').update(updateData).eq('id', editingMember.id);

      if (error) throw error;

      const desiredGroupIds = trimmed.profile_type === 'attendee' ? [] : formData.group_ids;
      const desiredJobRoleIds = trimmed.profile_type === 'attendee' ? [] : formData.job_role_ids;

      try {
        await syncMemberGroups(editingMember.id, desiredGroupIds);
        await syncMemberJobRoles(editingMember.id, desiredJobRoleIds);
      } catch (joinErr) {
        console.warn('Join-table save failed (run ADD_GROUPS_AND_JOB_ROLES.sql in Supabase).', joinErr);
      }

      logAuditEventSafe({
        action: 'update',
        category: 'team',
        entityType: 'team_members',
        entityId: editingMember.id,
        summary: `Updated person "${trimmed.name}"`,
      });

      await fetchMembers();
      resetModal();
      setEditingMember(null);
      setIsModalOpen(false);
    } catch (error: unknown) {
      console.error('Error updating team member:', error);
      const msg = getSupabaseErrorMessage(error) || `Failed to update ${PEOPLE_LABEL} person`;
      alert(msg + teamMemberSaveErrorHint(msg));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (member: TeamMember) => {
    setDeleteTarget(member);
    setDeleteConfirmText('');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const expected = deleteTarget.name.trim().toLowerCase();
    if (deleteConfirmText.trim().toLowerCase() !== expected) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase.from('team_members').delete().eq('id', deleteTarget.id);
      if (error) throw error;
      logAuditEventSafe({
        action: 'delete',
        category: 'team',
        entityType: 'team_members',
        entityId: deleteTarget.id,
        summary: `Permanently deleted person "${deleteTarget.name}"`,
      });
      setDeleteTarget(null);
      setDeleteConfirmText('');
      await fetchMembers();
    } catch (error: unknown) {
      console.error('Error deleting team member:', error);
      alert(getSupabaseErrorMessage(error) || `Failed to delete ${PEOPLE_LABEL} person`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchive = (member: TeamMember) => {
    setArchiveTarget(member);
  };

  const handleArchiveConfirm = async () => {
    if (!archiveTarget) return;
    setIsArchiving(true);
    try {
      const { error } = await supabase
        .from('team_members')
        .update({
          is_archived: true,
          archived_at: new Date().toISOString(),
          archived_by: user?.id || null,
        })
        .eq('id', archiveTarget.id);
      if (error) throw error;
      logAuditEventSafe({
        action: 'archive',
        category: 'team',
        entityType: 'team_members',
        entityId: archiveTarget.id,
        summary: `Archived person "${archiveTarget.name}"`,
      });
      setArchiveTarget(null);
      await fetchMembers();
    } catch (error: unknown) {
      console.error('Error archiving team member:', error);
      alert(getSupabaseErrorMessage(error) || `Failed to archive ${PEOPLE_LABEL} person`);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleUnarchive = async (id: string) => {
    try {
      const member = members.find((m) => m.id === id);
      const { error } = await supabase
        .from('team_members')
        .update({ is_archived: false, archived_at: null, archived_by: null })
        .eq('id', id);
      if (error) throw error;
      logAuditEventSafe({
        action: 'unarchive',
        category: 'team',
        entityType: 'team_members',
        entityId: id,
        summary: `Restored person "${member?.name || id}" from archive`,
      });
      await fetchMembers();
    } catch (error: unknown) {
      console.error('Error unarchiving team member:', error);
      alert(getSupabaseErrorMessage(error) || `Failed to restore ${PEOPLE_LABEL} person`);
    }
  };

  const openCreateModal = () => {
    setEditingMember(null);
    resetModal();
    setIsModalOpen(true);
  };

  const setProfileType = (profile_type: ProfileType) => {
    setFormData((prev) => ({
      ...prev,
      profile_type,
      staff_role: profile_type === 'member' && prev.profile_type !== 'member' ? '' : prev.staff_role,
      membership_start_date: profile_type === 'attendee' ? '' : prev.membership_start_date,
      group_ids: profile_type === 'attendee' ? [] : prev.group_ids,
      job_role_ids: profile_type === 'attendee' ? [] : prev.job_role_ids,
    }));
  };

  const trimmed = trimForm();
  const validationError = validate(trimmed);
  const formInvalid =
    !!validationError ||
    (photoRequired && !hasPhoto) ||
    isUploading ||
    !trimmed.name ||
    !trimmed.email ||
    !trimmed.phone;

  const listedMembers = sortedVisibleMembers;
  const listedIds = listedMembers.map((m) => m.id);
  const allListedSelected = listedIds.length > 0 && listedIds.every((id) => selectedIds[id]);
  const toggleAllListed = () => {
    setSelectedIds((prev) => {
      const select = !allListedSelected;
      const next = { ...prev };
      listedIds.forEach((id) => {
        if (select) next[id] = true;
        else delete next[id];
      });
      return next;
    });
  };
  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  };
  const exportList = listedMembers;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={PEOPLE_LABEL}
        subtitle="Search, filter, and manage staff, attendees, and members."
        icon={<User size={28} />}
      />

      {directorySetupWarning && (
        <div className="glass-card bg-white/80 border border-amber-200 rounded-[12px] p-4 text-sm text-amber-800">
          {directorySetupWarning}
        </div>
      )}

      <div className="flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'active'
              ? 'border-gold text-charcoal'
              : 'border-transparent text-neutral hover:text-charcoal'
          }`}
        >
          Active ({activeMembersList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('archived')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'archived'
              ? 'border-gold text-charcoal'
              : 'border-transparent text-neutral hover:text-charcoal'
          }`}
        >
          Archived ({archivedMembersList.length})
        </button>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg border-2 border-gold px-4 py-2.5 font-semibold text-gold transition-colors hover:bg-gold hover:text-charcoal"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-current">
            <Plus size={14} />
          </span>
          Add Person
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="sm:w-40">
            <span className="mb-1 block text-sm font-bold text-charcoal">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | ProfileType)}
              className="w-full border-0 border-b border-gray-300 bg-transparent px-0 py-2 text-sm text-charcoal focus:border-gold focus:outline-none"
            >
              <option value="all">All</option>
              {(Object.keys(PROFILE_LABEL) as ProfileType[]).map((pt) => (
                <option key={pt} value={pt}>
                  {PROFILE_LABEL[pt]}
                </option>
              ))}
            </select>
          </label>
          {groups.length > 0 && activeTab === 'active' && (
            <label className="sm:w-48">
              <span className="mb-1 block text-sm font-bold text-charcoal">Group</span>
              <select
                value={groupFilter}
                onChange={(event) => setGroupFilter(event.target.value)}
                className="w-full border-0 border-b border-gray-300 bg-transparent px-0 py-2 text-sm text-charcoal focus:border-gold focus:outline-none"
              >
                <option value="all">All</option>
                {groups
                  .filter((g) => g.is_active !== false)
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
              </select>
            </label>
          )}
          <label className="sm:w-80">
            <span className="mb-1 block text-sm font-bold text-charcoal">Search by name, email, phone or group</span>
            <div className="relative">
              <Search size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral" />
              <input
                type="text"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                className="w-full border-0 border-b border-gray-300 bg-transparent py-2 pl-6 pr-8 text-sm text-charcoal focus:border-gold focus:outline-none"
                placeholder="Search"
              />
              {searchText.trim() && (
                <button
                  type="button"
                  onClick={() => setSearchText('')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral hover:text-charcoal"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm">
        <div className="flex justify-end px-4 py-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportMenuOpen((open) => !open)}
              disabled={isLoading || listedMembers.length === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-gold bg-white px-3 py-1.5 text-sm font-semibold text-gold hover:bg-gold/10 disabled:opacity-50"
            >
              <Download size={16} />
              Export
            </button>
            {exportMenuOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  onClick={() => {
                    setExportMenuOpen(false);
                    downloadDirectoryCsv(exportList, filenameBase, { churchName, exportedAt: new Date() });
                  }}
                >
                  CSV
                </button>
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  onClick={() => {
                    setExportMenuOpen(false);
                    downloadDirectoryPdf(exportList, filenameBase, { churchName, exportedAt: new Date() });
                  }}
                >
                  PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {activeTab === 'active' && duplicateEmails.size > 0 && (
          <div className="mx-4 mb-3 rounded-[12px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-bold">Duplicate {PEOPLE_LABEL} emails detected</p>
            <p className="mt-1 text-amber-800">
              Some people share the same email address. User ↔ {PEOPLE_LABEL} auto-link and roster permissions use
              email matching — resolve duplicates in {PEOPLE_LABEL} so each login email maps to one person.
            </p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-y border-gray-200 bg-white text-[11px] font-bold uppercase tracking-wider text-neutral">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allListedSelected}
                    onChange={toggleAllListed}
                    aria-label="Select all people"
                    className="h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold"
                  />
                </th>
                <th className="px-3 py-3">
                  <button type="button" onClick={() => setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))}>
                    Name {sortDir === 'asc' ? '↑' : '↓'}
                  </button>
                </th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Role</th>
                <th className="px-3 py-3">Ministry Group</th>
                <th className="px-3 py-3">{activeTab === 'archived' ? 'Archived' : 'Phone'}</th>
                <th className="w-12 px-2 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral">
                    Loading people…
                  </td>
                </tr>
              ) : listedMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral">
                    {activeTab === 'archived'
                      ? archivedMembersList.length === 0
                        ? 'No archived people'
                        : 'No archived people match your search'
                      : activeMembersList.length === 0
                        ? `No people in ${PEOPLE_LABEL} yet. Add your first person to get started.`
                        : 'No people found'}
                  </td>
                </tr>
              ) : (
                listedMembers.map((member) => {
                  const pt = inferProfileType(member);
                  const emailKey = (member.email || '').trim().toLowerCase();
                  const dupEmail = activeTab === 'active' && !!emailKey && duplicateEmails.has(emailKey);
                  return (
                    <tr key={member.id} className="border-t border-gray-100">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={!!selectedIds[member.id]}
                          onChange={() => toggleSelected(member.id)}
                          aria-label={`Select ${lastFirstFromFullName(member.name)}`}
                          className="h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex min-w-[180px] items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-xs font-bold text-neutral">
                            {member.img ? (
                              <img src={member.img} alt="" className="h-full w-full object-cover" />
                            ) : (
                              displayInitials({ name: member.name })
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-gold">{lastFirstFromFullName(member.name)}</p>
                            {member.user_id ? (
                              <p className="text-[11px] font-bold uppercase text-purple-700">Linked</p>
                            ) : (
                              <p className="text-[11px] font-bold uppercase text-neutral">No account</p>
                            )}
                            {dupEmail && (
                              <p className="text-[11px] font-bold uppercase text-amber-800">Duplicate email</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-charcoal">{member.email || '—'}</td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-gold">
                          <StatusGlyph profileType={pt} />
                          {getDisplayRole(member)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-charcoal">{ministryGroupLabel(member) || '—'}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-charcoal">
                        {activeTab === 'archived' ? formatArchivedDate(member.archived_at) : member.phone || '—'}
                      </td>
                      <td className="px-2 py-3 text-right">
                        <div
                          className="relative inline-block"
                          ref={actionsMenuId === member.id ? actionsMenuRef : undefined}
                        >
                          <button
                            type="button"
                            className="rounded-full p-1.5 text-neutral hover:bg-gray-100 hover:text-charcoal"
                            aria-label={`${member.name} actions`}
                            onClick={() =>
                              setActionsMenuId((current) => (current === member.id ? null : member.id))
                            }
                          >
                            <MoreVertical size={18} />
                          </button>
                          {actionsMenuId === member.id && (
                            <div
                              role="menu"
                              className="absolute right-0 top-full z-30 mt-1 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                            >
                              {activeTab === 'archived' ? (
                                <>
                                  <button
                                    type="button"
                                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gold hover:bg-gray-50"
                                    onClick={() => {
                                      setActionsMenuId(null);
                                      void handleUnarchive(member.id);
                                    }}
                                  >
                                    <ArchiveRestore size={16} />
                                    Unarchive
                                  </button>
                                  <div className="my-1 border-t border-gray-100" />
                                  <button
                                    type="button"
                                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                      setActionsMenuId(null);
                                      handleDelete(member);
                                    }}
                                  >
                                    <Trash2 size={16} />
                                    Delete
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gold hover:bg-gray-50"
                                    onClick={() => {
                                      setActionsMenuId(null);
                                      handleEdit(member);
                                    }}
                                  >
                                    <Pencil size={16} />
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-charcoal hover:bg-gray-50"
                                    onClick={() => {
                                      setActionsMenuId(null);
                                      handleArchive(member);
                                    }}
                                  >
                                    <Archive size={16} />
                                    Archive
                                  </button>
                                  <div className="my-1 border-t border-gray-100" />
                                  <button
                                    type="button"
                                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                      setActionsMenuId(null);
                                      handleDelete(member);
                                    }}
                                  >
                                    <Trash2 size={16} />
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 bg-white px-6 py-3 text-right text-sm text-neutral">
          {listedMembers.length} {listedMembers.length === 1 ? 'item' : 'items'}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMember(null);
          resetModal();
        }}
        title={editingMember ? 'Edit Person' : 'Add Person'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              placeholder="Enter name"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Role *</label>
            <select
              value={formData.profile_type}
              onChange={(e) => setProfileType(e.target.value as ProfileType)}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none bg-white"
            >
              {(Object.keys(PROFILE_LABEL) as ProfileType[]).map((key) => (
                <option key={key} value={key}>
                  {PROFILE_LABEL[key]}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral mt-1">Staff, Attendee, or Member ({PEOPLE_LABEL}).</p>
          </div>

          {formData.profile_type !== 'attendee' && (groups.length > 0 || jobRoles.length > 0) && (
            <div className="rounded-[8px] border border-gray-200 bg-white/70 p-4 space-y-4">
              {groups.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-charcoal mb-2">Groups (optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {groups
                      .filter((g) => g.is_active !== false)
                      .map((g) => {
                        const checked = formData.group_ids.includes(g.id);
                        return (
                          <label key={g.id} className="cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={checked}
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  group_ids: checked
                                    ? prev.group_ids.filter((id) => id !== g.id)
                                    : [...prev.group_ids, g.id],
                                }))
                              }
                            />
                            <span className="inline-flex items-center px-3 py-2 rounded-[6px] border border-gray-200 bg-white text-sm font-bold text-neutral peer-checked:border-gold peer-checked:bg-gold/10 peer-checked:text-charcoal transition-colors">
                              {g.name}
                            </span>
                          </label>
                        );
                      })}
                  </div>
                </div>
              )}

              {jobRoles.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-charcoal mb-2">
                    Job roles {formData.profile_type === 'staff' ? '*' : '(optional)'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {jobRoles
                      .filter((r) => r.is_active !== false)
                      .map((r) => {
                        const checked = formData.job_role_ids.includes(r.id);
                        return (
                          <label key={r.id} className="cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={checked}
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  job_role_ids: checked
                                    ? prev.job_role_ids.filter((id) => id !== r.id)
                                    : [...prev.job_role_ids, r.id],
                                }))
                              }
                            />
                            <span className="inline-flex items-center px-3 py-2 rounded-[6px] border border-gray-200 bg-white text-sm font-bold text-neutral peer-checked:border-gold peer-checked:bg-gold/10 peer-checked:text-charcoal transition-colors">
                              {r.name}
                            </span>
                          </label>
                        );
                      })}
                  </div>
                  {formData.profile_type === 'staff' && (
                    <p className="text-xs text-neutral mt-2">Staff must have at least 1 job role selected.</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              placeholder="type a valid email address"
              inputMode="email"
              autoComplete="email"
              pattern="^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
              title="Please enter a valid email address (e.g. name@example.com)."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Phone *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value;
                if (/^[0-9\s\-()]*$/.test(value) && countPhoneDigits(value) <= MAX_DIRECTORY_PHONE_DIGITS) {
                  setFormData({ ...formData, phone: value });
                }
              }}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              placeholder="03-308 5409"
              title={`Up to ${MAX_DIRECTORY_PHONE_DIGITS} digits`}
            />
          </div>

          {(formData.profile_type === 'member' || formData.profile_type === 'staff' || formData.profile_type === 'attendee') && (
            <>
              {(formData.profile_type === 'member' || formData.profile_type === 'staff') && (
                <div>
                  <label className="block text-sm font-bold text-charcoal mb-2">
                    Membership start date {formData.profile_type === 'member' ? '*' : '(optional)'}
                  </label>
                  <input
                    type="date"
                    value={formData.membership_start_date}
                    onChange={(e) => setFormData({ ...formData, membership_start_date: e.target.value })}
                    className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none bg-white"
                  />
                </div>
              )}

              <div className="rounded-[8px] border border-gray-200 bg-white/70 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="block text-sm font-bold text-charcoal">
                      Baptised? {(formData.profile_type === 'staff' || formData.profile_type === 'member') ? '*' : '(optional)'}
                    </span>
                    <p className="text-xs text-neutral mt-1">
                      {formData.profile_type === 'attendee'
                        ? 'Optional for attendees.'
                        : 'Required for staff and members.'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {formData.profile_type === 'attendee' && (
                    <label className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="baptised"
                        className="peer sr-only"
                        checked={formData.is_baptised === null}
                        onChange={() => setFormData({ ...formData, is_baptised: null, baptism_date: '' })}
                      />
                      <div className="px-3 py-2 rounded-[6px] border border-gray-200 bg-white text-sm font-bold text-neutral peer-checked:border-gold peer-checked:bg-gold/10 peer-checked:text-charcoal transition-colors">
                        Not set
                      </div>
                    </label>
                  )}

                  <label className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="baptised"
                      className="peer sr-only"
                      checked={formData.is_baptised === true}
                      onChange={() => setFormData({ ...formData, is_baptised: true })}
                    />
                    <div className="px-3 py-2 rounded-[6px] border border-gray-200 bg-white text-sm font-bold text-neutral peer-checked:border-gold peer-checked:bg-gold/10 peer-checked:text-charcoal transition-colors">
                      Yes
                    </div>
                  </label>

                  <label className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="baptised"
                      className="peer sr-only"
                      checked={formData.is_baptised === false}
                      onChange={() => setFormData({ ...formData, is_baptised: false, baptism_date: '' })}
                    />
                    <div className="px-3 py-2 rounded-[6px] border border-gray-200 bg-white text-sm font-bold text-neutral peer-checked:border-gold peer-checked:bg-gold/10 peer-checked:text-charcoal transition-colors">
                      No
                    </div>
                  </label>
                </div>
              </div>

              {formData.is_baptised === true && (
                <div className="mt-1">
                  <label className="block text-sm font-bold text-charcoal mb-2">
                    Baptism date (optional)
                  </label>
                  <div className="relative">
                    <CalendarDays size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral" />
                    <input
                      type="date"
                      value={formData.baptism_date}
                      onChange={(e) => setFormData({ ...formData, baptism_date: e.target.value })}
                      className="w-full pl-10 pr-3 py-3 rounded-[6px] border border-gray-200 focus:border-gold focus:outline-none bg-white"
                    />
                  </div>
                  <p className="text-xs text-neutral mt-1">
                    Optional. You can save without a baptism date.
                  </p>
                </div>
              )}

            </>
          )}

          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">
              Photo {photoRequired ? '*' : ''} (max 300KB
              {photoRequired ? ', required for Staff' : ', optional for Member and Attendee'})
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                {previewUrl && (() => {
                  const isImage = selectedFile
                    ? selectedFile.type.startsWith('image/')
                    : Boolean(
                        previewUrl &&
                          !previewUrl.toLowerCase().endsWith('.pdf') &&
                          (previewUrl.startsWith('blob:') || previewUrl.startsWith('http') || previewUrl.startsWith('data:'))
                      );

                  if (isImage && previewUrl) {
                    return <img src={previewUrl} alt={`${PEOPLE_LABEL} person`} className="w-full h-full object-cover" />;
                  }
                  return (
                    <div className="w-full h-full bg-gold/10 flex items-center justify-center">
                      <User size={32} className="text-gold" />
                    </div>
                  );
                })()}
                {!previewUrl && (
                  <div className="w-full h-full bg-gold/10 flex items-center justify-center">
                    <User size={32} className="text-gold" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <label
                  htmlFor="team-image-upload"
                  className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-[4px] cursor-pointer bg-white hover:bg-gray-50 hover:border-gold transition-colors"
                >
                  <Upload size={18} className="text-charcoal" />
                  <span className="text-sm font-bold text-charcoal">
                    {previewUrl || selectedFile ? 'Change Image' : 'Upload Image'}
                  </span>
                </label>
                <input
                  type="file"
                  className="hidden"
                  accept=".png,.jpeg,.jpg,.pdf"
                  onChange={handleFileSelect}
                  id="team-image-upload"
                />
                {selectedFile && (
                  <div className="mt-2 flex items-center gap-2">
                    <p className="text-xs text-neutral">
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-xs text-red-500 hover:text-red-700 transition-colors"
                      title="Remove file"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                {!selectedFile && previewUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="mt-2 text-xs text-red-500 hover:text-red-700 transition-colors"
                    title="Remove image"
                  >
                    Remove image
                  </button>
                )}
                <p className="text-xs text-neutral mt-1">PNG, JPEG, or PDF (max 300KB)</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Description (Optional, max 1500 characters)</label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 1500) {
                  setFormData({ ...formData, description: value });
                }
              }}
              className={`w-full p-3 rounded-[4px] border focus:outline-none resize-none ${
                formData.description.length > 1500 ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-gold'
              }`}
              placeholder="Notes (e.g. baptised elsewhere)"
              rows={6}
              maxLength={1500}
            />
            <p className={`text-xs mt-1 ${formData.description.length > 1500 ? 'text-red-500' : 'text-neutral'}`}>
              {formData.description.length}/1500 characters
            </p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingMember(null);
                resetModal();
              }}
              className="px-6 py-2 border border-gray-200 rounded-[4px] text-charcoal hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <GlowingButton onClick={editingMember ? handleUpdate : handleCreate} disabled={formInvalid}>
              {isUploading ? 'Uploading...' : editingMember ? 'Update Person' : 'Add Person'}
            </GlowingButton>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={deleteTarget != null}
        onClose={() => {
          if (isDeleting) return;
          setDeleteTarget(null);
          setDeleteConfirmText('');
        }}
        title="Delete person permanently?"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <div className="rounded-[8px] border border-red-200 bg-red-50 p-4 text-sm text-red-900">
              <p className="font-bold">This action is permanent and cannot be undone.</p>
              <p className="mt-2">
                All {PEOPLE_LABEL} data for <span className="font-bold">{deleteTarget.name}</span> will be removed from the
                database, including groups, job roles, and any linked profile information.
              </p>
            </div>
            <p className="text-sm text-neutral">
              To confirm, type the person&apos;s name exactly: <span className="font-bold text-charcoal">{deleteTarget.name}</span>
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-red-400 focus:outline-none"
              placeholder={deleteTarget.name}
              autoComplete="off"
            />
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteConfirmText('');
                }}
                className="px-6 py-2 border border-gray-200 rounded-[4px] text-charcoal hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!deleteNameMatches || isDeleting}
                onClick={handleDeleteConfirm}
                className="px-6 py-2 rounded-[4px] font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting…' : 'Delete permanently'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={archiveTarget != null}
        onClose={() => {
          if (isArchiving) return;
          setArchiveTarget(null);
        }}
        title="Archive person?"
      >
        {archiveTarget && (
          <div className="space-y-4">
            <p className="text-sm text-neutral">
              <span className="font-bold text-charcoal">{archiveTarget.name}</span> will be hidden from the public site,
              {PEOPLE_LABEL}, and rosters. Only admins can view archived people and restore them later.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-2">
              <button
                type="button"
                disabled={isArchiving}
                onClick={() => setArchiveTarget(null)}
                className="px-6 py-2 border border-gray-200 rounded-[4px] text-charcoal hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <GlowingButton onClick={handleArchiveConfirm} disabled={isArchiving}>
                {isArchiving ? 'Archiving…' : 'Archive'}
              </GlowingButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
