import React, { useState, useEffect } from 'react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';
import { FolderPlus, Image as ImageIcon, Upload, Edit, Trash2, X, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PhotoFolder, Photo } from '../../types';
import { SkeletonPageHeader, SkeletonCard } from '../../components/UI/Skeleton';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';

interface PhotoFolderWithPhotos extends PhotoFolder {
  photos: Photo[];
}

export const AdminPhotos = () => {
  const [folders, setFolders] = useState<PhotoFolderWithPhotos[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<PhotoFolderWithPhotos | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<PhotoFolderWithPhotos | null>(null);
  const [folderName, setFolderName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchFoldersAndPhotos();
  }, []);

  const fetchFoldersAndPhotos = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all folders
      const { data: foldersData, error: foldersError } = await supabase
        .from('photo_folders')
        .select('*')
        .order('created_at', { ascending: false });

      if (foldersError) throw foldersError;

      // Fetch all photos
      const { data: photosData, error: photosError } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (photosError) throw photosError;

      // Group photos by folder_id
      const foldersWithPhotos: PhotoFolderWithPhotos[] = (foldersData || []).map(folder => ({
        ...folder,
        photos: (photosData || []).filter(photo => photo.folder_id === folder.id)
      }));

      setFolders(foldersWithPhotos);
    } catch (error) {
      console.error('Error fetching folders and photos:', error);
      alert('Failed to load folders and photos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      alert('Please enter a folder name');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('photo_folders')
        .insert([{ name: folderName.trim() }])
        .select()
        .single();

      if (error) throw error;

      const newFolder: PhotoFolderWithPhotos = { ...data, photos: [] };
      setFolders([newFolder, ...folders]);
      setFolderName('');
      setIsFolderModalOpen(false);
      alert('Folder created successfully!');
    } catch (error: any) {
      console.error('Error creating folder:', error);
      alert(error.message || 'Failed to create folder');
    }
  };

  const handleEditFolder = (folder: PhotoFolderWithPhotos) => {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setIsFolderModalOpen(true);
  };

  const handleUpdateFolder = async () => {
    if (!editingFolder || !folderName.trim()) {
      alert('Please enter a folder name');
      return;
    }

    try {
      const { error } = await supabase
        .from('photo_folders')
        .update({ name: folderName.trim() })
        .eq('id', editingFolder.id);

      if (error) throw error;

      setFolders(folders.map(f =>
        f.id === editingFolder.id
          ? { ...f, name: folderName.trim() }
          : f
      ));
      
      if (selectedFolder?.id === editingFolder.id) {
        setSelectedFolder({ ...selectedFolder, name: folderName.trim() });
      }
      
      setFolderName('');
      setEditingFolder(null);
      setIsFolderModalOpen(false);
      alert('Folder updated successfully!');
    } catch (error: any) {
      console.error('Error updating folder:', error);
      alert(error.message || 'Failed to update folder');
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this folder and all its photos?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const folder = folders.find(f => f.id === id);
      
      // Delete all photos in the folder from storage first
      if (folder && folder.photos.length > 0) {
        const photoPaths = folder.photos.map(photo => {
          // Extract file path from URL
          // Supabase storage URLs are typically: https://[project].supabase.co/storage/v1/object/public/photos/[folder]/[filename]
          const photosIndex = photo.url.indexOf('/photos/');
          if (photosIndex !== -1) {
            return photo.url.substring(photosIndex + '/photos/'.length);
          } else {
            // Fallback: try to extract from URL parts
            const urlParts = photo.url.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const folderName = urlParts[urlParts.length - 2];
            return `${folderName}/${fileName}`;
          }
        });

        // Remove photos from storage
        const { error: storageError } = await supabase.storage
          .from('photos')
          .remove(photoPaths);

        if (storageError) {
          console.warn('Error deleting photos from storage:', storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Delete folder (photos will be cascade deleted due to ON DELETE CASCADE)
      const { error } = await supabase
        .from('photo_folders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFolders(folders.filter(f => f.id !== id));
      if (selectedFolder?.id === id) {
        setSelectedFolder(null);
      }
      alert('Folder deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting folder:', error);
      alert(error.message || 'Failed to delete folder');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles([...selectedFiles, ...files]);
      
      // Create preview URLs
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    }
  };

  const handleAddPhotos = async () => {
    if (!selectedFolder || selectedFiles.length === 0) return;

    setIsUploading(true);

    try {
      const uploadedPhotoUrls: string[] = [];

      // Upload each file to storage
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `photos/${selectedFolder.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName);
        uploadedPhotoUrls.push(urlData.publicUrl);
      }

      if (uploadedPhotoUrls.length === 0) {
        alert('Failed to upload photos. Please try again.');
        return;
      }

      // Save photo records to database
      const photosToInsert = uploadedPhotoUrls.map(url => ({
        folder_id: selectedFolder.id,
        url: url,
      }));

      const { data: insertedPhotos, error: dbError } = await supabase
        .from('photos')
        .insert(photosToInsert)
        .select();

      if (dbError) throw dbError;

      // Update local state
      const updatedFolder = {
        ...selectedFolder,
        photos: [...selectedFolder.photos, ...(insertedPhotos || [])]
      };

      setFolders(folders.map(f =>
        f.id === selectedFolder.id ? updatedFolder : f
      ));
      setSelectedFolder(updatedFolder);

      // Clean up preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setSelectedFiles([]);
      setPreviewUrls([]);
      setIsPhotoModalOpen(false);
      
      alert(`Successfully uploaded ${insertedPhotos?.length || 0} photo(s)!`);
    } catch (error: any) {
      console.error('Error uploading photos:', error);
      alert(error.message || 'Failed to upload photos');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photo: Photo) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      // Extract file path from URL
      // Supabase storage URLs are typically: https://[project].supabase.co/storage/v1/object/public/photos/[folder]/[filename]
      // We need to extract everything after /photos/
      let filePath = '';
      const photosIndex = photo.url.indexOf('/photos/');
      if (photosIndex !== -1) {
        // Extract path after /photos/
        filePath = photo.url.substring(photosIndex + '/photos/'.length);
      } else {
        // Fallback: try to extract from URL parts
        const urlParts = photo.url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const folderName = urlParts[urlParts.length - 2];
        filePath = `${folderName}/${fileName}`;
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove([filePath]);

      if (storageError) {
        console.warn('Error deleting photo from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id);

      if (dbError) throw dbError;

      // Update local state
      const updatedFolder = {
        ...selectedFolder!,
        photos: selectedFolder!.photos.filter(p => p.id !== photo.id)
      };

      setFolders(folders.map(f =>
        f.id === updatedFolder.id ? updatedFolder : f
      ));
      setSelectedFolder(updatedFolder);

      alert('Photo deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting photo:', error);
      alert(error.message || 'Failed to delete photo');
    }
  };

  const openCreateFolderModal = () => {
    setEditingFolder(null);
    setFolderName('');
    setIsFolderModalOpen(true);
  };

  const openPhotoUploadModal = (folder: PhotoFolderWithPhotos) => {
    setSelectedFolder(folder);
    setSelectedFiles([]);
    setPreviewUrls([]);
    setIsPhotoModalOpen(true);
  };

  const viewFolderPhotos = (folder: PhotoFolderWithPhotos) => {
    setSelectedFolder(folder);
  };

  const removePreviewPhoto = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SkeletonPageHeader />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Photo Gallery Management"
        subtitle="Manage photo folders and upload images."
        icon={<ImageIcon size={28} />}
        rightSlot={
          <GlowingButton size="sm" fullWidth className="md:w-auto" onClick={openCreateFolderModal}>
            <FolderPlus size={16} className="mr-2" />
            Create Folder
          </GlowingButton>
        }
      />

      {/* Folders Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="glass-card bg-white/80 border border-white/60 rounded-[12px] p-6 hover:border-gold hover:shadow-md transition-all group relative"
          >
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditFolder(folder);
                }}
                className="p-2 bg-white border border-gray-200 rounded-[4px] text-neutral hover:text-gold hover:border-gold transition-colors"
                title="Edit Folder"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFolder(folder.id);
                }}
                className="p-2 bg-white border border-gray-200 rounded-[4px] text-neutral hover:text-red-500 hover:border-red-200 transition-colors"
                title="Delete Folder"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div 
              className="mb-4 cursor-pointer"
              onClick={() => viewFolderPhotos(folder)}
            >
              <h3 className="font-bold text-xl text-charcoal mb-2">{folder.name}</h3>
              <p className="text-sm text-neutral">{folder.photos.length} photos</p>
            </div>

            <div 
              className="cursor-pointer"
              onClick={() => viewFolderPhotos(folder)}
            >
              {folder.photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {folder.photos.slice(0, 3).map((photo) => (
                    <div key={photo.id} className="aspect-square rounded-[4px] overflow-hidden bg-gray-100">
                      <img src={photo.url} alt={photo.title || `${folder.name} photo`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-square rounded-[4px] bg-gray-100 flex items-center justify-center mb-4">
                  <ImageIcon size={32} className="text-neutral" />
                </div>
              )}
            </div>

            <GlowingButton
              size="sm"
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                openPhotoUploadModal(folder);
              }}
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
            <h2 className="text-2xl font-serif font-normal text-charcoal">{selectedFolder.name}</h2>
            <button
              onClick={() => setSelectedFolder(null)}
              className="text-neutral hover:text-charcoal"
            >
              <X size={24} />
            </button>
          </div>
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {selectedFolder.photos.map((photo) => (
              <div key={photo.id} className="group relative break-inside-avoid rounded-[8px] overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-shadow">
                <img
                  src={photo.url}
                  alt={photo.title || `${selectedFolder.name} photo`}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDeletePhoto(photo)}
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
              disabled={!folderName.trim() || isDeleting}
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
          previewUrls.forEach(url => URL.revokeObjectURL(url));
          setSelectedFiles([]);
          setPreviewUrls([]);
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
          {previewUrls.length > 0 && (
            <div>
              <p className="text-sm font-bold text-charcoal mb-2">Preview ({previewUrls.length} photos):</p>
              <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                {previewUrls.map((previewUrl, i) => (
                  <div key={i} className="aspect-square rounded-[4px] overflow-hidden bg-gray-100 relative group">
                    <img src={previewUrl} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePreviewPhoto(i)}
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
                previewUrls.forEach(url => URL.revokeObjectURL(url));
                setSelectedFiles([]);
                setPreviewUrls([]);
              }}
              className="px-6 py-2 border border-gray-200 rounded-[4px] text-charcoal hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <GlowingButton
              onClick={handleAddPhotos}
              disabled={selectedFiles.length === 0 || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Add Photos'}
            </GlowingButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

