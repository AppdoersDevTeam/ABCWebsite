import React, { useState, useEffect } from 'react';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';
import { Mail, Phone, Edit, Trash2, Plus, User, Upload, X, Image as ImageIcon, UserPlus } from 'lucide-react';
import { TeamMember } from '../../types';
import { supabase } from '../../lib/supabase';
import { SkeletonPageHeader } from '../../components/UI/Skeleton';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';

export const AdminTeam = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const roleOptions = [
    'Administrator',
    'Associated Pastor',
    'Attendee',
    'Children Pastor',
    'Deacon',
    'Elder',
    'Member',
    'Ministry Leader',
    'Receptionist',
    'Senior Pastor',
    'Youth Adult Pastor',
    'Youth Pastor'
  ];

  const [formData, setFormData] = useState({ name: '', role: 'Attendee', email: '', phone: '', img: '', description: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      alert('Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a PNG, JPEG, or PDF file');
        return;
      }
      
      // Validate file size (300KB = 300 * 1024 bytes)
      const maxSize = 300 * 1024;
      if (file.size > maxSize) {
        alert('File size must be less than 300KB');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // For PDF, show a placeholder
        setPreviewUrl(null);
      }
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData({ ...formData, img: '' });
  };

  const handleCreate = async () => {
    // Validate all required fields (trim whitespace)
    const trimmedName = formData.name.trim();
    const trimmedRole = formData.role.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedDescription = formData.description.trim();

    // Validate name - must not be empty
    if (!trimmedName) {
      alert('Name is required. Please type the name.');
      return;
    }

    // Validate role
    if (!trimmedRole) {
      alert('Role is required.');
      return;
    }

    // Validate email - must be valid email format
    if (!trimmedEmail) {
      alert('Email is required. Please type a valid email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Validate phone - only numbers allowed
    if (!trimmedPhone) {
      alert('Phone is required.');
      return;
    }
    const phoneRegex = /^[0-9\s\-\(\)]+$/;
    if (!phoneRegex.test(trimmedPhone)) {
      alert('Phone number can only contain numbers, spaces, hyphens, and parentheses.');
      return;
    }

    // Validate photo - required for all roles except Attendee
    if (trimmedRole !== 'Attendee' && !selectedFile && !formData.img) {
      alert('Photo is required for this role. Please upload a photo.');
      return;
    }

    // Validate description - optional, but if provided must not exceed 350 characters
    if (trimmedDescription.length > 350) {
      alert('Description must not exceed 350 characters. Current length: ' + trimmedDescription.length);
      return;
    }

    setIsUploading(true);

    try {
      let imageUrl = formData.img;

      // Upload file if selected
      if (selectedFile) {
        try {
          const fileExt = selectedFile.name.split('.').pop() || 'png';
          const fileName = `team-images/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('team-images')
            .upload(fileName, selectedFile, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            // If bucket doesn't exist or upload fails, save as base64 in database
            console.warn('Storage upload failed, saving as base64:', uploadError.message);
            
            // Convert file to base64
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve, reject) => {
              reader.onloadend = () => {
                if (reader.result) {
                  resolve(reader.result as string);
                } else {
                  reject(new Error('Failed to convert file to base64'));
                }
              };
              reader.onerror = reject;
            });
            
            reader.readAsDataURL(selectedFile);
            imageUrl = await base64Promise;
          } else {
            // Get public URL
            const { data: urlData } = supabase.storage.from('team-images').getPublicUrl(fileName);
            imageUrl = urlData.publicUrl;
          }
        } catch (uploadError: any) {
          // Fallback: convert to base64 if storage fails
          console.warn('Storage upload failed, using base64 fallback:', uploadError.message);
          
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              if (reader.result) {
                resolve(reader.result as string);
              } else {
                reject(new Error('Failed to convert file to base64'));
              }
            };
            reader.onerror = reject;
          });
          
          reader.readAsDataURL(selectedFile);
          imageUrl = await base64Promise;
        }
      }

      // Build insert data object with all required fields
      const insertData: any = {
        name: trimmedName,
        role: trimmedRole,
        email: trimmedEmail,
        phone: trimmedPhone,
        img: imageUrl || '', // Empty string if no image uploaded
        description: trimmedDescription || '', // Allow empty description
      };

      const { data, error } = await supabase
        .from('team_members')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        // If error is about missing description column, try saving without it
        if (error.message && (error.message.includes('description') || error.message.includes('column') && error.message.includes('team_members'))) {
          console.warn('Description column not found, attempting to save without description field');
          
          // Try to save without description
          const insertDataWithoutDescription = {
            name: trimmedName,
            role: trimmedRole,
            email: trimmedEmail,
            phone: trimmedPhone,
            img: imageUrl || '',
          };
          
          const { data: retryData, error: retryError } = await supabase
            .from('team_members')
            .insert([insertDataWithoutDescription])
            .select()
            .single();
          
          if (retryError) {
            console.error('Error saving without description:', retryError);
            alert('Error saving team member: ' + retryError.message + '\n\nPlease run this SQL in Supabase SQL Editor:\n\nALTER TABLE team_members ADD COLUMN IF NOT EXISTS description VARCHAR(350) NOT NULL DEFAULT \'\';\n\nThen update existing records:\nUPDATE team_members SET description = \'\' WHERE description IS NULL;\n\nThen make it required:\nALTER TABLE team_members ALTER COLUMN description SET NOT NULL;\nALTER TABLE team_members ALTER COLUMN description DROP DEFAULT;');
            setIsUploading(false);
            return;
          }
          
          setMembers([...members, retryData]);
          setFormData({ name: '', role: 'Attendee', email: '', phone: '', img: '', description: '' });
          handleRemoveFile();
          setIsModalOpen(false);
          alert('Team member saved successfully!\n\nNote: Description was not saved because the description column does not exist in the database yet.\n\nTo enable description field, please run this SQL in Supabase SQL Editor:\n\nALTER TABLE team_members ADD COLUMN IF NOT EXISTS description VARCHAR(350) NOT NULL DEFAULT \'\';\nUPDATE team_members SET description = \'\' WHERE description IS NULL;\nALTER TABLE team_members ALTER COLUMN description SET NOT NULL;\nALTER TABLE team_members ALTER COLUMN description DROP DEFAULT;');
          return;
        }
        throw error;
      }

      setMembers([...members, data]);
      setFormData({ name: '', role: 'Attendee', email: '', phone: '', img: '', description: '' });
      handleRemoveFile();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error creating team member:', error);
      alert(error.message || 'Failed to create team member');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      email: member.email || '',
      phone: member.phone || '',
      img: member.img || '',
      description: member.description || '',
    });
    setSelectedFile(null);
    setPreviewUrl(member.img || null);
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingMember) return;

    setIsUploading(true);

    try {
      let imageUrl = formData.img;
      let oldImageUrl = editingMember.img;

      // Upload new file if selected
      if (selectedFile) {
        try {
          const fileExt = selectedFile.name.split('.').pop() || 'png';
          const fileName = `team-images/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('team-images')
            .upload(fileName, selectedFile, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            // If bucket doesn't exist or upload fails, save as base64 in database
            console.warn('Storage upload failed, saving as base64:', uploadError.message);
            
            // Convert file to base64
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve, reject) => {
              reader.onloadend = () => {
                if (reader.result) {
                  resolve(reader.result as string);
                } else {
                  reject(new Error('Failed to convert file to base64'));
                }
              };
              reader.onerror = reject;
            });
            
            reader.readAsDataURL(selectedFile);
            imageUrl = await base64Promise;
          } else {
            // Get public URL
            const { data: urlData } = supabase.storage.from('team-images').getPublicUrl(fileName);
            imageUrl = urlData.publicUrl;
          }
        } catch (uploadError: any) {
          // Fallback: convert to base64 if storage fails
          console.warn('Storage upload failed, using base64 fallback:', uploadError.message);
          
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              if (reader.result) {
                resolve(reader.result as string);
              } else {
                reject(new Error('Failed to convert file to base64'));
              }
            };
            reader.onerror = reject;
          });
          
          reader.readAsDataURL(selectedFile);
          imageUrl = await base64Promise;
        }

        // Delete old image from storage if it exists and is from our storage (not base64)
        if (oldImageUrl && oldImageUrl.includes('team-images') && !oldImageUrl.startsWith('data:')) {
          try {
            // Extract file path from URL
            const urlParts = oldImageUrl.split('/team-images/');
            if (urlParts.length > 1) {
              const filePath = `team-images/${urlParts[1]}`;
              await supabase.storage.from('team-images').remove([filePath]);
            }
          } catch (deleteError) {
            console.warn('Error deleting old image:', deleteError);
            // Continue even if deletion fails
          }
        }
      }

      // Validate all required fields (trim whitespace)
      const trimmedName = formData.name.trim();
      const trimmedRole = formData.role.trim();
      const trimmedEmail = formData.email.trim();
      const trimmedPhone = formData.phone.trim();
      const trimmedDescription = formData.description.trim();

      // Validate name - must not be empty
      if (!trimmedName) {
        alert('Name is required. Please type the name.');
        setIsUploading(false);
        return;
      }

      // Validate role
      if (!trimmedRole) {
        alert('Role is required.');
        setIsUploading(false);
        return;
      }

      // Validate email - must be valid email format
      if (!trimmedEmail) {
        alert('Email is required. Please type a valid email address.');
        setIsUploading(false);
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        alert('Please enter a valid email address.');
        setIsUploading(false);
        return;
      }

      // Validate phone - only numbers allowed
      if (!trimmedPhone) {
        alert('Phone is required.');
        setIsUploading(false);
        return;
      }
      const phoneRegex = /^[0-9\s\-\(\)]+$/;
      if (!phoneRegex.test(trimmedPhone)) {
        alert('Phone number can only contain numbers, spaces, hyphens, and parentheses.');
        setIsUploading(false);
        return;
      }

      // Validate photo - required for all roles except Attendee (for update, check if there's existing image or new file)
      if (trimmedRole !== 'Attendee' && !selectedFile && !imageUrl && !editingMember?.img) {
        alert('Photo is required for this role. Please upload a photo.');
        setIsUploading(false);
        return;
      }

      // Validate description - optional, but if provided must not exceed 350 characters
      if (trimmedDescription.length > 350) {
        alert('Description must not exceed 350 characters. Current length: ' + trimmedDescription.length);
        setIsUploading(false);
        return;
      }

      // Build update data object with all required fields
      const updateData: any = {
        name: trimmedName,
        role: trimmedRole,
        email: trimmedEmail,
        phone: trimmedPhone,
        img: imageUrl || '', // Empty string if no image uploaded
        description: trimmedDescription || '', // Allow empty description
      };

      const { error } = await supabase
        .from('team_members')
        .update(updateData)
        .eq('id', editingMember.id);

      if (error) {
        // If error is about missing description column, try updating without it
        if (error.message && (error.message.includes('description') || error.message.includes('column') && error.message.includes('team_members'))) {
          console.warn('Description column not found, attempting to update without description field');
          
          // Try to update without description
          const updateDataWithoutDescription = {
            name: trimmedName,
            role: trimmedRole,
            email: trimmedEmail,
            phone: trimmedPhone,
            img: imageUrl || '',
          };
          
          const { error: retryError } = await supabase
            .from('team_members')
            .update(updateDataWithoutDescription)
            .eq('id', editingMember.id);
          
          if (retryError) {
            console.error('Error updating without description:', retryError);
            alert('Error updating team member: ' + retryError.message + '\n\nPlease run this SQL in Supabase SQL Editor:\n\nALTER TABLE team_members ADD COLUMN IF NOT EXISTS description VARCHAR(350) NOT NULL DEFAULT \'\';\n\nThen update existing records:\nUPDATE team_members SET description = \'\' WHERE description IS NULL;\n\nThen make it required:\nALTER TABLE team_members ALTER COLUMN description SET NOT NULL;\nALTER TABLE team_members ALTER COLUMN description DROP DEFAULT;');
            setIsUploading(false);
            return;
          }
          
          fetchMembers();
          setFormData({ name: '', role: 'Attendee', email: '', phone: '', img: '', description: '' });
          handleRemoveFile();
          setEditingMember(null);
          setIsModalOpen(false);
          alert('Team member updated successfully!\n\nNote: Description was not saved because the description column does not exist in the database yet.\n\nTo enable description field, please run this SQL in Supabase SQL Editor:\n\nALTER TABLE team_members ADD COLUMN IF NOT EXISTS description VARCHAR(350) NOT NULL DEFAULT \'\';\nUPDATE team_members SET description = \'\' WHERE description IS NULL;\nALTER TABLE team_members ALTER COLUMN description SET NOT NULL;\nALTER TABLE team_members ALTER COLUMN description DROP DEFAULT;');
          return;
        }
        throw error;
      }

      fetchMembers();
      setFormData({ name: '', role: 'Attendee', email: '', phone: '', img: '', description: '' });
      handleRemoveFile();
      setEditingMember(null);
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error updating team member:', error);
      alert(error.message || 'Failed to update team member');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) {
      return;
    }

    try {
      const { error } = await supabase.from('team_members').delete().eq('id', id);

      if (error) throw error;

      setMembers(members.filter(m => m.id !== id));
    } catch (error: any) {
      console.error('Error deleting team member:', error);
      alert(error.message || 'Failed to delete team member');
    }
  };

  const openCreateModal = () => {
    setEditingMember(null);
    setFormData({ name: '', role: 'Attendee', email: '', phone: '', img: '', description: '' });
    handleRemoveFile();
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SkeletonPageHeader />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Team Management"
        subtitle="Manage staff and leadership team members."
        icon={<User size={28} />}
        rightSlot={
          <GlowingButton size="sm" fullWidth className="md:w-auto" onClick={openCreateModal}>
            <UserPlus size={16} className="mr-2" />
            Add Member
          </GlowingButton>
        }
      />

      {members.length === 0 ? (
        <div className="text-center py-12 glass-card bg-white/80 border border-white/60 rounded-[12px]">
          <p className="text-neutral">No team members yet. Add your first team member to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <VibrantCard key={member.id} className="group bg-white shadow-sm hover:shadow-md hover:border-gold relative">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(member)}
                className="p-2 bg-white border border-gray-200 rounded-[4px] text-neutral hover:text-gold hover:border-gold transition-colors"
                title="Edit"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDelete(member.id)}
                className="p-2 bg-white border border-gray-200 rounded-[4px] text-neutral hover:text-red-500 hover:border-red-200 transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-gold transition-colors flex-shrink-0">
                {member.img ? (
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gold/10 flex items-center justify-center">
                    <User size={32} className="text-gold" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xl text-charcoal truncate">{member.name}</h4>
                <p className="text-xs text-gold font-bold uppercase tracking-wider mb-4">{member.role}</p>
                <div className="flex space-x-4 text-neutral">
                  {member.email && (
                    <a href={`mailto:${member.email}`} className="hover:text-gold transition-colors" title={member.email}>
                      <Mail size={18} />
                    </a>
                  )}
                  {member.phone && (
                    <a href={`tel:${member.phone}`} className="hover:text-gold transition-colors" title={member.phone}>
                      <Phone size={18} />
                    </a>
                  )}
                </div>
                {member.description && (
                  <p className="text-sm text-neutral mt-4 line-clamp-3">{member.description}</p>
                )}
              </div>
            </div>
          </VibrantCard>
        ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMember(null);
          setFormData({ name: '', role: 'Attendee', email: '', phone: '', img: '', description: '' });
          handleRemoveFile();
        }}
        title={editingMember ? 'Edit Team Member' : 'Add Team Member'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              placeholder="Enter name"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none bg-white"
              required
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              placeholder="type a valid email address"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Phone *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                // Only allow numbers, spaces, hyphens, and parentheses
                const value = e.target.value;
                if (/^[0-9\s\-\(\)]*$/.test(value)) {
                  setFormData({ ...formData, phone: value });
                }
              }}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              placeholder="03-308 5409"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">
              Photo {formData.role !== 'Attendee' ? '*' : ''} (max 300KB{formData.role !== 'Attendee' ? ', required' : ', optional for Attendee'})
            </label>
            <div className="flex items-center gap-4">
              {/* Photo Preview - Circular like team management view */}
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                {previewUrl && (() => {
                  // Check if we should show image preview
                  const isImage = selectedFile 
                    ? selectedFile.type.startsWith('image/')
                    : previewUrl && !previewUrl.toLowerCase().endsWith('.pdf') && (previewUrl.startsWith('blob:') || previewUrl.startsWith('http') || previewUrl.startsWith('data:'));
                  
                  if (isImage && previewUrl) {
                    return (
                      <img 
                        src={previewUrl} 
                        alt="Team member" 
                        className="w-full h-full object-cover"
                      />
                    );
                  } else {
                    return (
                      <div className="w-full h-full bg-gold/10 flex items-center justify-center">
                        <User size={32} className="text-gold" />
                      </div>
                    );
                  }
                })()}
                {!previewUrl && (
                  <div className="w-full h-full bg-gold/10 flex items-center justify-center">
                    <User size={32} className="text-gold" />
                  </div>
                )}
              </div>

              {/* Upload Button on the Right */}
              <div className="flex-1">
                <label 
                  htmlFor="team-image-upload"
                  className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-[4px] cursor-pointer bg-white hover:bg-gray-50 hover:border-gold transition-colors"
                >
                  <Upload size={18} className="text-charcoal" />
                  <span className="text-sm font-bold text-charcoal">
                    {previewUrl || selectedFile ? 'Change Image' : 'Upload Image'}
                  </span>
                </label>
                <input
                  type="file"
                  className="hidden"
                  accept=".png,.jpeg,.jpg,.pdf"
                  onChange={handleFileSelect}
                  id="team-image-upload"
                />
                {selectedFile && (
                  <div className="mt-2 flex items-center gap-2">
                    <p className="text-xs text-neutral">
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-xs text-red-500 hover:text-red-700 transition-colors"
                      title="Remove file"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                {!selectedFile && previewUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="mt-2 text-xs text-red-500 hover:text-red-700 transition-colors"
                    title="Remove image"
                  >
                    Remove image
                  </button>
                )}
                <p className="text-xs text-neutral mt-1">PNG, JPEG, or PDF (max 300KB)</p>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Description (Optional, max 350 characters)</label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 350) {
                  setFormData({ ...formData, description: value });
                }
              }}
              className={`w-full p-3 rounded-[4px] border focus:outline-none resize-none ${
                formData.description.length > 350
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-200 focus:border-gold'
              }`}
              placeholder="Enter description (optional, max 350 characters)"
              rows={3}
              maxLength={350}
            />
            <p className={`text-xs mt-1 ${
              formData.description.length > 350
                ? 'text-red-500'
                : 'text-neutral'
            }`}>
              {formData.description.length}/350 characters
            </p>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingMember(null);
                setFormData({ name: '', role: 'Attendee', email: '', phone: '', img: '', description: '' });
                handleRemoveFile();
              }}
              className="px-6 py-2 border border-gray-200 rounded-[4px] text-charcoal hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <GlowingButton
              onClick={editingMember ? handleUpdate : handleCreate}
              disabled={
                !formData.name.trim() || 
                !formData.role.trim() || 
                !formData.email.trim() || 
                !formData.phone.trim() || 
                formData.description.trim().length > 350 || 
                isUploading
              }
            >
              {isUploading ? 'Uploading...' : (editingMember ? 'Update Member' : 'Add Member')}
            </GlowingButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

