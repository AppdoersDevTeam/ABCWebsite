import React, { useRef, useState } from 'react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { ScrollReveal } from '../../components/UI/ScrollReveal';
import { submitContactForm } from '../../lib/submitContactForm';
import { MapPin, Phone, Mail, MessageSquare, ArrowDownToLine } from 'lucide-react';

const initialFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

export const Contact = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.firstName.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setError('Please fill in first name, email, subject, and message.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = submitContactForm({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setSuccess(true);
      setFormData(initialFormData);

      setTimeout(() => {
        setSuccess(false);
        setIsSubmitting(false);
      }, 5000);
    } catch (err: unknown) {
      console.error('Error submitting contact form:', err);
      setError('Failed to open your email app. Please try again.');
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
            <ScrollReveal direction="up" delay={150}>
              <h1 className="text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-250" style={{ fontFamily: 'Kaushan Script', fontSize: '4.25rem', lineHeight: '1.2' }}>
                Connect
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-base sm:text-lg md:text-[1.375rem] lg:text-[1.5625rem] leading-relaxed text-white text-center max-w-5xl mx-auto mb-6 transition-all duration-1000 delay-300 px-2 sm:px-0">
                <span className="block font-raleway font-normal text-center">Get in Touch.</span>
                <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">We'd love to hear from you</span>
                <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">and answer any questions you may have.</span>
              </p>
            </ScrollReveal>
          </div>
        </div>
        
        {/* Pulsing Down Arrow - positioned relative to section for proper centering */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 pulse-arrow animate-ping-pong">
          <ArrowDownToLine size={32} className="text-gold" />
        </div>
      </section>
      
      <section className="section-plain py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <ScrollReveal direction="down" delay={0}>
            <div className="text-center mb-12">
              <MessageSquare className="text-gold mx-auto mb-6" size={64} />
              <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal mb-4">Get in Touch</h2>
              <p className="text-gold mt-2 text-base font-bold">We'd love to hear from you.</p>
            </div>
          </ScrollReveal>
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
                {[
                    { icon: <MapPin />, title: "Visit", val: "284 Havelock Street, Ashburton 7700", id: "visit" },
                    { icon: <Phone />, title: "Call", val: "03-308 5409", id: "call" },
                    { icon: <Mail />, title: "Email", val: "office@ashburtonbaptist.co.nz", id: "email" }
                ].map((item, i) => (
                  <ScrollReveal key={i} direction="right" delay={i * 100}>
                    <div id={item.id} className="glass-card bg-white/70 border border-white/50 shadow-sm p-6 md:p-8 flex items-center gap-6 rounded-[16px] hover:border-gold transition-all duration-300 group hover:shadow-xl hover:-translate-y-1 scroll-mt-24 hover-lift">
                        <div className="p-4 bg-gold/10 rounded-full text-gold group-hover:bg-gold group-hover:text-white transition-all duration-300 flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 icon-bounce">
                            {React.cloneElement(item.icon, { size: 24 })}
                        </div>
                        <div>
                            <h4 className="font-serif text-xl text-charcoal mb-1 group-hover:text-gold transition-colors duration-300">{item.title}</h4>
                            <p className="text-neutral break-all group-hover:text-charcoal transition-colors duration-300">{item.val}</p>
                        </div>
                    </div>
                  </ScrollReveal>
                ))}
            </div>

            {/* Contact Form */}
            <ScrollReveal direction="left" delay={300}>
              <div>
                <div id="message" className="glass-card bg-white/70 p-6 md:p-12 rounded-[16px] h-full scroll-mt-24 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover-lift">
                  <h3 className="text-3xl font-serif font-normal text-charcoal mb-8">Send a Message</h3>

                  {success && (
                    <div className="mb-6 p-4 rounded-[8px] bg-green-50 border border-green-200 text-green-800">
                      Your email app should open with your message ready to send to us.
                    </div>
                  )}

                  {error && (
                    <div className="mb-6 p-4 rounded-[8px] bg-red-50 border border-red-200 text-red-800">
                      {error}
                    </div>
                  )}

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid lg:grid-cols-2 gap-6">
                      <input
                        type="text"
                        placeholder="FIRST NAME"
                        className="w-full p-4 rounded-[8px] input-sun"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                      <input
                        type="text"
                        placeholder="LAST NAME"
                        className="w-full p-4 rounded-[8px] input-sun"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>
                    <div className="grid lg:grid-cols-2 gap-6">
                      <input
                        type="email"
                        placeholder="EMAIL"
                        className="w-full p-4 rounded-[8px] input-sun"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                      <input
                        type="tel"
                        placeholder="PHONE NUMBER"
                        className="w-full p-4 rounded-[8px] input-sun"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="SUBJECT"
                      className="w-full p-4 rounded-[8px] input-sun"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                    <textarea
                      rows={6}
                      placeholder="MESSAGE"
                      className="w-full p-4 rounded-[8px] input-sun"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                    <GlowingButton
                      type="submit"
                      size="lg"
                      fullWidth
                      disabled={isSubmitting}
                      className="!rounded-full !bg-gold !text-white !border-gold transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-gold/60 active:scale-95 hover:-translate-y-1 disabled:opacity-60 disabled:hover:scale-100 disabled:hover:translate-y-0"
                    >
                      {isSubmitting ? 'Opening email...' : 'Send Message'}
                    </GlowingButton>
                  </form>
                </div>
              </div>
            </ScrollReveal>
        </div>
        </div>
      </section>
    </div>
  );
};
