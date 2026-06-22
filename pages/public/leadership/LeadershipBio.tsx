import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { GlowingButton } from '../../../components/UI/GlowingButton';
import { ScrollReveal } from '../../../components/UI/ScrollReveal';
import { ArrowLeft, ArrowDownToLine } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { TeamMember } from '../../../types';
import { getDisplayRole, inferProfileType } from '../../../lib/teamMemberUtils';
import { usePageMeta } from '../../../lib/usePageMeta';

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

  usePageMeta(
    member
      ? {
          title: member.name,
          description: member.description?.trim()
            ? member.description.slice(0, 160)
            : `${member.name}, ${getDisplayRole(member)} at Ashburton Baptist Church.`,
        }
      : { title: 'Our Leadership', description: 'Meet the leadership team at Ashburton Baptist Church.' }
  );

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

      if (foundMember && inferProfileType(foundMember) !== 'staff') {
        setMember(null);
        setNotFound(true);
      } else if (foundMember) {
        setMember(foundMember);
      } else {
        setMember(null);
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
    return <Navigate to={{ pathname: '/about', hash: 'leadership' }} replace />;
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
              <p className="text-base sm:text-lg md:text-[1.375rem] leading-relaxed text-white text-center max-w-3xl mx-auto mb-6 transition-all duration-1000 delay-300 px-2 sm:px-0 font-raleway font-normal">
                {getDisplayRole(member)}
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={400}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24">
                <Link to={{ pathname: '/about', hash: 'leadership' }} className="group">
                  <GlowingButton
                    variant="outline"
                    size="md"
                    className="!px-6 !py-[14px] !border-gold !bg-gold/20 !text-black hover:!bg-gold hover:!text-white !rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 hover:!border-gold active:scale-95 hover:-translate-y-1 !normal-case"
                  >
                    <ArrowLeft
                      size={18}
                      className="mr-2 text-black transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:h-5 group-hover:w-5 group-hover:translate-x-1 group-hover:text-white"
                    />
                    <span className="text-base font-normal leading-6 text-black transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:font-semibold group-hover:tracking-wider group-hover:text-white">
                      Back to Leadership
                    </span>
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
      
      <section className="section-plain py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <ScrollReveal direction="up" delay={100} className="min-w-0">
            <div className="min-w-0 after:content-[''] after:table after:clear-both">
              {/* Float left on md+ so biography runs beside the photo and continues underneath — no empty column */}
              <div className="mx-auto mb-6 flex w-max max-w-full justify-center md:mx-0 md:mb-3 md:mr-8 md:mt-0.5 md:float-left">
                <div className="h-36 w-36 shrink-0 overflow-hidden rounded-full bg-gray-100 shadow-lg ring-4 ring-white/90 sm:h-44 sm:w-44">
                  <img
                    src={member.img || '/placeholder-avatar.png'}
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="min-w-0 text-black">
                <h3 className="mb-4 text-center font-serif text-2xl font-normal text-charcoal break-words md:text-left md:text-3xl">
                  {getDisplayRole(member)}
                </h3>
                <div className="max-w-full min-w-0 text-base leading-relaxed text-black md:text-lg [&_p]:mb-4 [&_p:last-child]:mb-0">
                  {member.description ? (
                    <p className="hyphens-auto whitespace-pre-line break-words text-pretty text-black [overflow-wrap:anywhere]">
                      {member.description}
                    </p>
                  ) : (
                    <p className="hyphens-auto break-words text-pretty text-black [overflow-wrap:anywhere]">
                      {member.name} serves at Ashburton Baptist Church with dedication and passion. Their commitment to
                      ministry and service to the community is evident in their work.
                    </p>
                  )}
                </div>
              </div>

              <div className="clear-both mt-8 border-t border-gray-200 pt-6">
                {member.email ? (
                  <p className="mb-8 break-all text-black">
                    <span className="font-bold text-charcoal">Email:</span> {member.email}
                  </p>
                ) : null}
                <div className="flex justify-center">
                  <Link to={{ pathname: '/about', hash: 'leadership' }} className="group">
                    <GlowingButton
                      variant="outline"
                      size="md"
                      className="!px-6 !py-[14px] !border-gold !bg-gold/20 !text-black hover:!bg-gold hover:!text-white !rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 hover:!border-gold active:scale-95 hover:-translate-y-1 !normal-case"
                    >
                      <ArrowLeft
                        size={18}
                        className="mr-2 text-black transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:h-5 group-hover:w-5 group-hover:translate-x-1 group-hover:text-white"
                      />
                      <span className="text-base font-normal leading-6 text-black transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:font-semibold group-hover:tracking-wider group-hover:text-white">
                        Back to Leadership
                      </span>
                    </GlowingButton>
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};
