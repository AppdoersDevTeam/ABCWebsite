import React, { useState } from 'react';
import { PageHeader } from '../../components/UI/PageHeader';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { getUserTimezone } from '../../lib/dateUtils';

export const NeedPrayer = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    isConfidential: false,
    isAnonymous: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!formData.content) {
      setError('Please enter a prayer request');
      setIsSubmitting(false);
      return;
    }

    try {
      const userTimezone = getUserTimezone();
      const { error: submitError } = await supabase.from('prayer_requests').insert([
        {
          user_id: user?.id,
          name: formData.isAnonymous ? 'Anonymous' : formData.name || 'Anonymous',
          content: formData.content,
          is_anonymous: formData.isAnonymous || !formData.name,
          is_confidential: formData.isConfidential,
          prayer_count: 0,
          user_timezone: userTimezone,
        },
      ]);

      if (submitError) throw submitError;

      setSuccess(true);
      setFormData({ name: '', content: '', isConfidential: false, isAnonymous: false });

      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err: any) {
      console.error('Error submitting prayer request:', err);
      setError(err.message || 'Failed to submit prayer request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-32">
      <PageHeader title="PRAYER" subtitle="We are here for you" />
      
      <div className="container mx-auto px-4 -mt-10 relative z-10 max-w-2xl">
        <div className="glass-card p-6 md:p-16 rounded-[16px] shadow-xl relative overflow-hidden bg-white/80">
            
            <div className="text-center mb-12 relative z-10">
                <h3 className="text-3xl font-serif text-charcoal mb-4">How can we pray?</h3>
                <p className="text-neutral text-lg">Your request is handled with confidentiality and care.</p>
            </div>

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-[4px] text-sm relative z-10">
                Thank you! Your prayer request has been submitted. We will be praying for you.
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[4px] text-sm relative z-10">
                {error}
              </div>
            )}
            
            <form className="space-y-8 relative z-10" onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal">Your Name (Optional)</label>
                    <input
                      type="text"
                      className="w-full p-4 rounded-[4px] input-sun text-lg"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={formData.isAnonymous}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal">Prayer Request</label>
                    <textarea
                      rows={6}
                      className="w-full p-4 rounded-[4px] input-sun text-lg"
                      placeholder="Share your burden..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      required
                    />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-[4px] border border-gray-100">
                      <input
                        type="checkbox"
                        id="anonymous"
                        className="rounded text-gold focus:ring-gold bg-white border-gray-300 h-5 w-5"
                        checked={formData.isAnonymous}
                        onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                      />
                      <label htmlFor="anonymous" className="text-base text-neutral cursor-pointer select-none">Post as Anonymous</label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-[4px] border border-gray-100">
                      <input
                        type="checkbox"
                        id="private"
                        className="rounded text-gold focus:ring-gold bg-white border-gray-300 h-5 w-5"
                        checked={formData.isConfidential}
                        onChange={(e) => setFormData({ ...formData, isConfidential: e.target.checked })}
                      />
                      <label htmlFor="private" className="text-base text-neutral cursor-pointer select-none">Keep confidential (Pastors only)</label>
                  </div>
                </div>
                <GlowingButton type="submit" fullWidth size="lg" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Send Request'}
                </GlowingButton>
            </form>
        </div>
      </div>
    </div>
  );
};