import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/UI/PageHeader';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { ArrowRight, Clock } from 'lucide-react';

export const About = () => {
  const leadership = [
    { name: "Rev. David Miller", role: "Senior Pastor", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80" },
    { name: "Sarah Jenkins", role: "Executive Pastor", img: "https://images.unsplash.com/photo-1573496359-136d475583dc?auto=format&fit=crop&w=800&q=80" },
    { name: "Michael Chen", role: "Worship Director", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80" },
    { name: "Emily White", role: "Kids & Families", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80" }
  ];

  return (
    <div className="pb-32">
      <PageHeader title="WHO WE ARE" subtitle="Our DNA" />

      <div className="container mx-auto px-4 -mt-10 relative z-10">
        
        {/* Intro - Glass Card on White */}
        <section className="glass-card rounded-[8px] p-6 md:p-12 lg:p-20 text-center max-w-5xl mx-auto mb-20 md:mb-32 border-t-4 border-t-gold animate-fade-in-up hover-lift">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-charcoal mb-6 md:mb-8">Established 1882. <span className="text-gold animate-pulse-slow">Reimagined Daily.</span></h2>
            <p className="text-lg md:text-2xl text-neutral leading-relaxed font-light mb-8">
                We aren't just a building. We are a movement of people passionate about Jesus and our city. 
                From humble beginnings to a vibrant community, our mission remains the same: <span className="text-charcoal font-bold underline decoration-gold decoration-4 underline-offset-4">Impact.</span>
            </p>
            <Link to="/about/history">
                <GlowingButton variant="outline" className="group">
                    Explore Our History <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform"/>
                </GlowingButton>
            </Link>
        </section>

        {/* Vision Grid */}
        <section id="vision" className="grid md:grid-cols-2 gap-8 mb-20 md:mb-32 scroll-mt-24">
           <VibrantCard className="min-h-[300px] md:min-h-[400px] flex flex-col justify-center border-l-4 border-l-gold bg-white/80 animate-fade-in-left delay-200 hover-lift">
              <h3 className="font-serif text-4xl md:text-5xl mb-6 md:mb-8 text-charcoal">Our Vision</h3>
              <p className="text-neutral leading-loose text-lg">
                To see lives transformed by the gospel of Jesus Christ, equipping every generation to impact their community with hope, love, and service.
              </p>
           </VibrantCard>
           <div id="beliefs" className="grid grid-cols-1 sm:grid-cols-2 gap-4 scroll-mt-24">
              {['One God', 'Jesus Savior', 'Spirit Power', 'Bible Authority'].map((item, i) => (
                  <div key={i} className="bg-white shadow-sm p-8 rounded-[8px] border border-gray-100 flex flex-col justify-center items-center text-center hover:shadow-md hover:border-gold transition-all duration-300 group animate-scale-in-bounce hover-lift" style={{ animationDelay: `${300 + i * 100}ms` }}>
                      <span className="text-2xl md:text-3xl font-serif font-bold mb-2 text-charcoal group-hover:scale-110 transition-transform duration-300">{item.split(' ')[0]}</span>
                      <span className="text-xs uppercase tracking-widest text-neutral group-hover:text-gold font-bold">{item.split(' ')[1]}</span>
                  </div>
              ))}
           </div>
        </section>

        {/* Team Section */}
        <section id="leadership" className="scroll-mt-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b border-gray-200 pb-8 gap-4">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal">Leadership</h2>
            <p className="text-neutral uppercase tracking-widest font-bold">Meet the Team</p>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {leadership.map((leader, i) => (
              <div key={i} className="group relative animate-fade-in-up hover-lift" style={{ animationDelay: `${400 + i * 150}ms` }}>
                 <div className="aspect-[3/4] overflow-hidden rounded-[4px] bg-gray-100">
                    <img src={leader.img} alt={leader.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                 </div>
                 <div className="mt-6 bg-white p-4 -mt-10 mx-4 relative rounded-[4px] shadow-lg text-center transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                    <h4 className="text-xl font-serif text-charcoal font-bold group-hover:text-gold transition-colors">{leader.name}</h4>
                    <p className="text-gold text-xs uppercase tracking-wider font-bold">{leader.role}</p>
                 </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};