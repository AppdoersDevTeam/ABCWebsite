import React, { useState, useEffect } from 'react';
import { FileText, Upload, Trash2, Eye, Pencil } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';
import { DocumentReaderPanel } from '../../components/UI/DocumentReaderPanel';
import { NewsletterMonthArchive } from '../../components/UI/NewsletterMonthArchive';
import { supabase } from '../../lib/supabase';
import { appConfirm } from '../../lib/appDialog';
import { cannotComplete, cannotDelete, cannotLoad, errorDetail, pleaseCompleteRequired } from '../../lib/systemMessage';
import { Newsletter as NewsletterType } from '../../types';
import { SkeletonPageHeader, SkeletonCard } from '../../components/UI/Skeleton';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';
import { logAuditEventSafe } from '../../lib/auditLog';
import { notifyCalendarChanged } from '../../lib/calendarItems';
import { formatWeekDate, monthYearFromWeekDate, resolveNewsletterWeekDate } from '../../lib/dateUtils';
import { fetchNewslettersOrdered, sortNewslettersLatestFirst } from '../../lib/newsletters';
import {
  ADMIN_DRAFT_KEYS,
  clearFormDraft,
  readFormDraft,
  writeFormDraft,
  type NewsletterEditDraft,
  type NewsletterUploadDraft,
} from '../../lib/adminFormDraft';

type NewsletterUploadForm = {
  title: string;
  weekDate: string;
  file: File | null;
  pendingFileName?: string;
};

type NewsletterEditForm = {
  title: string;
  weekDate: string;
  file: File | null;
  pendingFileName?: string;
};

function emptyUploadForm(): NewsletterUploadForm {
  return { title: '', weekDate: '', file: null };
}

function emptyEditForm(): NewsletterEditForm {
  return { title: '', weekDate: '', file: null };
}

function uploadFormFromDraft(draft: NewsletterUploadDraft | null): NewsletterUploadForm {
  if (!draft) return emptyUploadForm();
  return {
    title: draft.title,
    weekDate: draft.weekDate,
    file: null,
    pendingFileName: draft.fileName,
  };
}

