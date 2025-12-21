import React, { useState } from 'react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';
import { FolderPlus, Image as ImageIcon, Upload, Edit, Trash2, X, Plus } from 'lucide-react';

interface PhotoFolder {
  id: string;
  name: string;
  photos: string[];
}

export const AdminPhotos = () => {
  const [folders, setFolders] = useState<PhotoFolder[]>([
    { id: '1', name: 'Sunday Service', photos: [
      'https://images.unsplash.com/photo-1511632765486-a01980978a63?auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=500&q=60',
    ]},
    { id: '2', name: 'Community Events', photos: [
      'https://images.unsplash.com/photo-1529070538774-32973fcf5223?auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&w=500&q=60',
    ]},
    { id: '3', name: 'Youth Group', photos: [
      'https://images.unsplash.com/photo-1511649475669-e288648b2339?auto=format&fit=crop&w=500&q=60',
    ]},
  ]);

  const [selectedFolder, setSelectedFolder] = useState<PhotoFolder | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<PhotoFolder | null>(null);
  const [folderName, setFolderName] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  const handleCreateFolder = () => {
    const newFolder: PhotoFolder = {
      id: Date.now().toString(),
      name: folderName,
      photos: [],
    };
    setFolders([...folders, newFolder]);
    setFolderName('');
    setIsFolderModalOpen(false);
  };

  const handleEditFolder = (folder: PhotoFolder) => {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setIsFolderModalOpen(true);
  };

  const handleUpdateFolder = () => {
    if (!editingFolder) return;
    setFolders(folders.map(f =>
      f.id === editingFolder.id
        ? { ...f, name: folderName }
        : f
    ));
    setFolderName('');
    setEditingFolder(null);
    setIsFolderModalOpen(false);
  };

  const handleDeleteFolder = (id: string) => {
    if (window.confirm('Are you sure you want to delete this folder and all its photos?')) {
      setFolders(folders.filter(f => f.id !== id));
      if (selectedFolder?.id === id) {
        setSelectedFolder(null);
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newPhotos = files.map(file => URL.createObjectURL(file));
      setUploadedPhotos([...uploadedPhotos, ...newPhotos]);
    }
  };

  const handleAddPhotos = () => {
    if (!selectedFolder || uploadedPhotos.length === 0) return;
    setFolders(folders.map(f =>
      f.id === selectedFolder.id
        ? { ...f, photos: [...f.photos, ...uploadedPhotos] }
        : f
    ));
    setUploadedPhotos([]);
    setIsPhotoModalOpen(false);
    setSelectedFolder(folders.find(f => f.id === selectedFolder.id) || null);
  };

  const handleDeletePhoto = (folderId: string, photoIndex: number) => {
    setFolders(folders.map(f =>
      f.id === folderId
        ? { ...f, photos: f.photos.filter((_, i) => i !== photoIndex) }
        : f
    ));
  };

  const openCreateFolderModal = () => {
    setEditingFolder(null);
    setFolderName('');
    setIsFolderModalOpen(true);
  };

  const openPhotoUploadModal = (folder: PhotoFolder) => {
    setSelectedFolder(folder);
    setUploadedPhotos([]);
    setIsPhotoModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-charcoal">Photo Gallery Management</h1>
          <p className="text-neutral mt-1">Manage photo folders and upload images.</p>
        </div>
        <GlowingButton size="sm" onClick={openCreateFolderModal}>
          <FolderPlus size={16} className="mr-2" />
          Create Folder
        </GlowingButton>
      </div>

      {/* Folders Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="bg-white border border-gray-100 rounded-[8px] p-6 hover:border-gold hover:shadow-md transition-all group relative"
          >
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEditFolder(folder)}
                className="p-2 bg-white border border-gray-200 rounded-[4px] text-neutral hover:text-gold hover:border-gold transition-colors"
                title="Edit Folder"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDeleteFolder(folder.id)}
                className="p-2 bg-white border border-gray-200 rounded-[4px] text-neutral hover:text-red-500 hover:border-red-200 transition-colors"
                title="Delete Folder"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="mb-4">
              <h3 className="font-bold text-xl text-charcoal mb-2">{folder.name}</h3>
              <p className="text-sm text-neutral">{folder.photos.length} photos</p>
            </div>

            {folder.photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {folder.photos.slice(0, 3).map((photo, i) => (
                  <div key={i} className="aspect-square rounded-[4px] overflow-hidden bg-gray-100">
                    <img src={photo} alt={`${folder.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="aspect-square rounded-[4px] bg-gray-100 flex items-center justify-center mb-4">
                <ImageIcon size={32} className="text-neutral" />
              </div>
            )}

            <GlowingButton
              size="sm"
              fullWidth
              onClick={() => openPhotoUploadModal(folder)}
            >
              <Plus size={16} className="mr-2" />
              Add Photos
            </GlowingButton>
          </div>
        ))}
      </div>

      {/* View Folder Photos */}
      {selectedFolder && (
        <div className="mt-8 bg-white border border-gray-100 rounded-[8px] p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif font-bold text-charcoal">{selectedFolder.name}</h2>
            <button
              onClick={() => setSelectedFolder(null)}
              className="text-neutral hover:text-charcoal"
            >
              <X size={24} />
            </button>
          </div>
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {selectedFolder.photos.map((photo, i) => (
              <div key={i} className="group relative break-inside-avoid rounded-[8px] overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-shadow">
                <img
                  src={photo}
                  alt={`${selectedFolder.name} ${i + 1}`}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDeletePhoto(selectedFolder.id, i)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    title="Delete Photo"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Folder Modal */}
      <Modal
        isOpen={isFolderModalOpen}
        onClose={() => {
          setIsFolderModalOpen(false);
          setEditingFolder(null);
          setFolderName('');
        }}
        title={editingFolder ? 'Edit Folder' : 'Create Folder'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Folder Name *</label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              placeholder="e.g., Sunday Service"
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => {
                setIsFolderModalOpen(false);
                setEditingFolder(null);
                setFolderName('');
              }}
              className="px-6 py-2 border border-gray-200 rounded-[4px] text-charcoal hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <GlowingButton
              onClick={editingFolder ? handleUpdateFolder : handleCreateFolder}
              disabled={!folderName}
            >
              {editingFolder ? 'Update Folder' : 'Create Folder'}
            </GlowingButton>
          </div>
        </div>
      </Modal>

      {/* Upload Photos Modal */}
      <Modal
        isOpen={isPhotoModalOpen}
        onClose={() => {
          setIsPhotoModalOpen(false);
          setUploadedPhotos([]);
        }}
        title={`Upload Photos to ${selectedFolder?.name || 'Folder'}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Select Photos</label>
            <div className="border-2 border-dashed border-gray-300 rounded-[4px] p-6 text-center hover:border-gold transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <Upload size={32} className="mx-auto text-neutral mb-2" />
                <p className="text-sm text-charcoal">Click to upload photos</p>
                <p className="text-xs text-neutral">or drag and drop (multiple files supported)</p>
              </label>
            </div>
          </div>
          {uploadedPhotos.length > 0 && (
            <div>
              <p className="text-sm font-bold text-charcoal mb-2">Preview ({uploadedPhotos.length} photos):</p>
              <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                {uploadedPhotos.map((photo, i) => (
                  <div key={i} className="aspect-square rounded-[4px] overflow-hidden bg-gray-100 relative group">
                    <img src={photo} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => setUploadedPhotos(uploadedPhotos.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => {
                setIsPhotoModalOpen(false);
                setUploadedPhotos([]);
              }}
              className="px-6 py-2 border border-gray-200 rounded-[4px] text-charcoal hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <GlowingButton
              onClick={handleAddPhotos}
              disabled={uploadedPhotos.length === 0}
            >
              Add Photos
            </GlowingButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

