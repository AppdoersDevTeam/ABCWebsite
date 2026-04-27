import React, { useState, useEffect, useMemo } from 'react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';
import { CalendarDays, Edit, Trash2, User, Upload, X, UserPlus, Download, Search, ChevronDown } from 'lucide-react';
import type { Group, JobRole, TeamMember } from '../../types';
import { supabase } from '../../lib/supabase';
import { SkeletonPageHeader } from '../../components/UI/Skeleton';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';
import { buildStoredRole, getDisplayRole, inferProfileType } from '../../lib/teamMemberUtils';
import { downloadDirectoryCsv, downloadDirectoryPdf } from '../../lib/exportDirectoryPeople';
import metadata from '../../metadata.json';

type ProfileType = 'staff' | 'attendee' | 'member';

const PROFILE_LABEL: Record<ProfileType, string> = {
  staff: 'Staff',
  attendee: 'Attendee',
  member: 'Member',
};

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
  has_membership_chip: false,
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
  has_membership_chip: boolean;
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
    has_membership_chip: pt === 'member' ? (m.has_membership_chip ?? false) : false,
  };
}

export const AdminTeam = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [directorySetupWarning, setDirectorySetupWarning] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [selectedProfileTypes, setSelectedProfileTypes] = useState<Record<ProfileType, boolean>>({
    staff: true,
    member: true,
    attendee: true,
  });
  const [selectedGroupIds, setSelectedGroupIds] = useState<Record<string, boolean>>({});
  const [selectedJobRoleIds, setSelectedJobRoleIds] = useState<Record<string, boolean>>({});
  const [searchText, setSearchText] = useState('');
  const [sortKey, setSortKey] = useState<
    'name' | 'email' | 'phone' | 'role' | 'baptism_date' | 'membership_start_date' | 'status' | 'groups' | 'job_roles'
  >('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const anyGroupSelectedUI = useMemo(() => Object.values(selectedGroupIds).some(Boolean), [selectedGroupIds]);
  const anyJobRoleSelectedUI = useMemo(() => Object.values(selectedJobRoleIds).some(Boolean), [selectedJobRoleIds]);
  const allProfileTypesSelectedUI = useMemo(
    () => (Object.keys(PROFILE_LABEL) as ProfileType[]).every((pt) => selectedProfileTypes[pt]),
    [selectedProfileTypes]
  );

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const pt = inferProfileType(m);
      if (!selectedProfileTypes[pt]) return false;

      const anyGroupSelected = Object.values(selectedGroupIds).some(Boolean);
      if (anyGroupSelected) {
        const memberGroupIds = new Set((m.groups || []).map((g) => g.id));
        const ok = Object.entries(selectedGroupIds).some(([id, on]) => on && memberGroupIds.has(id));
        if (!ok) return false;
      }

      const anyRoleSelected = Object.values(selectedJobRoleIds).some(Boolean);
      if (anyRoleSelected) {
        const memberRoleIds = new Set((m.job_roles || []).map((r) => r.id));
        const ok = Object.entries(selectedJobRoleIds).some(([id, on]) => on && memberRoleIds.has(id));
        if (!ok) return false;
      }

      return true;
    });
  }, [members, selectedProfileTypes, selectedGroupIds, selectedJobRoleIds]);

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

    const toStr = (v: unknown) => String(v ?? '').trim().toLowerCase();

    const toDateValue = (v: unknown): number | null => {
      const s = String(v ?? '').trim();
      if (!s) return null;
      // Expect YYYY-MM-DD; Date.parse is fine for ISO-ish strings.
      const t = Date.parse(s);
      return Number.isFinite(t) ? t : null;
    };

    const getGroupsStr = (m: TeamMember) => (m.groups || []).map((g) => g.name).filter(Boolean).join(' ');
    const getJobRolesStr = (m: TeamMember) => (m.job_roles || []).map((r) => r.name).filter(Boolean).join(' ');
    const getStatusStr = (m: TeamMember) => PROFILE_LABEL[inferProfileType(m)];

    const cmpStr = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'base' });
    const cmpDate = (a: number | null, b: number | null) => {
      if (a === null && b === null) return 0;
      if (a === null) return sortDir === 'asc' ? 1 : -1;
      if (b === null) return sortDir === 'asc' ? -1 : 1;
      return a - b;
    };

    const out = [...visibleMembers].sort((a, b) => {
      let c = 0;
      switch (sortKey) {
        case 'name':
          c = cmpStr(toStr(a.name), toStr(b.name));
          break;
        case 'email':
          c = cmpStr(toStr(a.email), toStr(b.email));
          break;
        case 'phone':
          c = cmpStr(toStr(a.phone), toStr(b.phone));
          break;
        case 'role':
          c = cmpStr(toStr(getDisplayRole(a)), toStr(getDisplayRole(b)));
          break;
        case 'status':
          c = cmpStr(toStr(getStatusStr(a)), toStr(getStatusStr(b)));
          break;
        case 'groups':
          c = cmpStr(toStr(getGroupsStr(a)), toStr(getGroupsStr(b)));
          break;
        case 'job_roles':
          c = cmpStr(toStr(getJobRolesStr(a)), toStr(getJobRolesStr(b)));
          break;
        case 'baptism_date':
          c = cmpDate(toDateValue(a.baptism_date), toDateValue(b.baptism_date));
          break;
        case 'membership_start_date':
          c = cmpDate(toDateValue(a.membership_start_date), toDateValue(b.membership_start_date));
          break;
        default:
          c = 0;
      }

      if (c !== 0) return c * dir;
      // Tie-breaker: name
      return cmpStr(toStr(a.name), toStr(b.name));
    });

    return out;
  }, [sortDir, sortKey, visibleMembers]);

  const clearFilters = () => {
    setSearchText('');
    setSelectedProfileTypes({ staff: true, member: true, attendee: true });
    setSelectedGroupIds({});
    setSelectedJobRoleIds({});
    setSortKey('name');
    setSortDir('asc');
  };

  const selectAllProfileTypes = () => setSelectedProfileTypes({ staff: true, member: true, attendee: true });
  const selectAllGroups = () => setSelectedGroupIds({});
  const selectAllJobRoles = () => setSelectedJobRoleIds({});

  const filenameBase = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `directory-people-${yyyy}-${mm}-${dd}`;
  }, []);

  /** Normalized emails that appear on more than one directory row (data hygiene warning). */
  const duplicateEmails = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of members) {
      const e = (m.email || '').trim().toLowerCase();
      if (!e) continue;
      counts.set(e, (counts.get(e) || 0) + 1);
    }
    return new Set([...counts.entries()].filter(([, n]) => n > 1).map(([e]) => e));
  }, [members]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchMembers();
    fetchLookups();
  }, []);

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
      alert('Failed to load team members');
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
    if (trimmed.description.length > 350) return 'Description must not exceed 350 characters.';

    if (trimmed.profile_type === 'staff' && formData.job_role_ids.length === 0) {
      return 'Select at least one job role for staff.';
    }

    // Baptism rules:
    // - Staff & Member: must choose Yes/No. If Yes => date required
    // - Attendee: optional Yes/No. If Yes => date optional
    const baptismRequired = trimmed.profile_type === 'staff' || trimmed.profile_type === 'member';
    if (baptismRequired && formData.is_baptised === null) {
      return 'Please select Baptised: Yes or No.';
    }
    const baptismYes = formData.is_baptised === true;
    if (baptismYes && baptismRequired && !formData.baptism_date.trim()) {
      return 'Baptism date is required when Baptised is Yes.';
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
      row.has_membership_chip = !!formData.has_membership_chip;
    } else {
      // Staff/Attendee may optionally store baptism info too
      row.is_baptised = formData.is_baptised;
      row.baptism_date =
        formData.is_baptised === true && formData.baptism_date.trim()
          ? formData.baptism_date.trim()
          : null;
      row.membership_start_date = pt === 'staff' ? trimmed.membership_start_date.trim() || null : null;
      row.has_membership_chip = false;
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

      await fetchMembers();
      resetModal();
      setIsModalOpen(false);
    } catch (error: unknown) {
      console.error('Error creating team member:', error);
      const msg = error instanceof Error ? error.message : 'Failed to create team member';
      alert(
        msg +
          '\n\nIf the database is missing new columns, run ADD_TEAM_MEMBER_PROFILE_FIELDS.sql in Supabase.'
      );
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

      await fetchMembers();
      resetModal();
      setEditingMember(null);
      setIsModalOpen(false);
    } catch (error: unknown) {
      console.error('Error updating team member:', error);
      const msg = error instanceof Error ? error.message : 'Failed to update team member';
      alert(
        msg +
          '\n\nIf the database is missing new columns, run ADD_TEAM_MEMBER_PROFILE_FIELDS.sql in Supabase.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) {
      return;
    }

    try {
      const { error } = await supabase.from('team_members').delete().eq('id', id);

      if (error) throw error;

      setMembers(members.filter((m) => m.id !== id));
    } catch (error: unknown) {
      console.error('Error deleting team member:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete team member');
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
      has_membership_chip: profile_type === 'member' ? prev.has_membership_chip : false,
      membership_start_date: profile_type === 'attendee' ? '' : prev.membership_start_date,
      group_ids: profile_type === 'attendee' ? [] : prev.group_ids,
      job_role_ids: profile_type === 'attendee' ? [] : prev.job_role_ids,
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SkeletonPageHeader />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const trimmed = trimForm();
  const validationError = validate(trimmed);
  const formInvalid =
    !!validationError ||
    (photoRequired && !hasPhoto) ||
    isUploading ||
    !trimmed.name ||
    !trimmed.email ||
    !trimmed.phone;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Directory / People"
        subtitle="Manage staff, attendees, and members in the directory."
        icon={<User size={28} />}
        rightSlot={
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => downloadDirectoryCsv(sortedVisibleMembers, filenameBase, { churchName, exportedAt: new Date() })}
              className="bg-white border-2 border-gray-200 text-charcoal px-4 py-2 rounded-[4px] font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 text-sm"
              title="Download CSV (filtered)"
            >
              <Download size={16} />
              CSV
            </button>
            <button
              type="button"
              onClick={() => downloadDirectoryPdf(sortedVisibleMembers, filenameBase, { churchName, exportedAt: new Date() })}
              className="bg-white border-2 border-gray-200 text-charcoal px-4 py-2 rounded-[4px] font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 text-sm"
              title="Download PDF (filtered)"
            >
              <Download size={16} />
              PDF
            </button>
            <GlowingButton size="sm" fullWidth className="md:w-auto" onClick={openCreateModal}>
              <UserPlus size={16} className="mr-2" />
              Add Person
            </GlowingButton>
          </div>
        }
      />

      {directorySetupWarning && (
        <div className="glass-card bg-white/80 border border-amber-200 rounded-[12px] p-4 text-sm text-amber-800">
          {directorySetupWarning}
        </div>
      )}

      <div className="glass-card bg-white/80 border border-white/60 rounded-[12px] p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="flex-1">
            <label className="block text-sm font-bold text-charcoal mb-2">Search</label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-[6px] border border-gray-200 focus:border-gold focus:outline-none bg-white"
                placeholder="Search name, email, phone, role, groups, job roles…"
              />
              {searchText.trim() && (
                <button
                  type="button"
                  onClick={() => setSearchText('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral hover:text-charcoal transition-colors"
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-end justify-between lg:justify-end gap-3">
            <div className="text-xs text-neutral pb-1">
              Showing <span className="font-bold text-charcoal">{visibleMembers.length}</span> of{' '}
              <span className="font-bold text-charcoal">{members.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral mb-1">Sort by</label>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as any)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-[6px] text-sm font-bold text-charcoal hover:border-gold focus:border-gold focus:outline-none transition-colors"
                >
                  <option value="name">Alphabetic (Name)</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="role">Role</option>
                  <option value="status">Status</option>
                  <option value="groups">Groups</option>
                  <option value="job_roles">Job roles</option>
                  <option value="baptism_date">Date of Baptism</option>
                  <option value="membership_start_date">Date of Membership</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                className="mt-[18px] px-3 py-2 bg-white border border-gray-200 rounded-[6px] text-sm font-bold text-neutral hover:text-charcoal hover:border-gold transition-colors"
                title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortDir === 'asc' ? 'A→Z' : 'Z→A'}
              </button>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 bg-white border border-gray-200 rounded-[6px] text-sm font-bold text-neutral hover:text-charcoal hover:border-gold transition-colors"
              title="Clear all filters"
            >
              Clear
            </button>
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-charcoal mb-3">Profile type</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={selectAllProfileTypes}
              className={`inline-flex items-center px-3 py-2 rounded-[6px] border text-sm font-bold transition-colors ${
                allProfileTypesSelectedUI
                  ? 'border-gold bg-gold/10 text-charcoal'
                  : 'border-gray-200 bg-white text-neutral hover:text-charcoal hover:border-gold'
              }`}
              title="All profile types"
            >
              All
            </button>
            {(Object.keys(PROFILE_LABEL) as ProfileType[]).map((pt) => {
              const checked = selectedProfileTypes[pt];
              return (
                <label key={pt} className="cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={checked}
                    onChange={() =>
                      setSelectedProfileTypes((prev) => ({
                        ...prev,
                        [pt]: !prev[pt],
                      }))
                    }
                  />
                  <span className="inline-flex items-center px-3 py-2 rounded-[6px] border border-gray-200 bg-white text-sm font-bold text-neutral peer-checked:border-gold peer-checked:bg-gold/10 peer-checked:text-charcoal transition-colors">
                    {PROFILE_LABEL[pt]}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {(groups.length > 0 || jobRoles.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {groups.length > 0 && (
              <details className="rounded-[10px] border border-gray-200 bg-white/70 overflow-hidden">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-charcoal">Groups</span>
                    <span className="text-xs text-neutral">
                      {anyGroupSelectedUI ? `${Object.values(selectedGroupIds).filter(Boolean).length} selected` : 'All'}
                    </span>
                  </div>
                  <ChevronDown size={18} className="text-neutral" />
                </summary>
                <div className="px-4 pb-4">
                  <div className="pt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllGroups}
                      className={`inline-flex items-center px-3 py-2 rounded-[6px] border text-sm font-bold transition-colors ${
                        !anyGroupSelectedUI
                          ? 'border-gold bg-gold/10 text-charcoal'
                          : 'border-gray-200 bg-white text-neutral hover:text-charcoal hover:border-gold'
                      }`}
                      title="All groups"
                    >
                      All
                    </button>
                  </div>
                  <div className="pt-3 flex flex-wrap gap-2">
                  {groups
                    .filter((g) => g.is_active !== false)
                    .map((g) => {
                      const checked = !!selectedGroupIds[g.id];
                      return (
                        <label key={g.id} className="cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={checked}
                            onChange={() =>
                              setSelectedGroupIds((prev) => ({
                                ...prev,
                                [g.id]: !prev[g.id],
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
              </details>
            )}

            {jobRoles.length > 0 && (
              <details className="rounded-[10px] border border-gray-200 bg-white/70 overflow-hidden">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-charcoal">Job roles</span>
                    <span className="text-xs text-neutral">
                      {anyJobRoleSelectedUI ? `${Object.values(selectedJobRoleIds).filter(Boolean).length} selected` : 'All'}
                    </span>
                  </div>
                  <ChevronDown size={18} className="text-neutral" />
                </summary>
                <div className="px-4 pb-4">
                  <div className="pt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllJobRoles}
                      className={`inline-flex items-center px-3 py-2 rounded-[6px] border text-sm font-bold transition-colors ${
                        !anyJobRoleSelectedUI
                          ? 'border-gold bg-gold/10 text-charcoal'
                          : 'border-gray-200 bg-white text-neutral hover:text-charcoal hover:border-gold'
                      }`}
                      title="All job roles"
                    >
                      All
                    </button>
                  </div>
                  <div className="pt-3 flex flex-wrap gap-2">
                  {jobRoles
                    .filter((r) => r.is_active !== false)
                    .map((r) => {
                      const checked = !!selectedJobRoleIds[r.id];
                      return (
                        <label key={r.id} className="cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={checked}
                            onChange={() =>
                              setSelectedJobRoleIds((prev) => ({
                                ...prev,
                                [r.id]: !prev[r.id],
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
                </div>
              </details>
            )}
          </div>
        )}
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12 glass-card bg-white/80 border border-white/60 rounded-[12px]">
          <p className="text-neutral">No team members yet. Add your first team member to get started.</p>
        </div>
      ) : visibleMembers.length === 0 ? (
        <div className="text-center py-12 glass-card bg-white/80 border border-white/60 rounded-[12px]">
          <p className="text-neutral">No results match the selected filters.</p>
        </div>
      ) : (
        <div className="glass-card bg-white/80 border border-white/60 rounded-[12px] overflow-hidden">
          {duplicateEmails.size > 0 && (
            <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 text-sm text-amber-900">
              <p className="font-bold">Duplicate directory emails detected</p>
              <p className="text-amber-800 mt-1">
                Some people share the same email address. User ↔ Directory auto-link and roster permissions use
                email matching — resolve duplicates in Directory so each login email maps to one person.
              </p>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left">
              <thead className="bg-white/60 sticky top-0">
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral">Name</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral">Email</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral">Phone</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral">Role</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral">Groups</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral">Job Roles</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral">Status</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral w-[140px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedVisibleMembers.map((member, idx) => {
                  const pt = inferProfileType(member);
                  const emailKey = (member.email || '').trim().toLowerCase();
                  const dupEmail = !!emailKey && duplicateEmails.has(emailKey);
                  return (
                    <tr
                      key={member.id}
                      className={`border-b border-gray-100 hover:bg-gold/5 transition-colors ${
                        idx % 2 === 0 ? 'bg-white/40' : 'bg-white/20'
                      } ${dupEmail ? 'ring-1 ring-inset ring-amber-200' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-bold text-charcoal">{member.name}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.user_id ? (
                            <span className="text-[10px] font-bold uppercase tracking-wide text-green-800 bg-green-100 px-2 py-0.5 rounded">
                              Linked account
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase tracking-wide text-neutral bg-gray-100 px-2 py-0.5 rounded">
                              No account link
                            </span>
                          )}
                          {dupEmail && (
                            <span className="text-[10px] font-bold uppercase tracking-wide text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                              Duplicate email
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral">{member.email || '-'}</td>
                      <td className="px-4 py-3 text-sm text-neutral">{member.phone || '-'}</td>
                      <td className="px-4 py-3 text-sm text-charcoal font-bold">{getDisplayRole(member)}</td>
                      <td className="px-4 py-3 text-sm text-neutral">
                        {(member.groups || []).map((g) => g.name).filter(Boolean).join(', ') || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral">
                        {(member.job_roles || []).map((r) => r.name).filter(Boolean).join(', ') || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-gold/10 text-gold text-[11px] font-bold uppercase tracking-wider">
                          {PROFILE_LABEL[pt]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(member)}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-[4px] text-neutral hover:text-gold hover:border-gold transition-colors text-sm font-bold inline-flex items-center gap-2"
                            title="Edit"
                          >
                            <Edit size={16} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="px-3 py-2 bg-white border border-red-200 rounded-[4px] text-red-600 hover:bg-red-50 transition-colors text-sm font-bold inline-flex items-center gap-2"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMember(null);
          resetModal();
        }}
        title={editingMember ? 'Edit Team Member' : 'Add Team Member'}
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
            <p className="text-xs text-neutral mt-1">Staff, Attendee, or Member (church directory).</p>
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
                if (/^[0-9\s\-()]*$/.test(value)) {
                  setFormData({ ...formData, phone: value });
                }
              }}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              placeholder="03-308 5409"
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
                    Baptism date {(formData.profile_type === 'staff' || formData.profile_type === 'member') ? '*' : '(optional)'}
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
                    {formData.profile_type === 'attendee'
                      ? 'Optional for attendees.'
                      : 'Required when Baptised is Yes.'}
                  </p>
                </div>
              )}

              {formData.profile_type === 'member' && (
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.has_membership_chip}
                      onChange={(e) => setFormData({ ...formData, has_membership_chip: e.target.checked })}
                    />
                    <span className="text-sm font-bold text-charcoal">Assign membership chip</span>
                  </label>
                  <p className="text-xs text-neutral mt-1">Only applies to members. Cannot be enabled for Staff or Attendee.</p>
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
                    return <img src={previewUrl} alt="Team member" className="w-full h-full object-cover" />;
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
            <label className="block text-sm font-bold text-charcoal mb-2">Description (Optional, max 350 characters)</label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 350) {
                  setFormData({ ...formData, description: value });
                }
              }}
              className={`w-full p-3 rounded-[4px] border focus:outline-none resize-none ${
                formData.description.length > 350 ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-gold'
              }`}
              placeholder="Notes (e.g. baptised elsewhere)"
              rows={3}
              maxLength={350}
            />
            <p className={`text-xs mt-1 ${formData.description.length > 350 ? 'text-red-500' : 'text-neutral'}`}>
              {formData.description.length}/350 characters
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4">
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
    </div>
  );
};
