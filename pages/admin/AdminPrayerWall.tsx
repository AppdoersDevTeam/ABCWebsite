import React, { useState, useEffect } from 'react';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';
import { Heart, Edit, Trash2, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PrayerRequest } from '../../types';
import { SkeletonPageHeader, SkeletonPrayerCard } from '../../components/UI/Skeleton';
import { getUserTimezone, formatRelativeDateInTimezone } from '../../lib/dateUtils';

export const AdminPrayerWall = () => {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PrayerRequest | null>(null);
  const [formData, setFormData] = useState({ name: '', content: '', isAnonymous: false, isConfidential: false });

  useEffect(() => {
    fetchPrayerRequests();
  }, []);

  const fetchPrayerRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('prayer_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching prayer requests:', error);
      alert('Failed to load prayer requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.content || (!formData.isAnonymous && !formData.name)) {
      return;
    }

    try {
      const userTimezone = getUserTimezone();
      const { data, error } = await supabase
        .from('prayer_requests')
        .insert([
          {
            name: formData.isAnonymous ? 'Anonymous' : formData.name,
            content: formData.content,
            is_anonymous: formData.isAnonymous,
            is_confidential: formData.isConfidential,
            prayer_count: 0,
            user_timezone: userTimezone,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setRequests([data, ...requests]);
      setFormData({ name: '', content: '', isAnonymous: false, isConfidential: false });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating prayer request:', error);
      alert('Failed to create prayer request');
    }
  };

  const handleEdit = (request: PrayerRequest) => {
    setEditingRequest(request);
    setFormData({
      name: request.is_anonymous ? '' : request.name,
      content: request.content,
      isAnonymous: request.is_anonymous || false,
      isConfidential: request.is_confidential || false,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingRequest) return;

    try {
      const { error } = await supabase
        .from('prayer_requests')
        .update({
          name: formData.isAnonymous ? 'Anonymous' : formData.name,
          content: formData.content,
          is_anonymous: formData.isAnonymous,
          is_confidential: formData.isConfidential,
        })
        .eq('id', editingRequest.id);

      if (error) throw error;

      // Refresh requests
      fetchPrayerRequests();
      setFormData({ name: '', content: '', isAnonymous: false, isConfidential: false });
      setEditingRequest(null);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating prayer request:', error);
      alert('Failed to update prayer request');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this prayer request? This action cannot be undone.')) {
      return;
    }

    try {
      // First delete all prayer counts for this request
      const { error: countsError } = await supabase
        .from('prayer_counts')
        .delete()
        .eq('prayer_request_id', id);

      if (countsError) {
        console.error('Error deleting prayer counts:', countsError);
        // Continue with deletion even if counts deletion fails (CASCADE will handle it)
      }

      // Then delete the request (this will permanently remove it from the database)
      const { error } = await supabase
        .from('prayer_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from local state and refresh from database to ensure consistency
      setRequests(requests.filter(req => req.id !== id));
      // Refetch to ensure the deletion is reflected everywhere
      await fetchPrayerRequests();
    } catch (error) {
      console.error('Error deleting prayer request:', error);
      alert('Failed to delete prayer request. Please make sure you have admin permissions.');
    }
  };

  const formatDate = (dateString: string, originalTimezone?: string) => {
    // For admin views, display dates in the admin's current timezone
    return formatRelativeDateInTimezone(dateString, originalTimezone);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SkeletonPageHeader />
        <div className="grid gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonPrayerCard key={i} />
          ))}
        </div>
      </div>
    );
  }

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

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral">No prayer requests yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white border border-gray-100 shadow-sm p-6 rounded-[8px] hover:shadow-md hover:border-gold transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/10 text-charcoal flex items-center justify-center font-bold">
                    {req.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-charcoal block">{req.name}</span>
                      {req.is_confidential && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Confidential</span>
                      )}
                    </div>
                    <span className="text-xs text-neutral uppercase tracking-widest">
                      {formatDate(req.created_at, req.user_timezone)}
                    </span>
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
              <p className="text-charcoal leading-relaxed mb-6 text-lg font-light pl-12 border-l-2 border-gold/20">
                {req.content}
              </p>
              <div className="flex items-center border-t border-gray-100 pt-4 pl-12">
                <div className="flex items-center text-sm text-neutral font-bold uppercase tracking-wider">
                  <Heart size={16} className="mr-2" /> Praying ({req.prayer_count})
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="confidential"
              checked={formData.isConfidential}
              onChange={(e) => setFormData({ ...formData, isConfidential: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="confidential" className="text-sm text-charcoal">Keep Confidential (Pastors only)</label>
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
                setFormData({ name: '', content: '', isAnonymous: false, isConfidential: false });
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
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="edit-confidential"
              checked={formData.isConfidential}
              onChange={(e) => setFormData({ ...formData, isConfidential: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="edit-confidential" className="text-sm text-charcoal">Keep Confidential (Pastors only)</label>
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
                setFormData({ name: '', content: '', isAnonymous: false, isConfidential: false });
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

