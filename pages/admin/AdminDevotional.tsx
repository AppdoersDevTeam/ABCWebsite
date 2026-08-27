import React, { useState, useEffect } from 'react';
import { BookOpen, Upload, Trash2, Eye, Pencil } from 'lucide-react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';
import { DocumentReaderPanel } from '../../components/UI/DocumentReaderPanel';
import { supabase } from '../../lib/supabase';
import { Devotional as DevotionalType } from '../../types';
import { SkeletonPageHeader, SkeletonCard } from '../../components/UI/Skeleton';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';
import { logAuditEventSafe } from '../../lib/auditLog';

function storagePathFromPublicUrl(pdfUrl: string, bucket: string): string | null {
  const marker = `/object/public/${bucket}/`;
  const idx = pdfUrl.indexOf(marker);
  if (idx >= 0) return decodeURIComponent(pdfUrl.slice(idx + marker.length).split('?')[0]);
  const parts = pdfUrl.split(`/${bucket}/`);
  if (parts.length > 1) return decodeURIComponent(parts[1].split('?')[0]);
  return pdfUrl.split('/').pop() || null;
}

function formatWeekDate(weekDate: string): string {
  const d = new Date(`${weekDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return weekDate;
  return d.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const AdminDevotional = () => {
  const [devotionals, setDevotionals] = useState<DevotionalType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', subtitle: '', weekDate: '', file: null as File | null });
  const [isUploading, setIsUploading] = useState(false);
  const [viewing, setViewing] = useState<DevotionalType | null>(null);
  const [editing, setEditing] = useState<DevotionalType | null>(null);
  const [editData, setEditData] = useState({ title: '', subtitle: '', weekDate: '', file: null as File | null });
  const [isSaving, setIsSaving] = useState(false);

  const resetEditForm = () => {
    setEditing(null);
    setEditData({ title: '', subtitle: '', weekDate: '', file: null });
  };

  const openEdit = (item: DevotionalType) => {
    setEditing(item);
    setEditData({
      title: item.title,
      subtitle: item.subtitle || '',
      weekDate: item.week_date,
      file: null,
    });
  };

  useEffect(() => {
    fetchDevotionals();
  }, []);

  useEffect(() => {
    if (viewing) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [viewing]);

  const fetchDevotionals = async () => {
    try {
      const { data, error } = await supabase
        .from('devotionals')
        .select('*')
        .order('week_date', { ascending: false });

      if (error) throw error;
      setDevotionals(data || []);
    } catch (error) {
      console.error('Error fetching devotionals:', error);
      alert('Failed to load devotionals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadData({ ...uploadData, file: e.target.files[0] });
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditData({ ...editData, file: e.target.files[0] });
    }
  };

  const handleUpload = async () => {
    if (!uploadData.file || !uploadData.title.trim() || !uploadData.subtitle.trim() || !uploadData.weekDate) {
      alert('Please fill in all required fields and select a file');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = uploadData.file.name.split('.').pop();
      const fileName = `devotionals/${uploadData.weekDate}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('devotionals')
        .upload(fileName, uploadData.file, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'application/pdf',
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('devotionals').getPublicUrl(fileName);

      const { data, error: dbError } = await supabase
        .from('devotionals')
        .insert([
          {
            title: uploadData.title.trim(),
            subtitle: uploadData.subtitle.trim(),
            week_date: uploadData.weekDate,
            pdf_url: urlData.publicUrl,
          },
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      logAuditEventSafe({
        action: 'create',
        category: 'devotional',
        entityType: 'devotionals',
        entityId: data.id,
        summary: `Uploaded devotional ${uploadData.title.trim()} — ${uploadData.subtitle.trim()} (${uploadData.weekDate})`,
      });

      setDevotionals([data, ...devotionals].sort((a, b) => b.week_date.localeCompare(a.week_date)));
      setUploadData({ title: '', subtitle: '', weekDate: '', file: null });
      setIsUploadModalOpen(false);
      alert('Devotional uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading devotional:', error);
      alert(error.message || 'Failed to upload devotional');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = async () => {
    if (!editing || !editData.title.trim() || !editData.subtitle.trim() || !editData.weekDate) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSaving(true);

    try {
      let pdfUrl = editing.pdf_url;
      const oldPath = storagePathFromPublicUrl(editing.pdf_url, 'devotionals');

      if (editData.file) {
        const fileExt = editData.file.name.split('.').pop();
        const fileName = `devotionals/${editData.weekDate}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('devotionals')
          .upload(fileName, editData.file, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'application/pdf',
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('devotionals').getPublicUrl(fileName);
        pdfUrl = urlData.publicUrl;

        if (oldPath) {
          await supabase.storage.from('devotionals').remove([oldPath]);
        }
      }

      const { data, error: dbError } = await supabase
        .from('devotionals')
        .update({
          title: editData.title.trim(),
          subtitle: editData.subtitle.trim(),
          week_date: editData.weekDate,
          pdf_url: pdfUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editing.id)
        .select()
        .single();

      if (dbError) throw dbError;

      logAuditEventSafe({
        action: 'update',
        category: 'devotional',
        entityType: 'devotionals',
        entityId: editing.id,
        summary: `Updated devotional ${editData.title.trim()} — ${editData.subtitle.trim()} (${editData.weekDate})`,
      });

      const sorted = devotionals
        .map((d) => (d.id === editing.id ? data : d))
        .sort((a, b) => b.week_date.localeCompare(a.week_date));
      setDevotionals(sorted);
      if (viewing?.id === editing.id) setViewing(data);
      resetEditForm();
      alert('Devotional updated successfully!');
    } catch (error: any) {
      console.error('Error updating devotional:', error);
      alert(error.message || 'Failed to update devotional');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this devotional?')) {
      return;
    }

    try {
      const item = devotionals.find((d) => d.id === id);

      if (item?.pdf_url) {
        const path = storagePathFromPublicUrl(item.pdf_url, 'devotionals');
        if (path) {
          await supabase.storage.from('devotionals').remove([path]);
        }
      }

      const { error } = await supabase.from('devotionals').delete().eq('id', id);

      if (error) throw error;

      logAuditEventSafe({
        action: 'delete',
        category: 'devotional',
        entityType: 'devotionals',
        entityId: id,
        summary: `Deleted devotional ${item?.title || id}`,
      });

      if (viewing?.id === id) setViewing(null);
      setDevotionals(devotionals.filter((d) => d.id !== id));
    } catch (error) {
      console.error('Error deleting devotional:', error);
      alert('Failed to delete devotional');
    }
  };

  const latest = devotionals[0];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SkeletonPageHeader />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <SkeletonCard className="h-96" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} className="h-20" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 min-w-0">
      <AdminPageHeader
        title="Devotional of the Week"
        subtitle="Upload and manage weekly devotionals."
        icon={<BookOpen size={28} />}
        rightSlot={
          <GlowingButton size="sm" fullWidth className="md:w-auto" onClick={() => setIsUploadModalOpen(true)}>
            <Upload size={16} className="mr-2" />
            Upload Devotional
          </GlowingButton>
        }
      />

      {viewing && (
        <div className="md:hidden">
          <DocumentReaderPanel
            label="Reading"
            title={viewing.title}
            subtitle={viewing.subtitle}
            meta={`Week of ${formatWeekDate(viewing.week_date)}`}
            pdfUrl={viewing.pdf_url}
            pdfTitle={viewing.subtitle ? `${viewing.title} — ${viewing.subtitle}` : viewing.title}
            onClose={() => setViewing(null)}
          />
        </div>
      )}

      <div className={`grid md:grid-cols-3 gap-4 md:gap-6 ${viewing ? 'hidden md:grid' : ''}`}>
        <div className="md:col-span-2 min-w-0">
          <div className="bg-gold p-1 rounded-t-[8px] w-fit">
            <span className="text-charcoal font-bold text-xs px-4 uppercase tracking-widest">Latest</span>
          </div>
          <div className="glass-card p-5 sm:p-8 md:p-16 text-center rounded-[8px] rounded-tl-none border-t-0 bg-white shadow-lg">
            <BookOpen className="text-gold mx-auto mb-4 md:mb-6 w-12 h-12 sm:w-16 sm:h-16" />
            <h2 className="text-xl sm:text-2xl md:text-4xl font-serif text-charcoal mb-2 font-normal break-words">
              {latest?.title || 'No Devotional'}
            </h2>
            {latest && (
              <>
                {latest.subtitle && (
                  <p className="text-base sm:text-xl md:text-2xl font-serif text-charcoal/80 mb-2 break-words">
                    {latest.subtitle}
                  </p>
                )}
                <p className="text-neutral mb-6 md:mb-8 font-medium text-sm md:text-base">
                  Week of {formatWeekDate(latest.week_date)}
                </p>
              </>
            )}
            {latest ? (
              <button
                type="button"
                onClick={() => setViewing(latest)}
                className="bg-charcoal text-white px-6 py-3 rounded-[4px] font-bold uppercase tracking-wider hover:bg-gold hover:text-charcoal transition-colors shadow-lg inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px]"
              >
                <Eye size={18} />
                Read Online
              </button>
            ) : (
              <p className="text-neutral">Upload your first weekly devotional to get started</p>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="text-charcoal font-bold uppercase tracking-widest text-xs mb-4">Archive</h3>
          <div className="space-y-3">
            {devotionals.map((item) => (
              <div
                key={item.id}
                className={`glass-card bg-white/80 border p-3 sm:p-4 flex justify-between items-center gap-2 rounded-[10px] transition-all group min-w-0 ${
                  viewing?.id === item.id ? 'border-gold shadow-md' : 'border-white/60 hover:shadow-md hover:border-gold'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setViewing(item)}
                  className="text-left min-w-0 flex-1"
                >
                  <span className="block text-neutral font-medium hover:text-charcoal truncate">{item.title}</span>
                  {item.subtitle && (
                    <span className="block text-sm text-charcoal/70 truncate">{item.subtitle}</span>
                  )}
                  <span className="block text-xs text-neutral/80">Week of {formatWeekDate(item.week_date)}</span>
                </button>
                <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewing(item)}
                    className="p-2 text-neutral hover:text-gold transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={`Read ${item.title}`}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(item);
                    }}
                    className="p-2 text-neutral hover:text-gold transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={`Edit ${item.title}`}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="p-2 text-neutral hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={`Delete ${item.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {viewing && (
        <div className="hidden md:block">
          <DocumentReaderPanel
            label="Reading"
            title={viewing.title}
            subtitle={viewing.subtitle}
            meta={`Week of ${formatWeekDate(viewing.week_date)}`}
            pdfUrl={viewing.pdf_url}
            pdfTitle={viewing.subtitle ? `${viewing.title} — ${viewing.subtitle}` : viewing.title}
            onClose={() => setViewing(null)}
          />
        </div>
      )}

      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setUploadData({ title: '', subtitle: '', weekDate: '', file: null });
        }}
        title="Upload Devotional"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Title *</label>
            <input
              type="text"
              value={uploadData.title}
              onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              placeholder="e.g., Devotional 16"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Subtitle *</label>
            <input
              type="text"
              value={uploadData.subtitle}
              onChange={(e) => setUploadData({ ...uploadData, subtitle: e.target.value })}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              placeholder="e.g., The Trellis and the Vine"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Week Date *</label>
            <input
              type="date"
              value={uploadData.weekDate}
              onChange={(e) => setUploadData({ ...uploadData, weekDate: e.target.value })}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">PDF File *</label>
            <div className="border-2 border-dashed border-gray-300 rounded-[4px] p-6 text-center hover:border-gold transition-colors">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="devotional-upload"
              />
              <label htmlFor="devotional-upload" className="cursor-pointer">
                {uploadData.file ? (
                  <div className="space-y-2">
                    <BookOpen size={32} className="mx-auto text-gold" />
                    <p className="text-sm text-charcoal font-bold">{uploadData.file.name}</p>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setUploadData({ ...uploadData, file: null });
                      }}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload size={32} className="mx-auto text-neutral" />
                    <p className="text-sm text-charcoal">Click to upload PDF</p>
                    <p className="text-xs text-neutral">or drag and drop</p>
                  </div>
                )}
              </label>
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4">
            <button
              onClick={() => {
                setIsUploadModalOpen(false);
                setUploadData({ title: '', subtitle: '', weekDate: '', file: null });
              }}
              className="px-6 py-2 border border-gray-200 rounded-[4px] text-charcoal hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <GlowingButton
              onClick={handleUpload}
              disabled={!uploadData.file || !uploadData.title.trim() || !uploadData.subtitle.trim() || !uploadData.weekDate || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Devotional'}
            </GlowingButton>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!editing}
        onClose={resetEditForm}
        title="Edit Devotional"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Title *</label>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Subtitle *</label>
            <input
              type="text"
              value={editData.subtitle}
              onChange={(e) => setEditData({ ...editData, subtitle: e.target.value })}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Week Date *</label>
            <input
              type="date"
              value={editData.weekDate}
              onChange={(e) => setEditData({ ...editData, weekDate: e.target.value })}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Replace PDF (optional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-[4px] p-6 text-center hover:border-gold transition-colors">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleEditFileChange}
                className="hidden"
                id="devotional-edit-upload"
              />
              <label htmlFor="devotional-edit-upload" className="cursor-pointer">
                {editData.file ? (
                  <div className="space-y-2">
                    <BookOpen size={32} className="mx-auto text-gold" />
                    <p className="text-sm text-charcoal font-bold">{editData.file.name}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setEditData({ ...editData, file: null });
                      }}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload size={32} className="mx-auto text-neutral" />
                    <p className="text-sm text-charcoal">Click to replace PDF</p>
                    <p className="text-xs text-neutral">Leave empty to keep the current file</p>
                  </div>
                )}
              </label>
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={resetEditForm}
              className="px-6 py-2 border border-gray-200 rounded-[4px] text-charcoal hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <GlowingButton
              onClick={handleEdit}
              disabled={!editData.title.trim() || !editData.subtitle.trim() || !editData.weekDate || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </GlowingButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};
