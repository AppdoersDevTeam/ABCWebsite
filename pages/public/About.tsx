import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/UI/PageHeader';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { ScrollReveal } from '../../components/UI/ScrollReveal';
import { Modal } from '../../components/UI/Modal';
import { ArrowRight, Clock } from 'lucide-react';

export const About = () => {
  const [selectedLeader, setSelectedLeader] = useState<number | null>(null);

  const leadership = [
    { 
      name: "Rev. David Miller", 
      role: "Senior Pastor", 
      img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
      shortBio: "Rev. David Miller has been serving as Senior Pastor at Ashburton Baptist Church since 2015. With over 20 years of ministry experience, David brings a passion for teaching God's Word and a heart for community transformation.",
      bioPath: "/about/leadership/david-miller"
    },
    { 
      name: "Sarah Jenkins", 
      role: "Executive Pastor", 
      img: "https://images.unsplash.com/photo-1573496359-136d475583dc?auto=format&fit=crop&w=800&q=80",
      shortBio: "Sarah Jenkins serves as Executive Pastor, overseeing the day-to-day operations and strategic planning of the church. With a background in business administration and ministry, Sarah brings organizational excellence and a heart for service.",
      bioPath: "/about/leadership/sarah-jenkins"
    },
    { 
      name: "Michael Chen", 
      role: "Worship Director", 
      img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
      shortBio: "Michael Chen leads our worship ministry, bringing a passion for authentic worship and musical excellence. With over 15 years of experience in worship leading, Michael creates an atmosphere where people can encounter God.",
      bioPath: "/about/leadership/michael-chen"
    },
    { 
      name: "Emily White", 
      role: "Kids & Families", 
      img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
      shortBio: "Emily White leads our Kids & Families ministry, creating safe and engaging spaces where children can learn about Jesus and grow in their faith. With a background in early childhood education, Emily brings creativity and care to every program.",
      bioPath: "/about/leadership/emily-white"
    }
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
               <ScrollReveal direction="right" delay={0}>
                 <VibrantCard className="min-h-[300px] md:min-h-[400px] flex flex-col justify-center border-l-4 border-l-gold bg-white/80 hover-lift">
                    <h3 className="font-serif text-4xl md:text-5xl mb-6 md:mb-8 text-charcoal">Our Vision</h3>
                    <p className="text-neutral leading-loose text-lg">
                      To see lives transformed by the gospel of Jesus Christ, equipping every generation to impact their community with hope, love, and service.
                    </p>
                 </VibrantCard>
               </ScrollReveal>
               <div id="beliefs" className="grid grid-cols-1 sm:grid-cols-2 gap-4 scroll-mt-24">
                  {['One God', 'Jesus Savior', 'Spirit Power', 'Bible Authority'].map((item, i) => (
                      <ScrollReveal key={i} direction="scale" delay={i * 100}>
                        <div className="bg-white shadow-sm p-8 rounded-[8px] border border-gray-100 flex flex-col justify-center items-center text-center hover:shadow-md hover:border-gold transition-all duration-300 group hover-lift">
                            <span className="text-2xl md:text-3xl font-serif font-bold mb-2 text-charcoal group-hover:scale-110 transition-transform duration-300">{item.split(' ')[0]}</span>
                            <span className="text-xs uppercase tracking-widest text-neutral group-hover:text-gold font-bold">{item.split(' ')[1]}</span>
                        </div>
                      </ScrollReveal>
                  ))}
               </div>
            </section>

            {/* Team Section */}
            <section id="leadership" className="scroll-mt-24">
              <ScrollReveal direction="down" delay={0}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b border-gray-200 pb-8 gap-4">
                  <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal">Leadership</h2>
                  <p className="text-neutral uppercase tracking-widest font-bold">Meet the Team</p>
                </div>
              </ScrollReveal>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {leadership.map((leader, i) => (
                  <ScrollReveal key={i} direction="up" delay={i * 100}>
                    <div 
                      className="group relative hover-lift cursor-pointer"
                      onClick={() => setSelectedLeader(i)}
                    >
                      <div className="aspect-[3/4] overflow-hidden rounded-[4px] bg-gray-100">
                        <img src={leader.img} alt={leader.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      </div>
                      <div className="mt-6 bg-white p-4 -mt-10 mx-4 relative rounded-[4px] shadow-lg text-center transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                        <h4 className="text-xl font-serif text-charcoal font-bold group-hover:text-gold transition-colors">{leader.name}</h4>
                        <p className="text-gold text-xs uppercase tracking-wider font-bold">{leader.role}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </section>

            {/* Bio Modal */}
            <Modal 
              isOpen={selectedLeader !== null} 
              onClose={() => setSelectedLeader(null)}
              title={selectedLeader !== null ? leadership[selectedLeader].name : ''}
            >
              {selectedLeader !== null && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      <img 
                        src={leadership[selectedLeader].img} 
                        alt={leadership[selectedLeader].name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-charcoal">{leadership[selectedLeader].name}</h3>
                      <p className="text-gold text-sm uppercase tracking-wider font-bold">{leadership[selectedLeader].role}</p>
                    </div>
                  </div>
                  <p className="text-neutral leading-relaxed text-lg">
                    {leadership[selectedLeader].shortBio}
                  </p>
                  <Link to={leadership[selectedLeader].bioPath}>
                    <GlowingButton 
                      fullWidth 
                      className="group"
                      onClick={() => setSelectedLeader(null)}
                    >
                      Read Full Biography <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform"/>
                    </GlowingButton>
                  </Link>
                </div>
              )}
            </Modal>
      </div>
    </div>
  );
};