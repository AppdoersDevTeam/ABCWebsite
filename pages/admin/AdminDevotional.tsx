import React, { useState, useEffect } from 'react';
import { BookOpen, Upload, Trash2, Eye, X } from 'lucide-react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';
import { EmbeddedPdfViewer } from '../../components/UI/EmbeddedPdfViewer';
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
  const [uploadData, setUploadData] = useState({ title: '', weekDate: '', file: null as File | null });
  const [isUploading, setIsUploading] = useState(false);
  const [viewing, setViewing] = useState<DevotionalType | null>(null);

  useEffect(() => {
    fetchDevotionals();
  }, []);

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

  const handleUpload = async () => {
    if (!uploadData.file || !uploadData.title.trim() || !uploadData.weekDate) {
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
        summary: `Uploaded devotional ${uploadData.title.trim()} (${uploadData.weekDate})`,
      });

      setDevotionals([data, ...devotionals].sort((a, b) => b.week_date.localeCompare(a.week_date)));
      setUploadData({ title: '', weekDate: '', file: null });
      setIsUploadModalOpen(false);
      alert('Devotional uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading devotional:', error);
      alert(error.message || 'Failed to upload devotional');
    } finally {
      setIsUploading(false);
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
    <div className="space-y-8">
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

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-gold p-1 rounded-t-[8px] w-fit">
            <span className="text-charcoal font-bold text-xs px-4 uppercase tracking-widest">Latest</span>
          </div>
          <div className="glass-card p-8 md:p-16 text-center rounded-[8px] rounded-tl-none border-t-0 bg-white shadow-lg">
            <BookOpen size={64} className="text-gold mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-serif text-charcoal mb-2 font-normal">
              {latest?.title || 'No Devotional'}
            </h2>
            {latest && (
              <p className="text-neutral mb-8 font-medium">Week of {formatWeekDate(latest.week_date)}</p>
            )}
            {latest ? (
              <button
                type="button"
                onClick={() => setViewing(latest)}
                className="bg-charcoal text-white px-8 py-3 rounded-[4px] font-bold uppercase tracking-wider hover:bg-gold hover:text-charcoal transition-colors shadow-lg inline-flex items-center gap-2"
              >
                <Eye size={18} />
                Read Online
              </button>
            ) : (
              <p className="text-neutral">Upload your first weekly devotional to get started</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-charcoal font-bold uppercase tracking-widest text-xs mb-4">Archive</h3>
          <div className="space-y-3">
            {devotionals.map((item) => (
              <div
                key={item.id}
                className={`glass-card bg-white/80 border p-4 flex justify-between items-center gap-2 rounded-[10px] transition-all group ${
                  viewing?.id === item.id ? 'border-gold shadow-md' : 'border-white/60 hover:shadow-md hover:border-gold'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setViewing(item)}
                  className="text-left min-w-0 flex-1"
                >
                  <span className="block text-neutral font-medium hover:text-charcoal truncate">{item.title}</span>
                  <span className="block text-xs text-neutral/80">Week of {formatWeekDate(item.week_date)}</span>
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewing(item)}
                    className="p-1 text-neutral hover:text-gold transition-colors"
                    aria-label={`Read ${item.title}`}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="p-1 text-neutral hover:text-red-500 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
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
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-charcoal font-bold uppercase tracking-widest text-xs">Reading</h3>
              <p className="text-lg font-serif text-charcoal">{viewing.title}</p>
              <p className="text-sm text-neutral">Week of {formatWeekDate(viewing.week_date)}</p>
            </div>
            <button
              type="button"
              onClick={() => setViewing(null)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-bold text-neutral hover:text-charcoal border border-gray-200 rounded-[4px] hover:bg-gray-50"
            >
              <X size={16} />
              Close
            </button>
          </div>
          <EmbeddedPdfViewer src={viewing.pdf_url} title={viewing.title} />
        </div>
      )}

      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setUploadData({ title: '', weekDate: '', file: null });
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
              placeholder="e.g., Devotional 16 - The Trellis and the Vine"
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
                setUploadData({ title: '', weekDate: '', file: null });
              }}
              className="px-6 py-2 border border-gray-200 rounded-[4px] text-charcoal hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <GlowingButton
              onClick={handleUpload}
              disabled={!uploadData.file || !uploadData.title.trim() || !uploadData.weekDate || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Devotional'}
            </GlowingButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};
