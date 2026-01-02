import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/UI/PageHeader';
import { VibrantCard } from '../../../components/UI/VibrantCard';
import { ScrollReveal } from '../../../components/UI/ScrollReveal';
import { ArrowLeft } from 'lucide-react';

export const EmilyWhite = () => {
  return (
    <div className="pb-32">
      <PageHeader title="EMILY WHITE" subtitle="Kids & Families" />
      
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
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80" 
                alt="Emily White" 
                className="w-full h-full object-cover"
              />
            </div>
          </ScrollReveal>
          
          <ScrollReveal direction="left" delay={200}>
            <VibrantCard className="p-8 bg-white/80 hover-lift">
              <h3 className="text-3xl font-serif font-normal text-charcoal mb-4">Kids & Families Director</h3>
              <div className="space-y-4 text-neutral leading-relaxed">
                <p>
                  Emily White leads our Kids & Families ministry, creating safe and engaging spaces 
                  where children can learn about Jesus and grow in their faith. With a background 
                  in early childhood education, Emily brings creativity and care to every program.
                </p>
                <p>
                  Emily joined the team in 2020 and has transformed our children's programs, making 
                  them fun, educational, and spiritually enriching. She holds a Bachelor of Education 
                  and is passionate about seeing children develop a personal relationship with Jesus.
                </p>
                <p>
                  Her vision is to partner with parents in raising children who love God and love 
                  others. Emily is married and has two children of her own, which gives her a 
                  unique perspective on family ministry.
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
                <h4 className="font-bold text-charcoal mb-2">Kids Church</h4>
                <p className="text-neutral text-sm">Leading Sunday programs for children</p>
              </div>
              <div>
                <h4 className="font-bold text-charcoal mb-2">Curriculum Development</h4>
                <p className="text-neutral text-sm">Creating age-appropriate Bible lessons</p>
              </div>
              <div>
                <h4 className="font-bold text-charcoal mb-2">Volunteer Training</h4>
                <p className="text-neutral text-sm">Equipping and supporting kids ministry volunteers</p>
              </div>
              <div>
                <h4 className="font-bold text-charcoal mb-2">Family Support</h4>
                <p className="text-neutral text-sm">Resources and support for parents</p>
              </div>
            </div>
          </VibrantCard>
        </ScrollReveal>
      </div>
    </div>
  );
};


