import React, { useState, useEffect } from 'react';
import { FileText, Download, Upload, Trash2, X } from 'lucide-react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';
import { supabase } from '../../lib/supabase';
import { Newsletter as NewsletterType } from '../../types';
import { SkeletonPageHeader, SkeletonCard } from '../../components/UI/Skeleton';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';

export const AdminNewsletter = () => {
  const [newsletters, setNewsletters] = useState<NewsletterType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({ month: '', year: '', description: '', file: null as File | null });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchNewsletters();
  }, []);

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
      setUploadData({ ...uploadData, file: e.target.files[0] });
    }
  };

  const handleUpload = async () => {
    if (!uploadData.file || !uploadData.month || !uploadData.year) {
      alert('Please fill in all required fields and select a file');
      return;
    }

    setIsUploading(true);

    try {
      // Upload PDF to Supabase Storage
      const fileExt = uploadData.file.name.split('.').pop();
      const fileName = `newsletters/${uploadData.month}-${uploadData.year}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('newsletters')
        .upload(fileName, uploadData.file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage.from('newsletters').getPublicUrl(fileName);

      // Save newsletter record to database
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

      setNewsletters([data, ...newsletters]);
      setUploadData({ month: '', year: '', description: '', file: null });
      setIsUploadModalOpen(false);
      alert('Newsletter uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading newsletter:', error);
      alert(error.message || 'Failed to upload newsletter');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this newsletter?')) {
      return;
    }

    try {
      const newsletter = newsletters.find(nl => nl.id === id);
      
      // Delete file from storage
      if (newsletter?.pdf_url) {
        const fileName = newsletter.pdf_url.split('/').pop();
        if (fileName) {
          await supabase.storage.from('newsletters').remove([fileName]);
        }
      }

      // Delete record from database
      const { error } = await supabase.from('newsletters').delete().eq('id', id);

      if (error) throw error;

      setNewsletters(newsletters.filter(nl => nl.id !== id));
    } catch (error) {
      console.error('Error deleting newsletter:', error);
      alert('Failed to delete newsletter');
    }
  };

  const latestNewsletter = newsletters[0];

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
        title="Newsletter Management"
        subtitle="Upload and manage church newsletters."
        icon={<FileText size={28} />}
        rightSlot={
          <GlowingButton size="sm" onClick={() => setIsUploadModalOpen(true)}>
            <Upload size={16} className="mr-2" />
            Upload Newsletter
          </GlowingButton>
        }
      />

      <div className="grid md:grid-cols-3 gap-6">
        {/* Latest Newsletter */}
        <div className="md:col-span-2">
          <div className="bg-gold p-1 rounded-t-[8px] w-fit">
            <span className="text-charcoal font-bold text-xs px-4 uppercase tracking-widest">Latest</span>
          </div>
          <div className="glass-card p-8 md:p-16 text-center rounded-[8px] rounded-tl-none border-t-0 bg-white shadow-lg">
            <FileText size={64} className="text-gold mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-serif text-charcoal mb-2 font-normal">
              {latestNewsletter?.title || 'No Newsletter'}
            </h2>
            {latestNewsletter && (
              <p className="text-neutral mb-8 font-medium">{latestNewsletter.month} {latestNewsletter.year}</p>
            )}
            {latestNewsletter ? (
              <div className="flex gap-3 justify-center">
                <a
                  href={latestNewsletter.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-charcoal text-white px-8 py-3 rounded-[4px] font-bold uppercase tracking-wider hover:bg-gold hover:text-charcoal transition-colors shadow-lg"
                >
                  Read Online
                </a>
                <a
                  href={latestNewsletter.pdf_url}
                  download
                  className="bg-gray-100 text-charcoal px-8 py-3 rounded-[4px] font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors"
                >
                  <Download size={18} className="inline mr-2" />
                  Download
                </a>
              </div>
            ) : (
              <p className="text-neutral">Upload your first newsletter to get started</p>
            )}
          </div>
        </div>

        {/* Archive */}
        <div>
          <h3 className="text-charcoal font-bold uppercase tracking-widest text-xs mb-4">Archive</h3>
          <div className="space-y-3">
            {newsletters.map((newsletter) => (
              <div
                key={newsletter.id}
                className="glass-card bg-white/80 border border-white/60 p-4 flex justify-between items-center hover:shadow-md hover:border-gold cursor-pointer rounded-[10px] transition-all group"
              >
                <span className="text-neutral font-medium">{newsletter.title}</span>
                <div className="flex items-center gap-2">
                  <Download size={16} className="text-neutral hover:text-gold transition-colors" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(newsletter.id);
                    }}
                    className="p-1 text-neutral hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setUploadData({ month: '', year: '', description: '', file: null });
        }}
        title="Upload Newsletter"
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
          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => {
                setIsUploadModalOpen(false);
                setUploadData({ month: '', year: '', description: '', file: null });
              }}
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
    </div>
  );
};

