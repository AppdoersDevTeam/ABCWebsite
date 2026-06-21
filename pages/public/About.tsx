import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { ScrollReveal } from '../../components/UI/ScrollReveal';
import { ArrowRight, ArrowDownToLine, BookOpen, Church, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { TeamMember } from '../../types';
import { inferProfileType } from '../../lib/teamMemberUtils';
import { VISION_FOCUS_CARDS } from '../../lib/visionFocusCards';

interface LeadershipMember {
  name: string;
  role: string;
  img: string;
  shortBio: string;
  bioPath: string;
}

export const About = () => {
  const heroRef = useRef<HTMLDivElement>(null);
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

      // Leadership / public site: only Staff (not attendees or members in directory)
      const filteredMembers = (data || []).filter((member: TeamMember) => inferProfileType(member) === 'staff');

      // Map database team members to the format expected by the component
      const mappedLeadership: LeadershipMember[] = filteredMembers.map((member: TeamMember) => {
        // Generate bioPath from name (convert to lowercase, replace spaces with hyphens)
        const bioPath = `/about/leadership/${member.name.toLowerCase().replace(/\s+/g, '-')}`;
        
        return {
          name: member.name,
          role: member.staff_role || member.role,
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
            <ScrollReveal direction="up" delay={150}>
              <h1 className="text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-250" style={{ fontFamily: 'Kaushan Script', fontSize: '4.25rem', lineHeight: '1.2' }}>
                Our DNA
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-base sm:text-lg md:text-[1.375rem] lg:text-[1.5625rem] leading-relaxed text-white text-center max-w-5xl mx-auto mb-6 transition-all duration-1000 delay-300 px-2 sm:px-0">
                <span className="block font-raleway font-normal text-center">Who We Are.</span>
                <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">Established 1882. Reimagined Daily.</span>
                <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">A movement of people passionate about Jesus and our city.</span>
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
        </div>
        
        {/* Pulsing Down Arrow - positioned relative to section for proper centering */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 pulse-arrow animate-ping-pong">
          <ArrowDownToLine size={32} className="text-gold" />
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
      <section id="vision" className="section-gradient py-12 md:py-20 relative z-10 w-full overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2740%27 height=%2740%27 viewBox=%270 0 40 40%27%3E%3Cpath d=%27M20 6v28M6 20h28%27 stroke=%27%23cbd5e1%27 stroke-width=%271%27/%3E%3C/svg%3E")',
            backgroundRepeat: 'repeat',
            backgroundSize: '40px 40px',
          }}
        ></div>
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal direction="down" delay={0}>
            <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
              <Church className="mx-auto mb-4 text-gold md:mb-5" size={64} />
              <h2 className="font-serif text-3xl font-normal text-white md:text-4xl lg:text-5xl">Our Vision</h2>
              <p className="mt-2 text-base font-bold text-gold">Our Church Vision</p>
            </div>
          </ScrollReveal>

          <div className="mx-auto grid max-w-7xl items-start gap-6 md:grid-cols-2 md:items-center md:gap-8 xl:max-w-[calc(90rem-20px)] xl:gap-10">
            <ScrollReveal direction="right" delay={0}>
              <div>
                <h2 className="mb-6 text-center font-serif text-4xl font-normal text-white md:text-left md:text-5xl">
                  <span className="text-white">Kia Ora. </span>
                  <span className="text-gold">Welcome to ABC.</span>
                </h2>
                <p className="text-white text-lg leading-relaxed mb-6">
                  To be a Christ-centred, Spirit-empowered church in Ashburton where every generation grows in their love for God,
                  becomes mature, resilient disciples of Jesus, and joins His mission to impact our community and the nations.
                </p>
                <h3 className="text-gold font-bold tracking-[0.2em] mb-3 block text-center text-base md:text-left">
                  What this looks like
                </h3>
                <p className="text-white leading-relaxed mb-8">
                  We are building a legacy church that loves God, loves one another, and makes disciples in a rapidly changing,
                  multi-ethnic Ashburton. We want to move people beyond surface-level belief into deep discipleship, forming
                  followers of Jesus who know His Word, walk in His ways, and reflect His character in everyday life.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal
              direction="left"
              delay={200}
              className="min-w-0 md:min-w-[min(100%,calc(34rem-20px))] lg:min-w-[calc(38rem-20px)] xl:min-w-[calc(44rem-20px)]"
            >
              <div className="glass-card w-full rounded-[20px] bg-white/80 p-4 shadow-sm md:p-6 lg:p-8">
                <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-3 min-[480px]:gap-2 sm:gap-2 md:gap-3 lg:gap-4">
                  {VISION_FOCUS_CARDS.map((item, i) => (
                    <ScrollReveal key={item.primary} direction="scale" delay={i * 50}>
                      <div className="group flex min-h-[70px] min-w-0 flex-col items-center justify-center rounded-[12px] border border-gray-100 bg-white px-3 py-4 text-center shadow-sm transition-all duration-300 hover:border-gold hover:shadow-md min-[480px]:min-h-[90px] min-[480px]:px-2.5 md:min-h-[106px] md:px-3 md:py-5 lg:min-h-[122px] lg:px-4">
                        <span className="mb-1.5 font-serif text-base font-normal leading-tight text-charcoal min-[480px]:whitespace-nowrap md:text-lg lg:text-xl">
                          {item.primary}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral min-[480px]:whitespace-nowrap group-hover:text-gold md:text-xs lg:text-sm">
                          {item.secondary}
                        </span>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal direction="up" delay={250}>
            <div className="mt-10 flex justify-center md:mt-14">
              <Link to="/about/vision" className="group">
                <GlowingButton
                  variant="outline"
                  size="md"
                  className="!px-6 !py-[14px] !border-gold !bg-transparent !text-gold hover:!bg-transparent hover:!text-gold !rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 hover:shadow-2xl hover:shadow-gold/50 active:scale-95 hover:-translate-y-1 !normal-case"
                >
                  <span className="!text-gold font-normal text-base leading-6 transition-all duration-300 group-hover:font-semibold group-hover:tracking-wider">
                    Explore
                  </span>
                  <ArrowRight
                    size={18}
                    className="ml-2 !text-gold transition-all duration-300 group-hover:translate-x-1"
                  />
                </GlowingButton>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Beliefs Section */}
      <section id="beliefs" className="section-plain py-12 md:py-20 relative z-10 w-full">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="down" delay={0}>
            <div className="text-center mb-12 md:mb-16">
              <Church className="text-gold mx-auto mb-6" size={64} />
              <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal">What We Believe</h2>
              <span className="text-gold font-bold tracking-[0.3em] block text-base">Statement of Faith</span>
              <p className="text-neutral leading-relaxed text-lg max-w-3xl mx-auto mt-6">
                Our Articles of Faith express what Ashburton Baptist Church believes about God, Scripture,
                salvation, the church, and Christian living — drawn from the Bible and affirmed by our congregation.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={150}>
            <div className="glass-card rounded-[16px] p-8 md:p-12 bg-white/70 border border-white/50 shadow-sm hover:shadow-xl transition-all duration-300 max-w-4xl mx-auto text-center">
              <p className="text-neutral leading-relaxed text-lg mb-2">
                20 articles covering the Scriptures, the triune God, salvation, the church, ordinances,
                last things, evangelism, stewardship, the family, and more — with supporting Scripture references throughout.
              </p>
              <p className="text-sm text-gold font-bold tracking-widest uppercase mb-8">Full text · No abridgement</p>
              <Link
                to="/about/beliefs"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-8 py-3.5 text-base font-normal text-white shadow-md shadow-gold/30 transition-colors duration-200 hover:bg-[#e5b800] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
              >
                Read Our Full Statement of Faith
                <ArrowRight size={18} className="text-white" aria-hidden />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* History Section */}
      <section id="history" className="section-gradient py-12 md:py-20 relative z-10 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2740%27 height=%2740%27 viewBox=%270 0 40 40%27%3E%3Cpath d=%27M20 6v28M6 20h28%27 stroke=%27%23cbd5e1%27 stroke-width=%271%27/%3E%3C/svg%3E")',
            backgroundRepeat: 'repeat',
            backgroundSize: '40px 40px',
          }}
        ></div>
        <div className="container mx-auto px-4 relative z-10">
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
                <ScrollReveal key={leader.bioPath || leader.name} direction="up" delay={i * 100}>
                  <Link
                    to={leader.bioPath}
                    className="group relative block cursor-pointer transition-transform duration-300 ease-out hover:-translate-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 rounded-lg"
                    aria-label={`Read full biography for ${leader.name}`}
                  >
                    <div className="aspect-square w-full overflow-hidden rounded-full bg-gray-100 ring-4 ring-white/80 shadow-lg">
                      <img src={leader.img} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="mt-5 text-center space-y-1.5 px-1">
                      <h4 className="text-xl font-serif text-charcoal font-normal">{leader.name}</h4>
                      <p className="text-gold text-xs uppercase tracking-wider font-bold leading-snug">{leader.role}</p>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};