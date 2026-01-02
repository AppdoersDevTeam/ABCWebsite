import React, { useState, useEffect } from 'react';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';
import { Heart, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { PrayerRequest } from '../../types';
import { SkeletonPageHeader, SkeletonPrayerCard } from '../../components/UI/Skeleton';
import { getUserTimezone, formatRelativeDateInTimezone } from '../../lib/dateUtils';

export const PrayerWall = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PrayerRequest | null>(null);
  const [formData, setFormData] = useState({ name: '', content: '', isAnonymous: false });
  const [prayingFor, setPrayingFor] = useState<Set<string>>(new Set());
  const [fallingHearts, setFallingHearts] = useState<Array<{ id: number; left: number; delay: number }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Parallelize queries for faster loading
        const queries = [
          supabase
            .from('prayer_requests')
            .select('*')
            .eq('is_confidential', false)
            .order('created_at', { ascending: false })
        ];

        // Only fetch prayer counts if user exists
        if (user) {
          queries.push(
            supabase
              .from('prayer_counts')
              .select('prayer_request_id')
              .eq('user_id', user.id)
          );
        }

        const results = await Promise.allSettled(queries);

        // Process prayer requests
        if (results[0].status === 'fulfilled' && !results[0].value.error) {
          setRequests(results[0].value.data || []);
        } else {
          console.error('Error fetching prayer requests:', results[0].status === 'rejected' ? results[0].reason : results[0].value.error);
        }

        // Process prayer counts if user exists
        if (user && results[1] && results[1].status === 'fulfilled' && !results[1].value.error) {
          setPrayingFor(new Set(results[1].value.data?.map((p: any) => p.prayer_request_id) || []));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSubmitRequest = async () => {
    if (!formData.content || (!formData.isAnonymous && !formData.name)) {
      return;
    }

    try {
      const userTimezone = getUserTimezone();
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
            user_timezone: userTimezone,
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

  const handleEdit = (request: PrayerRequest) => {
    setEditingRequest(request);
    setFormData({
      name: request.is_anonymous ? '' : request.name,
      content: request.content,
      isAnonymous: request.is_anonymous || false,
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
        })
        .eq('id', editingRequest.id);

      if (error) throw error;

      // Refresh requests
      await fetchPrayerRequests();
      setFormData({ name: '', content: '', isAnonymous: false });
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
      }

      // Then delete the request
      const { error } = await supabase
        .from('prayer_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh requests
      await fetchPrayerRequests();
    } catch (error) {
      console.error('Error deleting prayer request:', error);
      alert('Failed to delete prayer request');
    }
  };

  const triggerFallingHearts = () => {
    const viewportWidth = window.innerWidth;
    
    // Create 15-20 hearts spread across the entire page width
    const heartCount = 15 + Math.floor(Math.random() * 6);
    const newHearts = Array.from({ length: heartCount }, (_, i) => ({
      id: Date.now() + i,
      left: Math.random() * viewportWidth, // Random position across entire page width
      delay: Math.random() * 0.5, // Random delay for more natural effect
    }));
    
    setFallingHearts(newHearts);
    
    // Remove hearts after animation completes
    setTimeout(() => {
      setFallingHearts([]);
    }, 3500);
  };

  const handlePrayingClick = async (requestId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (!user) {
      alert('Please log in to pray for requests');
      return;
    }

    const isPraying = prayingFor.has(requestId);

    try {
      if (isPraying) {
        // Remove prayer count
        const { error } = await supabase
          .from('prayer_counts')
          .delete()
          .eq('prayer_request_id', requestId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error deleting prayer count:', error);
          throw error;
        }

        // Decrement prayer count
        const request = requests.find(r => r.id === requestId);
        if (request) {
          const { error: updateError } = await supabase
            .from('prayer_requests')
            .update({ prayer_count: Math.max(0, request.prayer_count - 1) })
            .eq('id', requestId);

          if (updateError) {
            console.error('Error decrementing prayer count:', updateError);
            throw updateError;
          }
        }

        setPrayingFor(prev => {
          const next = new Set(prev);
          next.delete(requestId);
          return next;
        });
      } else {
        // Trigger falling hearts animation across the whole page
        triggerFallingHearts();

        // Add prayer count
        const { error } = await supabase
          .from('prayer_counts')
          .insert([
            {
              prayer_request_id: requestId,
              user_id: user.id,
            },
          ]);

        if (error) {
          console.error('Error inserting prayer count:', error);
          throw error;
        }

        // Increment prayer count
        const request = requests.find(r => r.id === requestId);
        if (request) {
          const { error: updateError } = await supabase
            .from('prayer_requests')
            .update({ prayer_count: request.prayer_count + 1 })
            .eq('id', requestId);

          if (updateError) {
            console.error('Error incrementing prayer count:', updateError);
            throw updateError;
          }
        }

        setPrayingFor(prev => new Set(prev).add(requestId));
      }

      // Refresh requests and user prayer counts to get updated state
      await fetchPrayerRequests();
      if (user) {
        await fetchUserPrayerCounts();
      }
    } catch (error: any) {
      console.error('Error updating prayer count:', error);
      alert(`Failed to update prayer count: ${error.message || 'Please make sure you are logged in and have permission.'}`);
    }
  };

  const formatDate = (dateString: string, userTimezone?: string) => {
    return formatRelativeDateInTimezone(dateString, userTimezone);
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
    <div className="space-y-8 relative">
      {/* Falling Hearts Animation Container */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {fallingHearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute -top-10 text-gold animate-falling-heart"
            style={{
              left: `${heart.left}px`,
              animationDelay: `${heart.delay}s`,
            }}
          >
            <Heart size={24} className="fill-current drop-shadow-lg" />
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-normal text-charcoal">Prayer Wall</h1>
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
                        {formatDate(req.created_at, req.user_timezone)}
                      </span>
                    </div>
                  </div>
                  {user && req.user_id === user.id && (
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
                  )}
                </div>
                <p className="text-charcoal leading-relaxed mb-6 text-lg font-light pl-12 border-l-2 border-gold/20">
                  {req.content}
                </p>
                <div className="flex items-center border-t border-gray-100 pt-4 pl-12">
                  <button
                    onClick={(e) => handlePrayingClick(req.id, e)}
                    disabled={!user}
                    className={`flex items-center text-sm transition-colors font-bold uppercase tracking-wider cursor-pointer ${
                      !user
                        ? 'text-gray-400 cursor-not-allowed opacity-50'
                        : isPraying
                        ? 'text-gold hover:text-charcoal'
                        : 'text-neutral hover:text-gold'
                    }`}
                  >
                    <Heart size={16} className={`mr-2 ${isPraying ? 'fill-current text-gold' : ''}`} />
                    I'm Praying ({req.prayer_count})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Request Modal */}
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
              placeholder="Share your prayer request..."
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
            <GlowingButton
              onClick={handleUpdate}
              disabled={!formData.content || (!formData.isAnonymous && !formData.name)}
            >
              Update Request
            </GlowingButton>
          </div>
        </div>
      </Modal>

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