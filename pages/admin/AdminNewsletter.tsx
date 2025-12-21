import React, { useState } from 'react';
import { FileText, Download, Upload, Trash2, X } from 'lucide-react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';

interface Newsletter {
  id: string;
  title: string;
  month: string;
  year: string;
  description?: string;
  fileUrl?: string;
}

export const AdminNewsletter = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([
    { id: '1', title: 'October 2023', month: 'October', year: '2023', description: 'Harvest Edition' },
    { id: '2', title: 'September 2023', month: 'September', year: '2023' },
    { id: '3', title: 'August 2023', month: 'August', year: '2023' },
    { id: '4', title: 'July 2023', month: 'July', year: '2023' },
  ]);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({ month: '', year: '', description: '', file: null as File | null });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadData({ ...uploadData, file: e.target.files[0] });
    }
  };

  const handleUpload = () => {
    if (!uploadData.file || !uploadData.month || !uploadData.year) {
      alert('Please fill in all required fields and select a file');
      return;
    }

    const newNewsletter: Newsletter = {
      id: Date.now().toString(),
      title: `${uploadData.month} ${uploadData.year}`,
      month: uploadData.month,
      year: uploadData.year,
      description: uploadData.description,
      fileUrl: URL.createObjectURL(uploadData.file),
    };

    setNewsletters([newNewsletter, ...newsletters]);
    setUploadData({ month: '', year: '', description: '', file: null });
    setIsUploadModalOpen(false);
    alert('Newsletter uploaded successfully!');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this newsletter?')) {
      setNewsletters(newsletters.filter(nl => nl.id !== id));
    }
  };

  const latestNewsletter = newsletters[0];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-charcoal">Newsletter Management</h1>
          <p className="text-neutral mt-1">Upload and manage church newsletters.</p>
        </div>
        <GlowingButton size="sm" onClick={() => setIsUploadModalOpen(true)}>
          <Upload size={16} className="mr-2" />
          Upload Newsletter
        </GlowingButton>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Latest Newsletter */}
        <div className="md:col-span-2">
          <div className="bg-gold p-1 rounded-t-[8px] w-fit">
            <span className="text-charcoal font-bold text-xs px-4 uppercase tracking-widest">Latest</span>
          </div>
          <div className="glass-card p-8 md:p-16 text-center rounded-[8px] rounded-tl-none border-t-0 bg-white shadow-lg">
            <FileText size={64} className="text-gold mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-serif text-charcoal mb-2 font-bold">
              {latestNewsletter?.title || 'No Newsletter'}
            </h2>
            {latestNewsletter?.description && (
              <p className="text-neutral mb-8 font-medium">{latestNewsletter.description}</p>
            )}
            <div className="flex gap-3 justify-center">
              <button className="bg-charcoal text-white px-8 py-3 rounded-[4px] font-bold uppercase tracking-wider hover:bg-gold hover:text-charcoal transition-colors shadow-lg">
                Read Online
              </button>
              <button className="bg-gray-100 text-charcoal px-8 py-3 rounded-[4px] font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors">
                <Download size={18} className="inline mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Archive */}
        <div>
          <h3 className="text-charcoal font-bold uppercase tracking-widest text-xs mb-4">Archive</h3>
          <div className="space-y-3">
            {newsletters.map((newsletter) => (
              <div
                key={newsletter.id}
                className="bg-white border border-gray-200 p-4 flex justify-between items-center hover:shadow-md hover:border-gold cursor-pointer rounded-[4px] transition-all group"
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
            <GlowingButton onClick={handleUpload} disabled={!uploadData.file || !uploadData.month || !uploadData.year}>
              Upload Newsletter
            </GlowingButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

