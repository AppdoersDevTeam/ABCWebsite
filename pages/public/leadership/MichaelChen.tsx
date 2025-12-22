import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/UI/PageHeader';
import { VibrantCard } from '../../../components/UI/VibrantCard';
import { ScrollReveal } from '../../../components/UI/ScrollReveal';
import { ArrowLeft } from 'lucide-react';

export const MichaelChen = () => {
  return (
    <div className="pb-32">
      <PageHeader title="MICHAEL CHEN" subtitle="Worship Director" />
      
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
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80" 
                alt="Michael Chen" 
                className="w-full h-full object-cover"
              />
            </div>
          </ScrollReveal>
          
          <ScrollReveal direction="left" delay={200}>
            <VibrantCard className="p-8 bg-white/80 hover-lift">
              <h3 className="text-3xl font-serif font-bold text-charcoal mb-4">Worship Director</h3>
              <div className="space-y-4 text-neutral leading-relaxed">
                <p>
                  Michael Chen leads our worship ministry, bringing a passion for authentic worship 
                  and musical excellence. With over 15 years of experience in worship leading, 
                  Michael creates an atmosphere where people can encounter God.
                </p>
                <p>
                  Michael joined the team in 2019 and has been instrumental in developing our worship 
                  team and expanding our musical repertoire. He holds a Bachelor of Music and is 
                  skilled in multiple instruments.
                </p>
                <p>
                  His heart is to see people connect with God through worship, whether through 
                  contemporary songs or traditional hymns. Michael is married and enjoys spending 
                  time with his family and playing music.
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
                <h4 className="font-bold text-charcoal mb-2">Worship Leading</h4>
                <p className="text-neutral text-sm">Leading Sunday services and special events</p>
              </div>
              <div>
                <h4 className="font-bold text-charcoal mb-2">Team Development</h4>
                <p className="text-neutral text-sm">Training and mentoring worship team members</p>
              </div>
              <div>
                <h4 className="font-bold text-charcoal mb-2">Music Selection</h4>
                <p className="text-neutral text-sm">Curating songs that connect people with God</p>
              </div>
              <div>
                <h4 className="font-bold text-charcoal mb-2">Technical Production</h4>
                <p className="text-neutral text-sm">Overseeing sound and technical aspects</p>
              </div>
            </div>
          </VibrantCard>
        </ScrollReveal>
      </div>
    </div>
  );
};


