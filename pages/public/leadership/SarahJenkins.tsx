import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/UI/PageHeader';
import { VibrantCard } from '../../../components/UI/VibrantCard';
import { ScrollReveal } from '../../../components/UI/ScrollReveal';
import { ArrowLeft } from 'lucide-react';

export const SarahJenkins = () => {
  return (
    <div className="pb-32">
      <PageHeader title="SARAH JENKINS" subtitle="Executive Pastor" />
      
      <div className="container mx-auto px-4 -mt-10 relative z-10 max-w-4xl">
        <ScrollReveal direction="right" delay={0}>
          <Link to="/about#leadership" className="inline-flex items-center gap-2 text-gold hover:text-charcoal mb-8 transition-colors font-bold">
            <ArrowLeft size={20} />
            Back to Leadership
          </Link>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <ScrollReveal direction="right" delay={100}>
            <div className="aspect-[3/4] overflow-hidden rounded-[8px] bg-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1573496359-136d475583dc?auto=format&fit=crop&w=800&q=80" 
                alt="Sarah Jenkins" 
                className="w-full h-full object-cover"
              />
            </div>
          </ScrollReveal>
          
          <ScrollReveal direction="left" delay={200}>
            <VibrantCard className="p-8 bg-white/80 hover-lift">
              <h3 className="text-3xl font-serif font-normal text-charcoal mb-4">Executive Pastor</h3>
              <div className="space-y-4 text-neutral leading-relaxed">
                <p>
                  Sarah Jenkins serves as Executive Pastor, overseeing the day-to-day operations and 
                  strategic planning of the church. With a background in business administration and 
                  ministry, Sarah brings organizational excellence and a heart for service.
                </p>
                <p>
                  Sarah joined the team in 2018 and has been instrumental in developing our community 
                  programs and outreach initiatives. She holds a Bachelor of Business Administration 
                  and a Master of Ministry.
                </p>
                <p>
                  Her passion lies in creating systems that enable the church to effectively serve 
                  our community and support our members in their faith journey. Sarah is married 
                  and has two children.
                </p>
              </div>
            </VibrantCard>
          </ScrollReveal>
        </div>

        <ScrollReveal direction="up" delay={300}>
          <VibrantCard className="p-8 md:p-12 bg-white/80 hover-lift">
            <h3 className="text-2xl font-serif font-normal text-charcoal mb-6">Ministry Focus</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-charcoal mb-2">Operations</h4>
                <p className="text-neutral text-sm">Managing church administration and facilities</p>
              </div>
              <div>
                <h4 className="font-bold text-charcoal mb-2">Community Programs</h4>
                <p className="text-neutral text-sm">Developing outreach and service initiatives</p>
              </div>
              <div>
                <h4 className="font-bold text-charcoal mb-2">Strategic Planning</h4>
                <p className="text-neutral text-sm">Vision casting and goal setting</p>
              </div>
              <div>
                <h4 className="font-bold text-charcoal mb-2">Volunteer Coordination</h4>
                <p className="text-neutral text-sm">Mobilizing and supporting volunteers</p>
              </div>
            </div>
          </VibrantCard>
        </ScrollReveal>
      </div>
    </div>
  );
};


