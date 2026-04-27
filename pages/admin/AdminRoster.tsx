import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Calendar } from 'lucide-react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';
import type { Group, JobRole, RosterImage, TeamMember } from '../../types';
import { supabase } from '../../lib/supabase';
import { SkeletonPageHeader } from '../../components/UI/Skeleton';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';

type RosterRow = RosterImage & { groups?: Pick<Group, 'id' | 'name'> | null };

function formatDateShort(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateLong(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getRosterRange(roster: RosterImage): { from: string | null; to: string | null } {
  const from = (roster.date_from || roster.date || null) as string | null;
  const to = (roster.date_to || roster.date || null) as string | null;
  return { from, to };
}

function getStoragePathFromPublicUrl(publicUrl: string): string | null {
  // Supabase public URL format typically contains ".../object/public/<bucket>/<path>"
  // We need "<path>" to remove it from the bucket.
  try {
    const u = new URL(publicUrl);
    const marker = '/roster-images/';
    const idx = u.pathname.indexOf(marker);
    if (idx === -1) return null;
    return u.pathname.slice(idx + marker.length);
  } catch {
    const marker = '/roster-images/';
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return null;
    return publicUrl.slice(idx + marker.length);
  }
}

export const AdminRoster = () => {
  const [rosterImages, setRosterImages] = useState<RosterRow[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [leaderByGroup, setLeaderByGroup] = useState<Map<string, { name: string; img?: string | null }>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setIsLoading(true);
    try {
      const [{ data: g, error: gErr }, { data: r, error: rErr }] = await Promise.all([
        supabase.from('groups').select('id, name, slug, sort_order, is_active').order('sort_order', { ascending: true }).order('name', { ascending: true }),
        supabase
          .from('roster_images')
          .select('id, group_id, date, date_from, date_to, pdf_url, created_at, updated_at, groups:groups(id, name)')
          .order('date_from', { ascending: false })
          .order('created_at', { ascending: false }),
      ]);
      if (gErr) throw gErr;
      if (rErr) throw rErr;

      const gg = ((g || []) as Group[]).filter((x) => x.is_active !== false);
      setGroups(gg);
      setRosterImages((r || []) as RosterRow[]);

      // Resolve leaders for groups visible here (based on job role naming rule)
      const groupIds = gg.map((x) => x.id);
      if (groupIds.length) {
        const { data: leadersRaw, error: leadersErr } = await supabase
          .from('team_members')
          .select(
            `
            id,
            name,
            img,
            team_member_groups:team_member_groups(group_id),
            team_member_job_roles:team_member_job_roles(
              job_roles:job_roles(id, name)
            )
          `
          )
          .in('team_member_groups.group_id', groupIds);

        if (leadersErr) throw leadersErr;

        const leaders = new Map<string, { name: string; img?: string | null }>();
        (leadersRaw || []).forEach((row: any) => {
          const member: TeamMember = row as TeamMember;
          const memberGroupIds: string[] = (row.team_member_groups || []).map((x: any) => x.group_id).filter(Boolean);
          const memberRoleNames: string[] = (row.team_member_job_roles || [])
            .map((x: any) => (x.job_roles as JobRole | null)?.name)
            .filter(Boolean);

          memberGroupIds.forEach((gid) => {
            if (leaders.has(gid)) return;
            const groupName = gg.find((x) => x.id === gid)?.name;
            if (!groupName) return;
            const requiredRole = `${groupName} Leader`;
            if (!memberRoleNames.includes(requiredRole)) return;
            leaders.set(gid, { name: member.name, img: member.img });
          });
        });

        setLeaderByGroup(leaders);
      } else {
        setLeaderByGroup(new Map());
      }
    } catch (error) {
      console.error('Error loading roster admin data:', error);
      alert('Failed to load roster data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRosterImages = async () => {
    try {
      const { data, error } = await supabase
        .from('roster_images')
        .select('id, group_id, date, date_from, date_to, pdf_url, created_at, updated_at, groups:groups(id, name)')
        .order('date_from', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRosterImages((data || []) as RosterRow[]);
    } catch (error) {
      console.error('Error fetching roster images:', error);
      alert('Failed to load roster images');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file');
        return;
      }
      setSelectedFile(file);
      
      // Create preview URL for PDF
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedGroupId || !dateFrom || !dateTo) {
      alert('Please select a ministry, date range, and a PDF file');
      return;
    }

    setIsUploading(true);

    try {
      const group = groups.find((g) => g.id === selectedGroupId) || null;
      if (!group) {
        alert('Please select a valid ministry.');
        return;
      }

      // Upload PDF to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop() || 'pdf';
      const safeSlug = (group.slug || group.name || 'ministry').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const fileName = `roster-images/${safeSlug}-${dateFrom}-${dateTo}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('roster-images')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage.from('roster-images').getPublicUrl(fileName);

      // Check if roster PDF already exists for this ministry + date range
      const { data: existing, error: checkError } = await supabase
        .from('roster_images')
        .select('id, pdf_url')
        .eq('group_id', selectedGroupId)
        .eq('date_from', dateFrom)
        .eq('date_to', dateTo)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid error when no record exists

      let result;
      if (existing && !checkError) {
        // Update existing record
        // Delete old PDF from storage if it exists
        if (existing.pdf_url) {
          const oldPath = getStoragePathFromPublicUrl(existing.pdf_url);
          if (oldPath) {
            await supabase.storage.from('roster-images').remove([oldPath]);
          }
        }

        const { data, error } = await supabase
          .from('roster_images')
          .update({ pdf_url: urlData.publicUrl })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('roster_images')
          .insert([
            {
              group_id: selectedGroupId,
              date_from: dateFrom,
              date_to: dateTo,
              // Keep legacy date populated for older queries; set to date_from.
              date: dateFrom,
              pdf_url: urlData.publicUrl,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      // Refresh the list
      await fetchRosterImages();
      
      setSelectedFile(null);
      setPreviewUrl(null);
      setSelectedGroupId('');
      setDateFrom('');
      setDateTo('');
      setIsUploadModalOpen(false);
      alert('Roster PDF uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading roster PDF:', error);
      let errorMessage = 'Failed to upload roster PDF';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.code === 'PGRST116') {
        errorMessage = 'Table "roster_images" does not exist. Please run the SQL migration script first.';
      } else if (error.code === '42703') {
        errorMessage = 'Column "pdf_url" does not exist. Please run the SQL migration script to update the table schema.';
      } else if (error.status === 400) {
        errorMessage = 'Database error: The roster_images table may not exist or has the wrong schema. Please run the SQL migration script.';
      }
      
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, pdfUrl: string) => {
    if (!window.confirm('Are you sure you want to delete this roster PDF?')) {
      return;
    }

    try {
      // Delete PDF from storage
      const path = getStoragePathFromPublicUrl(pdfUrl);
      if (path) {
        await supabase.storage.from('roster-images').remove([path]);
      }

      // Delete record from database
      const { error } = await supabase.from('roster_images').delete().eq('id', id);

      if (error) throw error;

      setRosterImages(rosterImages.filter(img => img.id !== id));
    } catch (error: any) {
      console.error('Error deleting roster PDF:', error);
      alert(error.message || 'Failed to delete roster PDF');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SkeletonPageHeader />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Roster Management"
        subtitle="Upload roster PDFs per ministry (group) and date range."
        icon={<Calendar size={28} />}
        rightSlot={
          <GlowingButton size="sm" fullWidth className="md:w-auto" onClick={() => setIsUploadModalOpen(true)}>
            <Upload size={16} className="mr-2" />
            Upload Roster PDF
          </GlowingButton>
        }
      />

      {rosterImages.length === 0 ? (
        <div className="text-center py-12 glass-card bg-white/80 border border-white/60 rounded-[12px]">
          <FileText size={48} className="mx-auto text-neutral mb-4" />
          <p className="text-neutral text-lg mb-2">No roster PDFs uploaded yet</p>
          <p className="text-neutral text-sm">Upload your first roster PDF to get started</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rosterImages.map((rosterImage) => (
            <div
              key={rosterImage.id}
              className="glass-card bg-white/80 border border-white/60 rounded-[12px] p-6 hover:border-gold hover:shadow-md transition-all group relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={() => handleDelete(rosterImage.id, rosterImage.pdf_url)}
                  className="p-2 bg-white border border-gray-200 rounded-[4px] text-neutral hover:text-red-500 hover:border-red-200 transition-colors shadow-sm"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-charcoal truncate">
                      {rosterImage.groups?.name || 'Ministry'}
                    </p>
                    {rosterImage.group_id && (
                      <p className="text-xs text-neutral mt-1">
                        {leaderByGroup.get(rosterImage.group_id)?.name
                          ? `Leader: ${leaderByGroup.get(rosterImage.group_id)?.name}`
                          : 'Leader: —'}
                      </p>
                    )}
                  </div>
                  {rosterImage.group_id && leaderByGroup.get(rosterImage.group_id)?.img ? (
                    <img
                      src={leaderByGroup.get(rosterImage.group_id)?.img as string}
                      alt={leaderByGroup.get(rosterImage.group_id)?.name || 'Leader'}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                    />
                  ) : null}
                </div>

                <div className="flex items-center gap-2 text-gold mt-3">
                  <Calendar size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {(() => {
                      const { from, to } = getRosterRange(rosterImage);
                      if (!from && !to) return 'Roster';
                      if (from && to && from !== to) return `${formatDateShort(from)} – ${formatDateShort(to)}`;
                      const single = from || to;
                      return single ? formatDateShort(single) : 'Roster';
                    })()}
                  </span>
                </div>
                {(() => {
                  const { from } = getRosterRange(rosterImage);
                  return from ? <p className="text-sm text-neutral mt-1">{formatDateLong(from)}</p> : null;
                })()}

                {rosterImage.created_at ? (
                  <p className="text-xs text-neutral mt-2">Uploaded: {formatDateTime(rosterImage.created_at)}</p>
                ) : null}
              </div>

              <div className="aspect-video bg-gray-100 rounded-[4px] overflow-hidden border border-gray-200 flex items-center justify-center">
                <FileText size={48} className="text-neutral" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedFile(null);
          setPreviewUrl(null);
          setSelectedGroupId('');
          setDateFrom('');
          setDateTo('');
        }}
        title="Upload Roster PDF"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">
              Ministry / Group *
            </label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none bg-white"
              required
            >
              <option value="">Select ministry</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2">
                Roster date from *
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2">
                Roster date to *
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Roster PDF *</label>
            <div className="border-2 border-dashed border-gray-300 rounded-[4px] p-6 text-center hover:border-gold transition-colors">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="roster-pdf-upload"
              />
              <label htmlFor="roster-pdf-upload" className="cursor-pointer">
                <FileText size={32} className="mx-auto text-neutral mb-2" />
                <p className="text-sm text-charcoal font-bold">
                  {selectedFile ? selectedFile.name : 'Click to upload PDF'}
                </p>
                <p className="text-xs text-neutral mt-1">
                  {selectedFile ? 'Click to change' : 'or drag and drop'}
                </p>
              </label>
            </div>
          </div>

          {previewUrl && selectedFile && (
            <div className="mt-4">
              <p className="text-sm font-bold text-charcoal mb-2">Preview:</p>
              <div className="border border-gray-200 rounded-[4px] overflow-hidden">
                <iframe
                  src={previewUrl}
                  className="w-full h-96 bg-gray-50"
                  title="PDF Preview"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => {
                setIsUploadModalOpen(false);
                setSelectedFile(null);
                setPreviewUrl(null);
                setSelectedGroupId('');
                setDateFrom('');
                setDateTo('');
              }}
              className="px-6 py-2 border border-gray-200 rounded-[4px] text-charcoal hover:bg-gray-50 transition-colors"
              disabled={isUploading}
            >
              Cancel
            </button>
            <GlowingButton
              onClick={handleUpload}
              disabled={!selectedFile || !selectedGroupId || !dateFrom || !dateTo || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload PDF'}
            </GlowingButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};
