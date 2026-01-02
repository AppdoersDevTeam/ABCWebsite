import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Calendar } from 'lucide-react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';
import { RosterImage } from '../../types';
import { supabase } from '../../lib/supabase';
import { SkeletonPageHeader } from '../../components/UI/Skeleton';

export const AdminRoster = () => {
  const [rosterImages, setRosterImages] = useState<RosterImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadDate, setUploadDate] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchRosterImages();
  }, []);

  const fetchRosterImages = async () => {
    try {
      const { data, error } = await supabase
        .from('roster_images')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setRosterImages(data || []);
    } catch (error) {
      console.error('Error fetching roster images:', error);
      alert('Failed to load roster images');
    } finally {
      setIsLoading(false);
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
    if (!selectedFile || !uploadDate) {
      alert('Please select a date and a PDF file');
      return;
    }

    setIsUploading(true);

    try {
      // Upload PDF to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop() || 'pdf';
      const fileName = `roster-images/${uploadDate}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('roster-images')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage.from('roster-images').getPublicUrl(fileName);

      // Check if roster PDF already exists for this date
      const { data: existing, error: checkError } = await supabase
        .from('roster_images')
        .select('id, pdf_url')
        .eq('date', uploadDate)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid error when no record exists

      let result;
      if (existing && !checkError) {
        // Update existing record
        // Delete old PDF from storage if it exists
        if (existing.pdf_url) {
          const urlParts = existing.pdf_url.split('/');
          const oldFileName = urlParts[urlParts.length - 1];
          if (oldFileName) {
            await supabase.storage.from('roster-images').remove([oldFileName]);
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
              date: uploadDate,
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
      setUploadDate('');
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
      const urlParts = pdfUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      if (fileName) {
        await supabase.storage.from('roster-images').remove([fileName]);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
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
      <div className="flex justify-between items-center border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-normal text-charcoal">Roster Management</h1>
          <p className="text-neutral mt-1">Upload roster PDFs for specific dates.</p>
        </div>
        <GlowingButton size="sm" onClick={() => setIsUploadModalOpen(true)}>
          <Upload size={16} className="mr-2" />
          Upload Roster PDF
        </GlowingButton>
      </div>

      {rosterImages.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-100 rounded-[8px]">
          <FileText size={48} className="mx-auto text-neutral mb-4" />
          <p className="text-neutral text-lg mb-2">No roster PDFs uploaded yet</p>
          <p className="text-neutral text-sm">Upload your first roster PDF to get started</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rosterImages.map((rosterImage) => (
            <div
              key={rosterImage.id}
              className="bg-white border border-gray-100 rounded-[8px] p-6 hover:border-gold hover:shadow-md transition-all group relative overflow-hidden"
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
                <div className="flex items-center gap-2 text-gold mb-2">
                  <Calendar size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {formatDateShort(rosterImage.date)}
                  </span>
                </div>
                <p className="text-sm text-neutral">{formatDate(rosterImage.date)}</p>
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
          setUploadDate('');
        }}
        title="Upload Roster PDF"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">
              Date * <span className="text-xs text-neutral font-normal">(for which this roster applies)</span>
            </label>
            <input
              type="date"
              value={uploadDate}
              onChange={(e) => setUploadDate(e.target.value)}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              required
            />
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
                setUploadDate('');
              }}
              className="px-6 py-2 border border-gray-200 rounded-[4px] text-charcoal hover:bg-gray-50 transition-colors"
              disabled={isUploading}
            >
              Cancel
            </button>
            <GlowingButton
              onClick={handleUpload}
              disabled={!selectedFile || !uploadDate || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload PDF'}
            </GlowingButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};
