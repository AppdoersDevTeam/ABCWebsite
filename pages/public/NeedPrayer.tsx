import React, { useState, useRef } from 'react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { ScrollReveal } from '../../components/UI/ScrollReveal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { getUserTimezone } from '../../lib/dateUtils';
import { HandHeart, ArrowDownToLine } from 'lucide-react';

export const NeedPrayer = () => {
  const heroRef = useRef<HTMLDivElement>(null);
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
    <div className="space-y-0 overflow-hidden">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/ABC background01.png" 
            alt="Ashburton Baptist Church" 
            className="w-full h-full object-cover brightness-110 saturate-125 contrast-105"
          />
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-gray-700/45"></div>
        </div>

        {/* Hero Content */}
        <div className="container relative z-10 px-4 mx-auto pt-[224px] md:pt-[256px] pb-24 md:pb-28">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal direction="up" delay={100}>
              <h1 className="text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-200" style={{ fontFamily: 'Inter', fontSize: '2.5rem', lineHeight: '1.2', marginTop: '63px' }}>
                Prayer
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={150}>
              <h1 className="text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-250" style={{ fontFamily: 'Kaushan Script', fontSize: '4.25rem', lineHeight: '1.2' }}>
                We are here for you
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-[1.5625rem] leading-6 text-white text-center max-w-5xl mx-auto mb-6 transition-all duration-1000 delay-300">
                <span className="block whitespace-nowrap font-raleway font-normal text-center">Your request is handled with confidentiality</span>
                <span className="block whitespace-nowrap mt-[12px] font-raleway font-normal text-center">and care. We are ready to stand with you in prayer.</span>
              </p>
            </ScrollReveal>
          
          {/* Pulsing Down Arrow */}
          <div className="absolute bottom-[29px] left-1/2 -translate-x-1/2 z-20 pulse-arrow animate-ping-pong">
            <ArrowDownToLine size={32} className="text-gold" />
          </div>
        </div>
        </div>
      </section>
      
      <section className="section-gradient-soft py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <ScrollReveal direction="down" delay={0}>
            <div className="text-center mb-12">
              <HandHeart className="text-gold mx-auto mb-6" size={64} />
              <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal mb-4">We are here for you</h2>
              <p className="text-gold mt-2 text-base font-bold">Your request is handled with confidentiality and care.</p>
            </div>
          </ScrollReveal>
        <div className="glass-card p-6 md:p-16 rounded-[16px] shadow-xl relative overflow-hidden bg-white/80">
            
            <div className="text-center mb-12 relative z-10">
                <h3 className="text-3xl font-serif text-charcoal mb-4">How can we pray?</h3>
                <p className="text-neutral text-lg">Share your prayer request with us.</p>
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
      </section>
    </div>
  );
};