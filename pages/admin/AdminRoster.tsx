import React, { useState } from 'react';
import { Download, Filter, ChevronLeft, ChevronRight, Check, X, Clock, Edit, Trash2, Plus, Upload, Image as ImageIcon } from 'lucide-react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';
import { RosterMember } from '../../types';

export const AdminRoster = () => {
  const [rosterData, setRosterData] = useState<RosterMember[]>([
    { id: '1', name: 'Sarah Jenkins', role: 'Worship Leader', date: 'Oct 24', status: 'confirmed', team: 'Worship' },
    { id: '2', name: 'Michael Chen', role: 'Bass Guitar', date: 'Oct 24', status: 'pending', team: 'Worship' },
    { id: '3', name: 'David Smith', role: 'Sound Engineer', date: 'Oct 24', status: 'confirmed', team: 'Tech' },
    { id: '4', name: 'Emily White', role: 'Visuals', date: 'Oct 24', status: 'declined', team: 'Tech' },
  ]);

  const [rosterImage, setRosterImage] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<RosterMember | null>(null);
  const [formData, setFormData] = useState({ name: '', role: '', date: '', status: 'pending' as RosterMember['status'], team: 'Worship' as RosterMember['team'] });

  const handleAssign = () => {
    if (editingMember) {
      setRosterData(rosterData.map(m =>
        m.id === editingMember.id
          ? { ...m, ...formData }
          : m
      ));
    } else {
      const newMember: RosterMember = {
        id: Date.now().toString(),
        ...formData,
      };
      setRosterData([...rosterData, newMember]);
    }
    setFormData({ name: '', role: '', date: '', status: 'pending', team: 'Worship' });
    setEditingMember(null);
    setIsAssignModalOpen(false);
  };

  const handleEdit = (member: RosterMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      date: member.date,
      status: member.status,
      team: member.team,
    });
    setIsAssignModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this roster assignment?')) {
      setRosterData(rosterData.filter(m => m.id !== id));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setRosterImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openCreateModal = () => {
    setEditingMember(null);
    setFormData({ name: '', role: '', date: '', status: 'pending', team: 'Worship' });
    setIsAssignModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-charcoal">Roster Management</h1>
          <p className="text-neutral mt-1">Assign roster to users and upload roster images.</p>
        </div>
        <div className="flex gap-3">
          <GlowingButton variant="outline" size="sm" onClick={() => setIsImageModalOpen(true)}>
            <Upload size={16} className="mr-2" />
            Upload Image
          </GlowingButton>
          <GlowingButton variant="gold" size="sm" onClick={openCreateModal}>
            <Plus size={16} className="mr-2" />
            Assign Roster
          </GlowingButton>
        </div>
      </div>

      {/* Roster Image Display */}
      {rosterImage && (
        <div className="bg-white border border-gray-100 rounded-[8px] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-charcoal">Current Roster Image</h3>
            <button
              onClick={() => setRosterImage(null)}
              className="text-red-500 hover:text-red-700 text-sm font-bold"
            >
              Remove
            </button>
          </div>
          <img src={rosterImage} alt="Roster" className="w-full max-w-2xl mx-auto rounded-[4px] border border-gray-200" />
        </div>
      )}

      {/* Date Nav */}
      <div className="flex items-center justify-between bg-white p-4 rounded-[8px] border border-gray-200 shadow-sm">
        <button className="p-2 hover:bg-gray-100 rounded-full text-charcoal transition-colors"><ChevronLeft /></button>
        <div className="text-center">
          <h3 className="font-bold text-xl text-charcoal">Sunday Service</h3>
          <p className="text-sm text-gold font-bold uppercase tracking-widest">Oct 24 • 10:00 AM</p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full text-charcoal transition-colors"><ChevronRight /></button>
      </div>

      {/* Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rosterData.map((member) => (
          <div key={member.id} className="bg-white border border-gray-100 p-6 rounded-[8px] hover:border-gold hover:shadow-md transition-all duration-300 relative overflow-hidden group shadow-sm">
            {/* Status Indicator Bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
              member.status === 'confirmed' ? 'bg-green-500' : 
              member.status === 'declined' ? 'bg-red-500' : 'bg-gold'
            }`}></div>

            <div className="flex justify-between items-start mb-4 pl-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-charcoal font-serif font-bold">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-charcoal">{member.name}</h4>
                  <p className="text-xs text-neutral uppercase tracking-wider">{member.team}</p>
                </div>
              </div>
              
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(member)}
                  className="p-1 text-neutral hover:text-gold transition-colors"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="p-1 text-neutral hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {member.status === 'confirmed' && <Check size={20} className="text-green-500" />}
              {member.status === 'declined' && <X size={20} className="text-red-500" />}
              {member.status === 'pending' && <Clock size={20} className="text-gold animate-pulse" />}
            </div>

            <div className="pl-4">
              <p className="text-sm text-neutral mb-4">Role: <span className="text-charcoal font-bold">{member.role}</span></p>
              
              <div className="flex gap-2">
                <button className="flex-1 bg-gray-50 hover:bg-gray-100 py-2 rounded text-xs font-bold text-charcoal uppercase tracking-wider transition-colors">Edit</button>
                <button className="flex-1 bg-gray-50 hover:bg-gray-100 py-2 rounded text-xs font-bold text-charcoal uppercase tracking-wider transition-colors">Contact</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Assign Roster Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setEditingMember(null);
          setFormData({ name: '', role: '', date: '', status: 'pending', team: 'Worship' });
        }}
        title={editingMember ? 'Edit Roster Assignment' : 'Assign Roster'}
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
              placeholder="e.g., Worship Leader"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2">Date *</label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
                placeholder="e.g., Oct 24"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2">Team *</label>
              <select
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value as RosterMember['team'] })}
                className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              >
                <option value="Worship">Worship</option>
                <option value="Tech">Tech</option>
                <option value="Welcome">Welcome</option>
                <option value="Kids">Kids</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Status *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as RosterMember['status'] })}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="declined">Declined</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => {
                setIsAssignModalOpen(false);
                setEditingMember(null);
                setFormData({ name: '', role: '', date: '', status: 'pending', team: 'Worship' });
              }}
              className="px-6 py-2 border border-gray-200 rounded-[4px] text-charcoal hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <GlowingButton
              onClick={handleAssign}
              disabled={!formData.name || !formData.role || !formData.date}
            >
              {editingMember ? 'Update Assignment' : 'Assign Roster'}
            </GlowingButton>
          </div>
        </div>
      </Modal>

      {/* Upload Image Modal */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        title="Upload Roster Image"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Roster Image</label>
            <div className="border-2 border-dashed border-gray-300 rounded-[4px] p-6 text-center hover:border-gold transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="roster-image-upload"
              />
              <label htmlFor="roster-image-upload" className="cursor-pointer">
                <ImageIcon size={32} className="mx-auto text-neutral mb-2" />
                <p className="text-sm text-charcoal">Click to upload image</p>
                <p className="text-xs text-neutral">or drag and drop</p>
              </label>
            </div>
          </div>
          {rosterImage && (
            <div className="mt-4">
              <p className="text-sm font-bold text-charcoal mb-2">Preview:</p>
              <img src={rosterImage} alt="Roster preview" className="w-full rounded-[4px] border border-gray-200" />
            </div>
          )}
          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="px-6 py-2 border border-gray-200 rounded-[4px] text-charcoal hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <GlowingButton
              onClick={() => {
                setIsImageModalOpen(false);
                alert('Roster image uploaded successfully!');
              }}
              disabled={!rosterImage}
            >
              Upload Image
            </GlowingButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

