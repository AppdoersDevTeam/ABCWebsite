import React, { useState, useEffect } from 'react';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';
import { Mail, Phone, Edit, Trash2, Plus, User } from 'lucide-react';
import { TeamMember } from '../../types';
import { supabase } from '../../lib/supabase';
import { SkeletonPageHeader } from '../../components/UI/Skeleton';

export const AdminTeam = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({ name: '', role: '', email: '', phone: '', img: '', description: '' });

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

  const handleCreate = async () => {
    if (!formData.name || !formData.role) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert([
          {
            name: formData.name,
            role: formData.role,
            email: formData.email || null,
            phone: formData.phone || null,
            img: formData.img || null,
            description: formData.description || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setMembers([...members, data]);
      setFormData({ name: '', role: '', email: '', phone: '', img: '', description: '' });
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error creating team member:', error);
      alert(error.message || 'Failed to create team member');
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
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingMember) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .update({
          name: formData.name,
          role: formData.role,
          email: formData.email || null,
          phone: formData.phone || null,
          img: formData.img || null,
          description: formData.description || null,
        })
        .eq('id', editingMember.id);

      if (error) throw error;

      fetchMembers();
      setFormData({ name: '', role: '', email: '', phone: '', img: '', description: '' });
      setEditingMember(null);
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error updating team member:', error);
      alert(error.message || 'Failed to update team member');
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
    setFormData({ name: '', role: '', email: '', phone: '', img: '', description: '' });
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
      <div className="flex justify-between items-center border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-normal text-charcoal">Team Management</h1>
          <p className="text-neutral mt-1">Manage staff and leadership team members.</p>
        </div>
        <GlowingButton size="sm" onClick={openCreateModal}>
          <Plus size={16} className="mr-2" />
          Add Member
        </GlowingButton>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12">
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
          setFormData({ name: '', role: '', email: '', phone: '', img: '', description: '' });
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
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              placeholder="e.g., Youth Pastor"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              placeholder="email@church.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              placeholder="03-308 5409"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Image URL (Optional)</label>
            <input
              type="url"
              value={formData.img}
              onChange={(e) => setFormData({ ...formData, img: e.target.value })}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Description (Optional, max 300 characters)</label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 300) {
                  setFormData({ ...formData, description: value });
                }
              }}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none resize-none"
              placeholder="Enter description (max 300 characters)"
              rows={4}
              maxLength={300}
            />
            <p className="text-xs text-neutral mt-1">{formData.description.length}/300 characters</p>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingMember(null);
                setFormData({ name: '', role: '', email: '', phone: '', img: '', description: '' });
              }}
              className="px-6 py-2 border border-gray-200 rounded-[4px] text-charcoal hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <GlowingButton
              onClick={editingMember ? handleUpdate : handleCreate}
              disabled={!formData.name || !formData.role}
            >
              {editingMember ? 'Update Member' : 'Add Member'}
            </GlowingButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

