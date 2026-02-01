import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { VibrantCard } from '../../../components/UI/VibrantCard';
import { GlowingButton } from '../../../components/UI/GlowingButton';
import { ScrollReveal } from '../../../components/UI/ScrollReveal';
import { ArrowLeft, ArrowDownToLine, UserRound } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { TeamMember } from '../../../types';

export const LeadershipBio = () => {
  const { slug } = useParams<{ slug: string }>();
  const heroRef = useRef<HTMLDivElement>(null);
  const [member, setMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchTeamMember(slug);
    }
  }, [slug]);

  const fetchTeamMember = async (slugParam: string) => {
    try {
      setIsLoading(true);
      setNotFound(false);

      // Fetch all team members
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      // Find the team member whose name matches the slug
      const foundMember = (data || []).find((member: TeamMember) => {
        const memberSlug = member.name.toLowerCase().replace(/\s+/g, '-');
        return memberSlug === slugParam.toLowerCase();
      });

      if (foundMember) {
        setMember(foundMember);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Error fetching team member:', error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-0 overflow-hidden">
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
          <div className="container relative z-10 px-4 mx-auto text-center">
            <div className="animate-pulse text-white text-xl">Loading...</div>
          </div>
        </section>
      </div>
    );
  }

  if (notFound || !member) {
    return <Navigate to="/about#leadership" replace />;
  }

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
                {member.name}
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-base sm:text-lg md:text-[1.375rem] lg:text-[1.5625rem] leading-relaxed text-white text-center max-w-5xl mx-auto mb-6 transition-all duration-1000 delay-300 px-2 sm:px-0">
                {member.description ? (
                  <>
                    <span className="block font-raleway font-normal text-center">
                      {member.role}.
                    </span>
                    <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">
                      {member.description.length > 100 
                        ? `${member.description.substring(0, 100)}...` 
                        : member.description}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="block font-raleway font-normal text-center">{member.role}.</span>
                    <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">Leading with passion and a heart for service.</span>
                  </>
                )}
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={400}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24">
                <Link to="/about#leadership" className="group">
                  <GlowingButton variant="outline" size="md" className="!px-6 !py-[14px] !border-gold !bg-gold/20 !text-white hover:!bg-gold hover:!text-white !rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 hover:!border-gold active:scale-95 hover:-translate-y-1 !normal-case">
                    <ArrowLeft size={18} className="mr-2 text-gold transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:h-5 group-hover:w-5 group-hover:translate-x-1 group-hover:text-white" />
                    <span className="text-white font-normal text-base leading-6 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:font-semibold group-hover:tracking-wider">Back to Leadership</span>
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
      
      <section className="section-plain py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <ScrollReveal direction="right" delay={100}>
              <div className="aspect-[3/4] overflow-hidden rounded-[8px] bg-gray-100">
                <img 
                  src={member.img || '/placeholder-avatar.png'} 
                  alt={member.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="left" delay={200}>
              <div className="glass-card rounded-[16px] p-8 bg-white/70 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover-lift">
                <h3 className="text-3xl font-serif font-normal text-charcoal mb-4">{member.role}</h3>
                <div className="space-y-4 text-neutral leading-relaxed">
                  {member.description ? (
                    <p>{member.description}</p>
                  ) : (
                    <p>
                      {member.name} serves at Ashburton Baptist Church with dedication and passion. 
                      Their commitment to ministry and service to the community is evident in their work.
                    </p>
                  )}
                </div>
                {(member.email || member.phone) && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="space-y-2">
                      {member.email && (
                        <p className="text-neutral">
                          <span className="font-bold text-charcoal">Email:</span> {member.email}
                        </p>
                      )}
                      {member.phone && (
                        <p className="text-neutral">
                          <span className="font-bold text-charcoal">Phone:</span> {member.phone}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal direction="up" delay={300}>
            <div className="glass-card rounded-[16px] p-8 md:p-12 bg-white/70 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover-lift">
              <h3 className="text-2xl font-serif font-normal text-charcoal mb-6">Ministry Focus</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-charcoal mb-2">Leadership</h4>
                  <p className="text-neutral text-sm">Serving and leading with excellence</p>
                </div>
                <div>
                  <h4 className="font-bold text-charcoal mb-2">Community</h4>
                  <p className="text-neutral text-sm">Building relationships and serving others</p>
                </div>
                <div>
                  <h4 className="font-bold text-charcoal mb-2">Ministry</h4>
                  <p className="text-neutral text-sm">Equipping and empowering the church</p>
                </div>
                <div>
                  <h4 className="font-bold text-charcoal mb-2">Service</h4>
                  <p className="text-neutral text-sm">Dedicated to serving God and community</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};
