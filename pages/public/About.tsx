import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { ScrollReveal } from '../../components/UI/ScrollReveal';
import { Modal } from '../../components/UI/Modal';
import { ArrowRight, ArrowDownToLine, BookOpen, Church, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { TeamMember } from '../../types';

interface LeadershipMember {
  name: string;
  role: string;
  img: string;
  shortBio: string;
  bioPath: string;
}

export const About = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [selectedLeader, setSelectedLeader] = useState<number | null>(null);
  const [leadership, setLeadership] = useState<LeadershipMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      // Filter out Attendees and Members - only show leadership/ministry roles
      const filteredMembers = (data || []).filter((member: TeamMember) => {
        const role = member.role?.toLowerCase().trim();
        return role !== 'attendee' && role !== 'member';
      });

      // Map database team members to the format expected by the component
      const mappedLeadership: LeadershipMember[] = filteredMembers.map((member: TeamMember) => {
        // Generate bioPath from name (convert to lowercase, replace spaces with hyphens)
        const bioPath = `/about/leadership/${member.name.toLowerCase().replace(/\s+/g, '-')}`;
        
        return {
          name: member.name,
          role: member.role,
          img: member.img || '',
          shortBio: member.description || '',
          bioPath: bioPath
        };
      });

      setLeadership(mappedLeadership);
    } catch (error) {
      console.error('Error fetching team members:', error);
      // Set empty array on error to prevent crashes
      setLeadership([]);
    } finally {
      setIsLoading(false);
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
        <div className="container relative z-10 px-4 mx-auto pt-[224px] md:pt-[256px]">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal direction="up" delay={100}>
              <h1 className="text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-200" style={{ fontFamily: 'Inter', fontSize: '2.5rem', lineHeight: '1.2', marginTop: '63px' }}>
                Who We Are
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={150}>
              <h1 className="text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-250" style={{ fontFamily: 'Kaushan Script', fontSize: '4.25rem', lineHeight: '1.2' }}>
                Our DNA
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-[1.5625rem] leading-6 text-white text-center max-w-5xl mx-auto mb-6 transition-all duration-1000 delay-300">
                <span className="block whitespace-nowrap font-raleway font-normal text-center">Established 1882. Reimagined Daily.</span>
                <span className="block whitespace-nowrap mt-[12px] font-raleway font-normal text-center">A movement of people passionate about Jesus and our city.</span>
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={400}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24">
                <Link to="/about#history" className="group">
                  <GlowingButton variant="outline" size="md" className="!px-6 !py-[14px] !border-gold !bg-gold/20 !text-white hover:!bg-gold hover:!text-white !rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 hover:!border-gold active:scale-95 hover:-translate-y-1 !normal-case">
                    <span className="text-white font-normal text-base leading-6 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:font-semibold group-hover:tracking-wider">Our History</span>
                    <ArrowRight size={18} className="ml-2 text-gold transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:h-5 group-hover:w-5 group-hover:translate-x-1 group-hover:text-white" />
                  </GlowingButton>
                </Link>
                <Link to="/about#leadership" className="group">
                  <GlowingButton variant="outline" size="md" className="!px-6 !py-[14px] !border-white !bg-white/20 !text-white hover:!bg-white hover:!text-charcoal !rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 hover:!border-white active:scale-95 hover:-translate-y-1 !normal-case">
                    <span className="text-white font-normal text-base leading-6 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:font-semibold group-hover:tracking-wider group-hover:text-charcoal">Our Team</span>
                    <Users size={18} className="ml-2 text-gold transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-125 group-hover:translate-y-[-2px] group-hover:text-charcoal" />
                  </GlowingButton>
                </Link>
              </div>
            </ScrollReveal>
          </div>
          
          {/* Pulsing Down Arrow */}
          <div className="absolute bottom-[29px] left-1/2 -translate-x-1/2 z-20 pulse-arrow animate-ping-pong">
            <ArrowDownToLine size={32} className="text-gold" />
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="section-plain py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="down" delay={0}>
            <div className="glass-card rounded-[16px] p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-10 border-t border-white/50 animate-scale-in group hover-lift max-w-5xl mx-auto">
              <div className="flex items-center gap-6 w-full md:w-auto justify-center md:justify-start">
                <div className="p-4 bg-[#fbcb05] rounded-full text-white flex-shrink-0 shadow-lg shadow-gold/30"><Church size={32} strokeWidth={2}/></div>
                <div>
                  <h3 className="font-serif font-normal text-2xl text-charcoal group-hover:text-gold transition-colors duration-300">Established 1882</h3>
                  <p className="text-neutral font-medium group-hover:text-charcoal transition-colors">Reimagined Daily</p>
                </div>
              </div>
              <div className="hidden md:block w-px h-24 bg-charcoal/10"></div>
              <div className="text-center md:text-left max-w-lg">
                <h3 className="font-serif font-normal text-2xl text-charcoal mb-2 group-hover:text-gold transition-colors duration-300">Our Mission</h3>
                <p className="text-neutral leading-relaxed group-hover:text-charcoal transition-colors">We aren't just a building. We are a movement of people passionate about Jesus and our city. From humble beginnings to a vibrant community, our mission remains the same: <span className="text-charcoal font-bold">Impact.</span></p>
              </div>
              <div className="hidden md:block w-px h-24 bg-charcoal/10"></div>
              <Link to="/about/history" className="w-full md:w-auto group">
                <GlowingButton variant="outline" fullWidth className="!rounded-full !bg-gold !text-white !border-gold transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-gold/60 active:scale-95 hover:-translate-y-1">
                  <span className="transition-all duration-300 group-hover:tracking-wider">Explore History</span>
                  <ArrowRight size={18} className="ml-2 transition-all duration-500 group-hover:translate-x-2 group-hover:scale-125"/>
                </GlowingButton>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="section-gradient py-12 md:py-20 relative z-10 w-full">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="down" delay={0}>
            <div className="text-center mb-12 md:mb-16">
              <Church className="text-gold mx-auto mb-6" size={64} />
              <h2 className="text-4xl md:text-5xl md:text-6xl font-serif font-normal text-white mb-4">Our Vision</h2>
              <span className="text-gold font-bold tracking-[0.3em] block text-base">Who We Are</span>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
            <ScrollReveal direction="right" delay={0}>
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <Church className="text-gold flex-shrink-0" size={64} />
                  <h2 className="text-4xl md:text-5xl font-serif font-normal text-white">Kia Ora. <span className="text-gold">Welcome to our Family.</span></h2>
                </div>
                <span className="text-gold font-bold tracking-[0.3em] mb-4 block text-base text-center">Who we are.</span>
                <p className="text-white text-lg leading-relaxed mb-6">
                  We aren't just a building. We are a movement of people passionate about Jesus and our city. 
                  From humble beginnings to a vibrant community, our mission remains the same: <span className="text-gold font-bold">Impact.</span>
                </p>
                <p className="text-white leading-relaxed mb-8">
                  To see lives transformed by the gospel of Jesus Christ, equipping every generation to impact their community with hope, love, and service.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={200}>
              <div className="glass-card rounded-[16px] p-8 md:p-12 bg-white/80">
                <div className="grid grid-cols-2 gap-4">
                  {['One God', 'Jesus Savior', 'Spirit Power', 'Bible Authority'].map((item, i) => (
                    <ScrollReveal key={i} direction="scale" delay={i * 50}>
                      <div className="bg-white shadow-sm p-6 rounded-[8px] border border-gray-100 flex flex-col justify-center items-center text-center hover:shadow-md hover:border-gold transition-all duration-300 group">
                        <span className="text-xl md:text-2xl font-serif font-normal mb-2 text-charcoal">{item.split(' ')[0]}</span>
                        <span className="text-xs uppercase tracking-widest text-neutral group-hover:text-gold font-bold">{item.split(' ')[1]}</span>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Beliefs Section */}
      <section id="beliefs" className="section-plain py-12 md:py-20 relative z-10 w-full">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="down" delay={0}>
            <div className="text-center mb-12 md:mb-16">
              <Church className="text-gold mx-auto mb-6" size={64} />
              <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal">Our Beliefs</h2>
              <span className="text-gold font-bold tracking-[0.3em] block text-base">What We Believe</span>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {['One God', 'Jesus Savior', 'Spirit Power', 'Bible Authority'].map((item, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 100}>
                <div className="glass-card rounded-[16px] p-6 bg-white/70 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
                  <span className="text-2xl md:text-3xl font-serif font-normal text-charcoal block mb-2">
                    {item.split(' ')[0]}
                  </span>
                  <span className="text-xs uppercase tracking-widest text-neutral font-bold">
                    {item.split(' ')[1]}
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* History Section */}
      <section id="history" className="section-gradient py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="down" delay={0}>
            <div className="text-center mb-12 md:mb-16">
              <BookOpen className="text-gold mx-auto mb-6" size={64} />
              <h2 className="text-4xl md:text-5xl font-serif font-normal text-white">Our History</h2>
              <p className="text-gold mt-2 text-base font-bold">Est. 1882</p>
              <p className="text-white text-lg leading-relaxed max-w-3xl mx-auto mt-4">
                From humble beginnings to a vibrant community, our story is one of faith, perseverance, and God's
                faithfulness through the generations.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={150}>
            <div className="bg-white border border-gray-200 p-6 md:p-10 rounded-[8px] hover:border-gold transition-all duration-300 group shadow-sm hover-lift max-w-5xl mx-auto">
              <p className="text-neutral leading-relaxed text-lg">
                Learn how Ashburton Baptist Church began in 1882, grew through seasons of change, and continues to
                impact our community today.
              </p>
              <div className="mt-8 flex justify-center">
                <Link to="/about/history" className="group">
                  <GlowingButton variant="outline" size="md" className="!px-6 !py-[14px] !border-gold !bg-transparent !text-gold hover:!bg-transparent hover:!text-gold !rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 hover:shadow-2xl hover:shadow-gold/50 active:scale-95 hover:-translate-y-1 !normal-case">
                    <span className="!text-gold font-normal text-base leading-6 transition-all duration-300 group-hover:font-semibold group-hover:tracking-wider">Read Our Full Story</span>
                    <ArrowRight size={18} className="ml-2 !text-gold transition-all duration-300 group-hover:translate-x-1" />
                  </GlowingButton>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Leadership Section */}
      <section id="leadership" className="section-plain py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="down" delay={0}>
            <div className="text-center mb-12">
              <Users className="text-gold mx-auto mb-6" size={64} />
              <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal">Leadership</h2>
              <p className="text-gold mt-2 text-base font-bold">Meet the Team</p>
            </div>
          </ScrollReveal>

          <div className="flex justify-center">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-[80.5%]">
              {leadership.map((leader, i) => (
                <ScrollReveal key={i} direction="up" delay={i * 100}>
                  <div 
                    className="group relative hover-lift cursor-pointer"
                    onClick={() => setSelectedLeader(i)}
                  >
                    <div className="aspect-[3/4] overflow-hidden rounded-[8px] bg-gray-100">
                      <img src={leader.img} alt={leader.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="mt-6 glass-card bg-white/70 p-4 -mt-10 mx-4 relative rounded-[8px] shadow-lg text-center transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 border border-white/50">
                      <h4 className="text-xl font-serif text-charcoal font-normal group-hover:text-gold transition-colors">{leader.name}</h4>
                      <p className="text-gold text-xs uppercase tracking-wider font-bold">{leader.role}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
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
                  src={leadership[selectedLeader].img || '/placeholder-avatar.png'} 
                  alt={leadership[selectedLeader].name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-normal text-charcoal">{leadership[selectedLeader].name}</h3>
                <p className="text-gold text-sm uppercase tracking-wider font-bold">{leadership[selectedLeader].role}</p>
              </div>
            </div>
            <p className="text-neutral leading-relaxed text-lg">
              {leadership[selectedLeader].shortBio}
            </p>
            <Link to={leadership[selectedLeader].bioPath}>
              <GlowingButton 
                fullWidth 
                className="group !rounded-full !bg-gold !text-white !border-gold transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-gold/60 active:scale-95 hover:-translate-y-1"
                onClick={() => setSelectedLeader(null)}
              >
                <span className="transition-all duration-300 group-hover:tracking-wider">Read Full Biography</span>
                <ArrowRight size={16} className="ml-2 transition-all duration-500 group-hover:translate-x-2 group-hover:scale-125"/>
              </GlowingButton>
            </Link>
          </div>
        )}
      </Modal>
    </div>
  );
};