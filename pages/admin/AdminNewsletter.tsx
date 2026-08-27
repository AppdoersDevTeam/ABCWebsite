import React, { useState, useEffect } from 'react';
import { FileText, Upload, Trash2, Eye, Pencil } from 'lucide-react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';
import { DocumentReaderPanel } from '../../components/UI/DocumentReaderPanel';
import { supabase } from '../../lib/supabase';
import { Newsletter as NewsletterType } from '../../types';
import { SkeletonPageHeader, SkeletonCard } from '../../components/UI/Skeleton';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';
import { logAuditEventSafe } from '../../lib/auditLog';
import {
  ADMIN_DRAFT_KEYS,
  clearFormDraft,
  readFormDraft,
  writeFormDraft,
  type NewsletterEditDraft,
  type NewsletterUploadDraft,
} from '../../lib/adminFormDraft';

type NewsletterUploadForm = {
  month: string;
  year: string;
  description: string;
  file: File | null;
  pendingFileName?: string;
};

type NewsletterEditForm = {
  month: string;
  year: string;
  file: File | null;
  pendingFileName?: string;
};

function emptyUploadForm(): NewsletterUploadForm {
  return { month: '', year: '', description: '', file: null };
}

function emptyEditForm(): NewsletterEditForm {
  return { month: '', year: '', file: null };
}

function uploadFormFromDraft(draft: NewsletterUploadDraft | null): NewsletterUploadForm {
  if (!draft) return emptyUploadForm();
  return {
    month: draft.month,
    year: draft.year,
    description: draft.description,
    file: null,
    pendingFileName: draft.fileName,
  };
}

function editFormFromDraft(draft: NewsletterEditDraft | null): NewsletterEditForm {
  if (!draft) return emptyEditForm();
  return {
    month: draft.month,
    year: draft.year,
    file: null,
    pendingFileName: draft.fileName,
  };
}

function storagePathFromPublicUrl(pdfUrl: string, bucket: string): string | null {
  const marker = `/object/public/${bucket}/`;
  const idx = pdfUrl.indexOf(marker);
  if (idx >= 0) return decodeURIComponent(pdfUrl.slice(idx + marker.length).split('?')[0]);
  const parts = pdfUrl.split(`/${bucket}/`);
  if (parts.length > 1) return decodeURIComponent(parts[1].split('?')[0]);
  return pdfUrl.split('/').pop() || null;
}

