import React, { useState, useEffect } from 'react';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';
import { MessageCircle, Heart } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { PrayerRequest } from '../../types';
import { SkeletonPageHeader, SkeletonPrayerCard } from '../../components/UI/Skeleton';

export const PrayerWall = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', content: '', isAnonymous: false });
  const [prayingFor, setPrayingFor] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPrayerRequests();
    if (user) {
      fetchUserPrayerCounts();
    }
  }, [user]);

  const fetchPrayerRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('prayer_requests')
        .select('*')
        .eq('is_confidential', false) // Only show non-confidential requests
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching prayer requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPrayerCounts = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('prayer_counts')
        .select('prayer_request_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setPrayingFor(new Set(data?.map(p => p.prayer_request_id) || []));
    } catch (error) {
      console.error('Error fetching prayer counts:', error);
    }
  };

  const handleSubmitRequest = async () => {
    if (!formData.content || (!formData.isAnonymous && !formData.name)) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('prayer_requests')
        .insert([
          {
            user_id: user?.id,
            name: formData.isAnonymous ? 'Anonymous' : formData.name,
            content: formData.content,
            is_anonymous: formData.isAnonymous,
            is_confidential: false,
            prayer_count: 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setRequests([data, ...requests]);
      setFormData({ name: '', content: '', isAnonymous: false });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error submitting prayer request:', error);
      alert('Failed to submit prayer request');
    }
  };

  const handlePrayingClick = async (requestId: string) => {
    if (!user) return;

    const isPraying = prayingFor.has(requestId);

    try {
      if (isPraying) {
        // Remove prayer count
        const { error } = await supabase
          .from('prayer_counts')
          .delete()
          .eq('prayer_request_id', requestId)
          .eq('user_id', user.id);

        if (error) throw error;

        // Decrement prayer count
        const request = requests.find(r => r.id === requestId);
        if (request) {
          const { error: updateError } = await supabase
            .from('prayer_requests')
            .update({ prayer_count: Math.max(0, request.prayer_count - 1) })
            .eq('id', requestId);

          if (updateError) throw updateError;
        }

        setPrayingFor(prev => {
          const next = new Set(prev);
          next.delete(requestId);
          return next;
        });
      } else {
        // Add prayer count
        const { error } = await supabase
          .from('prayer_counts')
          .insert([
            {
              prayer_request_id: requestId,
              user_id: user.id,
            },
          ]);

        if (error) throw error;

        // Increment prayer count
        const request = requests.find(r => r.id === requestId);
        if (request) {
          const { error: updateError } = await supabase
            .from('prayer_requests')
            .update({ prayer_count: request.prayer_count + 1 })
            .eq('id', requestId);

          if (updateError) throw updateError;
        }

        setPrayingFor(prev => new Set(prev).add(requestId));
      }

      // Refresh requests to get updated counts
      fetchPrayerRequests();
    } catch (error) {
      console.error('Error updating prayer count:', error);
      alert('Failed to update prayer count');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
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
          <h1 className="text-4xl font-serif font-bold text-charcoal">Prayer Wall</h1>
          <p className="text-neutral mt-1">Bear one another's burdens.</p>
        </div>
        <GlowingButton size="sm" onClick={() => setIsModalOpen(true)}>
          Share Request
        </GlowingButton>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral">No prayer requests yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((req) => {
            const isPraying = prayingFor.has(req.id);
            return (
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
                      <span className="font-bold text-charcoal block">{req.name}</span>
                      <span className="text-xs text-neutral uppercase tracking-widest">
                        {formatDate(req.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-charcoal leading-relaxed mb-6 text-lg font-light pl-12 border-l-2 border-gold/20">
                  {req.content}
                </p>
                <div className="flex items-center space-x-6 border-t border-gray-100 pt-4 pl-12">
                  <button
                    onClick={() => handlePrayingClick(req.id)}
                    className={`flex items-center text-sm transition-colors font-bold uppercase tracking-wider ${
                      isPraying
                        ? 'text-gold hover:text-charcoal'
                        : 'text-neutral hover:text-gold'
                    }`}
                  >
                    <Heart size={16} className={`mr-2 ${isPraying ? 'fill-current' : ''}`} />{' '}
                    I'm Praying ({req.prayer_count})
                  </button>
                  <button className="flex items-center text-sm text-neutral hover:text-charcoal transition-colors font-bold uppercase tracking-wider">
                    <MessageCircle size={16} className="mr-2" /> Encouragement
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Request Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Share Prayer Request">
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
              placeholder="Share your prayer request..."
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 border border-gray-200 rounded-[4px] text-charcoal hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <GlowingButton
              onClick={handleSubmitRequest}
              disabled={!formData.content || (!formData.isAnonymous && !formData.name)}
            >
              Submit Request
            </GlowingButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};