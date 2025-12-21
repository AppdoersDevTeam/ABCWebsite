import React, { useState } from 'react';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';
import { MessageCircle, Heart, Edit, Trash2, Plus } from 'lucide-react';

interface PrayerRequest {
  id: string;
  name: string;
  date: string;
  content: string;
  count: number;
  isAnonymous?: boolean;
}

export const AdminPrayerWall = () => {
  const [requests, setRequests] = useState<PrayerRequest[]>([
    { id: '1', name: "Sarah M.", date: "2 days ago", content: "Please pray for my mother who is going into surgery tomorrow.", count: 5 },
    { id: '2', name: "Anonymous", date: "4 days ago", content: "Seeking guidance for a new job opportunity.", count: 2, isAnonymous: true },
    { id: '3', name: "The Wilson Family", date: "1 week ago", content: "Praise God for our new baby boy!", count: 12 },
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PrayerRequest | null>(null);
  const [formData, setFormData] = useState({ name: '', content: '', isAnonymous: false });

  const handleCreate = () => {
    const newRequest: PrayerRequest = {
      id: Date.now().toString(),
      name: formData.isAnonymous ? 'Anonymous' : formData.name,
      date: 'Just now',
      content: formData.content,
      count: 0,
      isAnonymous: formData.isAnonymous,
    };
    setRequests([newRequest, ...requests]);
    setFormData({ name: '', content: '', isAnonymous: false });
    setIsCreateModalOpen(false);
  };

  const handleEdit = (request: PrayerRequest) => {
    setEditingRequest(request);
    setFormData({
      name: request.isAnonymous ? '' : request.name,
      content: request.content,
      isAnonymous: request.isAnonymous || false,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = () => {
    if (!editingRequest) return;
    setRequests(requests.map(req =>
      req.id === editingRequest.id
        ? {
            ...req,
            name: formData.isAnonymous ? 'Anonymous' : formData.name,
            content: formData.content,
            isAnonymous: formData.isAnonymous,
          }
        : req
    ));
    setFormData({ name: '', content: '', isAnonymous: false });
    setEditingRequest(null);
    setIsEditModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this prayer request?')) {
      setRequests(requests.filter(req => req.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-charcoal">Prayer Wall Management</h1>
          <p className="text-neutral mt-1">Manage all prayer requests from the community.</p>
        </div>
        <GlowingButton size="sm" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Create Request
        </GlowingButton>
      </div>

      <div className="grid gap-6">
        {requests.map((req) => (
          <div key={req.id} className="bg-white border border-gray-100 shadow-sm p-6 rounded-[8px] hover:shadow-md hover:border-gold transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/10 text-charcoal flex items-center justify-center font-bold">
                  {req.name.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-charcoal block">{req.name}</span>
                  <span className="text-xs text-neutral uppercase tracking-widest">{req.date}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(req)}
                  className="p-2 text-neutral hover:text-gold hover:bg-gold/10 rounded-[4px] transition-colors"
                  title="Edit"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(req.id)}
                  className="p-2 text-neutral hover:text-red-500 hover:bg-red-50 rounded-[4px] transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <p className="text-charcoal leading-relaxed mb-6 text-lg font-light pl-12 border-l-2 border-gold/20">{req.content}</p>
            <div className="flex items-center space-x-6 border-t border-gray-100 pt-4 pl-12">
              <button className="flex items-center text-sm text-neutral hover:text-gold transition-colors font-bold uppercase tracking-wider">
                <Heart size={16} className="mr-2" /> Praying ({req.count})
              </button>
              <button className="flex items-center text-sm text-neutral hover:text-charcoal transition-colors font-bold uppercase tracking-wider">
                <MessageCircle size={16} className="mr-2" /> Encouragement
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormData({ name: '', content: '', isAnonymous: false });
        }}
        title="Create Prayer Request"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={formData.isAnonymous}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              placeholder="Enter name"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={formData.isAnonymous}
              onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="anonymous" className="text-sm text-charcoal">Post as Anonymous</label>
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Prayer Request</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              placeholder="Enter prayer request..."
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                setFormData({ name: '', content: '', isAnonymous: false });
              }}
              className="px-6 py-2 border border-gray-200 rounded-[4px] text-charcoal hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <GlowingButton onClick={handleCreate} disabled={!formData.content || (!formData.isAnonymous && !formData.name)}>
              Create Request
            </GlowingButton>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingRequest(null);
          setFormData({ name: '', content: '', isAnonymous: false });
        }}
        title="Edit Prayer Request"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={formData.isAnonymous}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              placeholder="Enter name"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="edit-anonymous"
              checked={formData.isAnonymous}
              onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="edit-anonymous" className="text-sm text-charcoal">Post as Anonymous</label>
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Prayer Request</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              placeholder="Enter prayer request..."
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingRequest(null);
                setFormData({ name: '', content: '', isAnonymous: false });
              }}
              className="px-6 py-2 border border-gray-200 rounded-[4px] text-charcoal hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <GlowingButton onClick={handleUpdate} disabled={!formData.content || (!formData.isAnonymous && !formData.name)}>
              Update Request
            </GlowingButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