export const AdminNewsletter = () => {
  const savedUploadDraft = readFormDraft<NewsletterUploadDraft>(ADMIN_DRAFT_KEYS.newsletterUpload);
  const savedEditDraft = readFormDraft<NewsletterEditDraft>(ADMIN_DRAFT_KEYS.newsletterEdit);

  const [newsletters, setNewsletters] = useState<NewsletterType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(() => savedUploadDraft?.open ?? false);
  const [uploadData, setUploadData] = useState<NewsletterUploadForm>(() => uploadFormFromDraft(savedUploadDraft));
  const [isUploading, setIsUploading] = useState(false);
  const [viewing, setViewing] = useState<NewsletterType | null>(null);
  const [editing, setEditing] = useState<NewsletterType | null>(null);
  const [editData, setEditData] = useState<NewsletterEditForm>(() => editFormFromDraft(savedEditDraft));
  const [isSaving, setIsSaving] = useState(false);
  const pendingEditIdRef = React.useRef(savedEditDraft?.open ? savedEditDraft.id : null);

  const closeUploadModal = () => {
    clearFormDraft(ADMIN_DRAFT_KEYS.newsletterUpload);
    setIsUploadModalOpen(false);
    setUploadData(emptyUploadForm());
  };

  const resetEditForm = () => {
    clearFormDraft(ADMIN_DRAFT_KEYS.newsletterEdit);
    pendingEditIdRef.current = null;
    setEditing(null);
    setEditData(emptyEditForm());
  };

  const openEdit = (item: NewsletterType) => {
    pendingEditIdRef.current = item.id;
    setEditing(item);
    setEditData({
      month: item.month,
      year: String(item.year),
      file: null,
    });
  };

  useEffect(() => {
    fetchNewsletters();
  }, []);

  useEffect(() => {
    const pendingId = pendingEditIdRef.current;
    if (!pendingId || editing) return;
    const item = newsletters.find((nl) => nl.id === pendingId);
    if (item) setEditing(item);
  }, [newsletters, editing]);

  useEffect(() => {
    if (
      !isUploadModalOpen &&
      !uploadData.month &&
      !uploadData.year &&
      !uploadData.description &&
      !uploadData.pendingFileName
    ) {
      clearFormDraft(ADMIN_DRAFT_KEYS.newsletterUpload);
      return;
    }

    writeFormDraft<NewsletterUploadDraft>(ADMIN_DRAFT_KEYS.newsletterUpload, {
      open: isUploadModalOpen,
      month: uploadData.month,
      year: uploadData.year,
      description: uploadData.description,
      fileName: uploadData.file?.name ?? uploadData.pendingFileName,
    });
  }, [isUploadModalOpen, uploadData]);

  useEffect(() => {
    if (!editing) return;

    writeFormDraft<NewsletterEditDraft>(ADMIN_DRAFT_KEYS.newsletterEdit, {
      open: true,
      id: editing.id,
      month: editData.month,
      year: editData.year,
      fileName: editData.file?.name ?? editData.pendingFileName,
    });
  }, [editing, editData]);

  useEffect(() => {
    if (viewing) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [viewing]);

  const fetchNewsletters = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNewsletters(data || []);
    } catch (error) {
      console.error('Error fetching newsletters:', error);
      alert('Failed to load newsletters');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadData({ ...uploadData, file: e.target.files[0], pendingFileName: undefined });
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditData({ ...editData, file: e.target.files[0], pendingFileName: undefined });
    }
  };

  const handleUpload = async () => {
    if (!uploadData.file || !uploadData.month || !uploadData.year) {
      alert('Please fill in all required fields and select a file');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = uploadData.file.name.split('.').pop();
      const fileName = `newsletters/${uploadData.month}-${uploadData.year}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('newsletters')
        .upload(fileName, uploadData.file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('newsletters').getPublicUrl(fileName);

      const { data, error: dbError } = await supabase
        .from('newsletters')
        .insert([
          {
            title: `${uploadData.month} ${uploadData.year}`,
            month: uploadData.month,
            year: parseInt(uploadData.year),
            pdf_url: urlData.publicUrl,
          },
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      logAuditEventSafe({
        action: 'create',
        category: 'newsletter',
        entityType: 'newsletters',
        entityId: data.id,
        summary: `Uploaded newsletter ${uploadData.month} ${uploadData.year}`,
      });

      setNewsletters([data, ...newsletters]);
      closeUploadModal();
      alert('Newsletter uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading newsletter:', error);
      alert(error.message || 'Failed to upload newsletter');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = async () => {
    if (!editing || !editData.month || !editData.year) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSaving(true);

    try {
      let pdfUrl = editing.pdf_url;
      const oldPath = storagePathFromPublicUrl(editing.pdf_url, 'newsletters');

      if (editData.file) {
        const fileExt = editData.file.name.split('.').pop();
        const fileName = `newsletters/${editData.month}-${editData.year}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('newsletters')
          .upload(fileName, editData.file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('newsletters').getPublicUrl(fileName);
        pdfUrl = urlData.publicUrl;

        if (oldPath) {
          await supabase.storage.from('newsletters').remove([oldPath]);
        }
      }

      const { data, error: dbError } = await supabase
        .from('newsletters')
        .update({
          title: `${editData.month} ${editData.year}`,
          month: editData.month,
          year: parseInt(editData.year, 10),
          pdf_url: pdfUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editing.id)
        .select()
        .single();

      if (dbError) throw dbError;

      logAuditEventSafe({
        action: 'update',
        category: 'newsletter',
        entityType: 'newsletters',
        entityId: editing.id,
        summary: `Updated newsletter ${editData.month} ${editData.year}`,
      });

      setNewsletters(newsletters.map((nl) => (nl.id === editing.id ? data : nl)));
      if (viewing?.id === editing.id) setViewing(data);
      resetEditForm();
      alert('Newsletter updated successfully!');
    } catch (error: any) {
      console.error('Error updating newsletter:', error);
      alert(error.message || 'Failed to update newsletter');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this newsletter?')) {
      return;
    }

    try {
      const newsletter = newsletters.find(nl => nl.id === id);

      if (newsletter?.pdf_url) {
        const path = storagePathFromPublicUrl(newsletter.pdf_url, 'newsletters');
        if (path) {
          await supabase.storage.from('newsletters').remove([path]);
        }
      }

      const { error } = await supabase.from('newsletters').delete().eq('id', id);

      if (error) throw error;

      logAuditEventSafe({
        action: 'delete',
        category: 'newsletter',
        entityType: 'newsletters',
        entityId: id,
        summary: `Deleted newsletter ${newsletter?.title || id}`,
      });

      if (viewing?.id === id) setViewing(null);
      setNewsletters(newsletters.filter(nl => nl.id !== id));
    } catch (error) {
      console.error('Error deleting newsletter:', error);
      alert('Failed to delete newsletter');
    }
  };

  const latestNewsletter = newsletters[0];

  if (isLoading && !isUploadModalOpen) {
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
        title="Newsletter Management"
        subtitle="Upload and manage church newsletters."
        icon={<FileText size={28} />}
        rightSlot={
          <GlowingButton size="sm" fullWidth className="md:w-auto" onClick={() => setIsUploadModalOpen(true)}>
            <Upload size={16} className="mr-2" />
            Upload Newsletter
          </GlowingButton>
        }
      />

      {viewing && (
        <div className="md:hidden">
          <DocumentReaderPanel
            label="Reading"
            title={viewing.title}
            pdfUrl={viewing.pdf_url}
            pdfTitle={viewing.title}
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
            <FileText className="text-gold mx-auto mb-4 md:mb-6 w-12 h-12 sm:w-16 sm:h-16" />
            <h2 className="text-xl sm:text-2xl md:text-4xl font-serif text-charcoal mb-2 font-normal break-words">
              {latestNewsletter?.title || 'No Newsletter'}
            </h2>
            {latestNewsletter && (
              <p className="text-neutral mb-6 md:mb-8 font-medium text-sm md:text-base">
                {latestNewsletter.month} {latestNewsletter.year}
              </p>
            )}
            {latestNewsletter ? (
              <button
                type="button"
                onClick={() => setViewing(latestNewsletter)}
                className="bg-charcoal text-white px-6 py-3 rounded-[4px] font-bold uppercase tracking-wider hover:bg-gold hover:text-charcoal transition-colors shadow-lg inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px]"
              >
                <Eye size={18} />
                Read Online
              </button>
            ) : (
              <p className="text-neutral">Upload your first newsletter to get started</p>
            )}
          </div>
        </div>

        <div className="min-w-0 flex flex-col">
          <h3 className="text-charcoal font-bold uppercase tracking-widest text-xs mb-4 shrink-0">Archive</h3>
          <div className="space-y-3 max-h-[min(20rem,45vh)] md:max-h-[min(36rem,calc(100dvh-11rem))] overflow-y-auto overscroll-y-contain pr-1">
            {newsletters.map((newsletter) => (
              <div
                key={newsletter.id}
                className={`glass-card bg-white/80 border p-3 sm:p-4 flex justify-between items-center gap-2 rounded-[10px] transition-all group min-w-0 ${
                  viewing?.id === newsletter.id ? 'border-gold shadow-md' : 'border-white/60 hover:shadow-md hover:border-gold'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setViewing(newsletter)}
                  className="text-left text-neutral font-medium hover:text-charcoal min-w-0 flex-1 truncate"
                >
                  {newsletter.title}
                </button>
                <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewing(newsletter)}
                    className="p-2 text-neutral hover:text-gold transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={`Read ${newsletter.title}`}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(newsletter);
                    }}
                    className="p-2 text-neutral hover:text-gold transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={`Edit ${newsletter.title}`}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(newsletter.id);
                    }}
                    className="p-2 text-neutral hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={`Delete ${newsletter.title}`}
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
            pdfUrl={viewing.pdf_url}
            pdfTitle={viewing.title}
            onClose={() => setViewing(null)}
          />
        </div>
      )}

      <Modal
        isOpen={isUploadModalOpen}
        onClose={closeUploadModal}
        title="Upload Newsletter"
        closeOnBackdropClick={false}
        preventClose={isUploading}
      >
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2">Month *</label>
              <select
                value={uploadData.month}
                onChange={(e) => setUploadData({ ...uploadData, month: e.target.value })}
                className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              >
                <option value="">Select Month</option>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2">Year *</label>
              <input
                type="number"
                value={uploadData.year}
                onChange={(e) => setUploadData({ ...uploadData, year: e.target.value })}
                className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
                placeholder="2023"
                min="2020"
                max="2100"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Description (Optional)</label>
            <input
              type="text"
              value={uploadData.description}
              onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              placeholder="e.g., Harvest Edition"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">PDF File *</label>
            {uploadData.pendingFileName && !uploadData.file && (
              <p className="text-xs text-amber-700 mb-2">
                Previously selected: {uploadData.pendingFileName}. Please select the PDF again.
              </p>
            )}
            <div className="border-2 border-dashed border-gray-300 rounded-[4px] p-6 text-center hover:border-gold transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="newsletter-upload"
              />
              <label htmlFor="newsletter-upload" className="cursor-pointer">
                {uploadData.file ? (
                  <div className="space-y-2">
                    <FileText size={32} className="mx-auto text-gold" />
                    <p className="text-sm text-charcoal font-bold">{uploadData.file.name}</p>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setUploadData({ ...uploadData, file: null, pendingFileName: undefined });
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
              onClick={closeUploadModal}
              className="px-6 py-2 border border-gray-200 rounded-[4px] text-charcoal hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <GlowingButton onClick={handleUpload} disabled={!uploadData.file || !uploadData.month || !uploadData.year || isUploading}>
              {isUploading ? 'Uploading...' : 'Upload Newsletter'}
            </GlowingButton>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!editing}
        onClose={resetEditForm}
        title="Edit Newsletter"
        closeOnBackdropClick={false}
        preventClose={isSaving}
      >
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2">Month *</label>
              <select
                value={editData.month}
                onChange={(e) => setEditData({ ...editData, month: e.target.value })}
                className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              >
                <option value="">Select Month</option>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2">Year *</label>
              <input
                type="number"
                value={editData.year}
                onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
                min="2020"
                max="2100"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Replace PDF (optional)</label>
            {editData.pendingFileName && !editData.file && (
              <p className="text-xs text-amber-700 mb-2">
                Previously selected: {editData.pendingFileName}. Please select the PDF again.
              </p>
            )}
            <div className="border-2 border-dashed border-gray-300 rounded-[4px] p-6 text-center hover:border-gold transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleEditFileChange}
                className="hidden"
                id="newsletter-edit-upload"
              />
              <label htmlFor="newsletter-edit-upload" className="cursor-pointer">
                {editData.file ? (
                  <div className="space-y-2">
                    <FileText size={32} className="mx-auto text-gold" />
                    <p className="text-sm text-charcoal font-bold">{editData.file.name}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setEditData({ ...editData, file: null, pendingFileName: undefined });
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
              disabled={!editData.month || !editData.year || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </GlowingButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};