function editFormFromDraft(draft: NewsletterEditDraft | null): NewsletterEditForm {
  if (!draft) return emptyEditForm();
  return {
    title: draft.title,
    weekDate: draft.weekDate,
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
  const [searchParams] = useSearchParams();
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
      title: item.title,
      weekDate: resolveNewsletterWeekDate(item),
      file: null,
    });
  };

  useEffect(() => {
    fetchNewsletters();
  }, []);

  useEffect(() => {
    const openId = searchParams.get('id');
    if (!openId || newsletters.length === 0) return;
    const match = newsletters.find((item) => item.id === openId);
    if (match) setViewing(match);
  }, [searchParams, newsletters]);

  useEffect(() => {
    const pendingId = pendingEditIdRef.current;
    if (!pendingId || editing) return;
    const item = newsletters.find((nl) => nl.id === pendingId);
    if (item) setEditing(item);
  }, [newsletters, editing]);

  useEffect(() => {
    if (
      !isUploadModalOpen &&
      !uploadData.title &&
      !uploadData.weekDate &&
      !uploadData.pendingFileName
    ) {
      clearFormDraft(ADMIN_DRAFT_KEYS.newsletterUpload);
      return;
    }

    writeFormDraft<NewsletterUploadDraft>(ADMIN_DRAFT_KEYS.newsletterUpload, {
      open: isUploadModalOpen,
      title: uploadData.title,
      weekDate: uploadData.weekDate,
      fileName: uploadData.file?.name ?? uploadData.pendingFileName,
    });
  }, [isUploadModalOpen, uploadData]);

  useEffect(() => {
    if (!editing) return;

    writeFormDraft<NewsletterEditDraft>(ADMIN_DRAFT_KEYS.newsletterEdit, {
      open: true,
      id: editing.id,
      title: editData.title,
      weekDate: editData.weekDate,
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
      const data = await fetchNewslettersOrdered();
      setNewsletters(data);
    } catch (error) {
      console.error('Error fetching newsletters:', error);
      alert(cannotLoad('newsletters'));
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
    if (!uploadData.file || !uploadData.title.trim() || !uploadData.weekDate) {
      alert('Please complete the required fields and choose a file.');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = uploadData.file.name.split('.').pop();
      const fileName = `newsletters/${uploadData.weekDate}-${Date.now()}.${fileExt}`;
      const { month, year } = monthYearFromWeekDate(uploadData.weekDate);

      const { error: uploadError } = await supabase.storage
        .from('newsletters')
        .upload(fileName, uploadData.file, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'application/pdf',
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('newsletters').getPublicUrl(fileName);

      const { data, error: dbError } = await supabase
        .from('newsletters')
        .insert([
          {
            title: uploadData.title.trim(),
            month,
            year,
            week_date: uploadData.weekDate,
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
        summary: `Uploaded newsletter ${uploadData.title.trim()} (${uploadData.weekDate})`,
      });

      setNewsletters(sortNewslettersLatestFirst([data, ...newsletters]));
      notifyCalendarChanged();
      closeUploadModal();
      alert('The newsletter has been uploaded.');
    } catch (error: any) {
      console.error('Error uploading newsletter:', error);
      if (String(error?.message || '').includes('week_date')) {
        alert('This newsletter could not be saved until the week-date database update has been applied. Please try again after that update.');
      } else {
        alert(cannotComplete('upload this newsletter', errorDetail(error)));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = async () => {
    if (!editing || !editData.title.trim() || !editData.weekDate) {
      alert(pleaseCompleteRequired());
      return;
    }

    setIsSaving(true);

    try {
      let pdfUrl = editing.pdf_url;
      const oldPath = storagePathFromPublicUrl(editing.pdf_url, 'newsletters');
      const { month, year } = monthYearFromWeekDate(editData.weekDate);

      if (editData.file) {
        const fileExt = editData.file.name.split('.').pop();
        const fileName = `newsletters/${editData.weekDate}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('newsletters')
          .upload(fileName, editData.file, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'application/pdf',
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
          title: editData.title.trim(),
          month,
          year,
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
        category: 'newsletter',
        entityType: 'newsletters',
        entityId: editing.id,
        summary: `Updated newsletter ${editData.title.trim()} (${editData.weekDate})`,
      });

      setNewsletters(
        sortNewslettersLatestFirst(newsletters.map((nl) => (nl.id === editing.id ? data : nl)))
      );
      notifyCalendarChanged();
      if (viewing?.id === editing.id) setViewing(data);
      resetEditForm();
      alert('The newsletter has been updated.');
    } catch (error: any) {
      console.error('Error updating newsletter:', error);
      if (String(error?.message || '').includes('week_date')) {
        alert('This newsletter could not be saved until the week-date database update has been applied. Please try again after that update.');
      } else {
        alert(cannotComplete('update this newsletter', errorDetail(error)));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!await appConfirm('Please confirm you want to delete this newsletter. This cannot be undone.', { confirmLabel: 'Delete' })) {
      return;
    }

    try {
      const newsletter = newsletters.find((nl) => nl.id === id);

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
      setNewsletters(newsletters.filter((nl) => nl.id !== id));
      notifyCalendarChanged();
    } catch (error) {
      console.error('Error deleting newsletter:', error);
      alert(cannotDelete('this newsletter'));
    }
  };

  const latestNewsletter = newsletters[0];
  const latestWeekDate = latestNewsletter ? resolveNewsletterWeekDate(latestNewsletter) : '';

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
            meta={`Week of ${formatWeekDate(resolveNewsletterWeekDate(viewing))}`}
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
            {latestNewsletter && latestWeekDate && (
              <p className="text-neutral mb-6 md:mb-8 font-medium text-sm md:text-base">
                Week of {formatWeekDate(latestWeekDate)}
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
          <NewsletterMonthArchive
            items={newsletters}
            emptyMessage="No newsletters yet"
            renderItem={(newsletter) => {
              const weekDate = resolveNewsletterWeekDate(newsletter);
              return (
                <div
                  key={newsletter.id}
                  className={`glass-card bg-white/80 border p-3 sm:p-4 flex justify-between items-center gap-2 rounded-[10px] transition-all group min-w-0 ${
                    viewing?.id === newsletter.id ? 'border-gold shadow-md' : 'border-white/60 hover:shadow-md hover:bg-gray-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setViewing(newsletter)}
                    className="text-left min-w-0 flex-1"
                  >
                    <span className="block text-neutral font-medium hover:text-charcoal truncate">{newsletter.title}</span>
                    {weekDate && (
                      <span className="block text-xs text-neutral/80">Week of {formatWeekDate(weekDate)}</span>
                    )}
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
              );
            }}
          />
        </div>
      </div>

      {viewing && (
        <div className="hidden md:block">
          <DocumentReaderPanel
            label="Reading"
            title={viewing.title}
            meta={`Week of ${formatWeekDate(resolveNewsletterWeekDate(viewing))}`}
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
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Title *</label>
            <input
              type="text"
              value={uploadData.title}
              onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              placeholder="e.g., The Newsletter"
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
            {uploadData.pendingFileName && !uploadData.file && (
              <p className="text-xs text-amber-700 mb-2">
                Previously selected: {uploadData.pendingFileName}. Please select the PDF again.
              </p>
            )}
            <div className="border-2 border-dashed border-gray-300 rounded-[4px] p-6 text-center hover:border-gold transition-colors">
              <input
                type="file"
                accept=".pdf,application/pdf"
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
            <GlowingButton
              onClick={handleUpload}
              disabled={!uploadData.file || !uploadData.title.trim() || !uploadData.weekDate || isUploading}
            >
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
            {editData.pendingFileName && !editData.file && (
              <p className="text-xs text-amber-700 mb-2">
                Previously selected: {editData.pendingFileName}. Please select the PDF again.
              </p>
            )}
            <div className="border-2 border-dashed border-gray-300 rounded-[4px] p-6 text-center hover:border-gold transition-colors">
              <input
                type="file"
                accept=".pdf,application/pdf"
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
              disabled={!editData.title.trim() || !editData.weekDate || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </GlowingButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};
