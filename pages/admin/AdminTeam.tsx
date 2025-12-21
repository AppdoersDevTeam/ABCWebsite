import React, { useState } from 'react';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';
import { Mail, Phone, Edit, Trash2, Plus, User } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  img?: string;
}

export const AdminTeam = () => {
  const [members, setMembers] = useState<TeamMember[]>([
    { id: '1', name: "Alex Johnson", role: "Youth Pastor", email: "alex@church.com", phone: "03-308 5409", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
    { id: '2', name: "Maria Garcia", role: "Worship Leader", email: "maria@church.com", phone: "03-308 5410", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" },
    { id: '3', name: "James Wilson", role: "Elder", email: "james@church.com", phone: "03-308 5411", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80" },
    { id: '4', name: "Linda Chen", role: "Admin", email: "linda@church.com", phone: "03-308 5412", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80" },
    { id: '5', name: "Robert Taylor", role: "Facilities", email: "robert@church.com", phone: "03-308 5413", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
    { id: '6', name: "Patricia Lee", role: "Children's Ministry", email: "patricia@church.com", phone: "03-308 5414", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({ name: '', role: '', email: '', phone: '', img: '' });

  const handleCreate = () => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      ...formData,
    };
    setMembers([...members, newMember]);
    setFormData({ name: '', role: '', email: '', phone: '', img: '' });
    setIsModalOpen(false);
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      email: member.email || '',
      phone: member.phone || '',
      img: member.img || '',
    });
    setIsModalOpen(true);
  };

  const handleUpdate = () => {
    if (!editingMember) return;
    setMembers(members.map(m =>
      m.id === editingMember.id
        ? { ...m, ...formData }
        : m
    ));
    setFormData({ name: '', role: '', email: '', phone: '', img: '' });
    setEditingMember(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const openCreateModal = () => {
    setEditingMember(null);
    setFormData({ name: '', role: '', email: '', phone: '', img: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-charcoal">Team Management</h1>
          <p className="text-neutral mt-1">Manage staff and leadership team members.</p>
        </div>
        <GlowingButton size="sm" onClick={openCreateModal}>
          <Plus size={16} className="mr-2" />
          Add Member
        </GlowingButton>
      </div>

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
              </div>
            </div>
          </VibrantCard>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMember(null);
          setFormData({ name: '', role: '', email: '', phone: '', img: '' });
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
          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingMember(null);
                setFormData({ name: '', role: '', email: '', phone: '', img: '' });
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

