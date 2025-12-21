import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/UI/PageHeader';
import { VibrantCard } from '../../../components/UI/VibrantCard';
import { ScrollReveal } from '../../../components/UI/ScrollReveal';
import { ArrowLeft } from 'lucide-react';

export const DavidMiller = () => {
  return (
    <div className="pb-32">
      <PageHeader title="REV. DAVID MILLER" subtitle="Senior Pastor" />
      
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
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80" 
                alt="Rev. David Miller" 
                className="w-full h-full object-cover"
              />
            </div>
          </ScrollReveal>
          
          <ScrollReveal direction="left" delay={200}>
            <VibrantCard className="p-8 bg-white/80 hover-lift">
              <h3 className="text-3xl font-serif font-bold text-charcoal mb-4">Senior Pastor</h3>
              <div className="space-y-4 text-neutral leading-relaxed">
                <p>
                  Rev. David Miller has been serving as Senior Pastor at Ashburton Baptist Church since 2015. 
                  With over 20 years of ministry experience, David brings a passion for teaching God's Word 
                  and a heart for community transformation.
                </p>
                <p>
                  David holds a Master of Divinity from the Baptist Theological College and has served in 
                  various pastoral roles throughout New Zealand. He is married to Sarah, and they have 
                  three children.
                </p>
                <p>
                  His vision for the church centers on seeing lives transformed by the gospel, equipping 
                  believers to impact their community with hope, love, and service. David is passionate 
                  about discipleship, community engagement, and seeing the church be a beacon of light 
                  in Ashburton.
                </p>
              </div>
            </VibrantCard>
          </ScrollReveal>
        </div>

        <ScrollReveal direction="up" delay={300}>
          <VibrantCard className="p-8 md:p-12 bg-white/80 hover-lift">
            <h3 className="text-2xl font-serif font-bold text-charcoal mb-6">Ministry Focus</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-charcoal mb-2">Preaching & Teaching</h4>
                <p className="text-neutral text-sm">Leading Sunday services and Bible studies</p>
              </div>
              <div>
                <h4 className="font-bold text-charcoal mb-2">Leadership Development</h4>
                <p className="text-neutral text-sm">Mentoring and equipping church leaders</p>
              </div>
              <div>
                <h4 className="font-bold text-charcoal mb-2">Community Outreach</h4>
                <p className="text-neutral text-sm">Building relationships in Ashburton</p>
              </div>
              <div>
                <h4 className="font-bold text-charcoal mb-2">Pastoral Care</h4>
                <p className="text-neutral text-sm">Supporting and counseling church members</p>
              </div>
            </div>
          </VibrantCard>
        </ScrollReveal>
      </div>
    </div>
  );
};

