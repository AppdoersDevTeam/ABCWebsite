import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Heart, PlayCircle, Clock, MapPin, Users, Church, DollarSign, Video, Info, HandHeart, Gift, ArrowDownToLine, MonitorPlay, Navigation, UserRound, RefreshCw, Settings, Handshake, Globe2, Network, HandCoins, BookOpen } from 'lucide-react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { ScrollReveal } from '../../components/UI/ScrollReveal';
import { supabase } from '../../lib/supabase';
import { Event } from '../../types';

export const Home = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [whatsOnEvents, setWhatsOnEvents] = useState<Event[]>([]);
  const [isLoadingWhatsOn, setIsLoadingWhatsOn] = useState(true);

  // Fetch upcoming events
  useEffect(() => {
    fetchUpcomingEvents();
    fetchWhatsOnEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_public', true)
        .gte('date', today.toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(3);

      if (error) throw error;
      setUpcomingEvents(data || []);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      setUpcomingEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const fetchWhatsOnEvents = async () => {
    setIsLoadingWhatsOn(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_public', true)
        .gte('date', today.toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(2);

      if (error) throw error;
      setWhatsOnEvents(data || []);
    } catch (error) {
      console.error('Error fetching what\'s on events:', error);
      setWhatsOnEvents([]);
    } finally {
      setIsLoadingWhatsOn(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    return { day, month };
  };

  const formatEventTime = (date: string, time: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return `Today, ${time}`;
    if (diffDays === 1) return `Tomorrow, ${time}`;
    if (diffDays < 7) return `${diffDays} days, ${time}`;
    
    return `${eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${time}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'service':
      case 'worship':
        return <PlayCircle size={24} />;
      case 'meeting':
      case 'connect':
        return <Users size={24} />;
      case 'community':
        return <Calendar size={24} />;
      case 'ministry':
        return <Users size={24} />;
      case 'media':
        return <Video size={24} />;
      default:
        return <Calendar size={24} />;
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
                Welcome to
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={150}>
              <h1 className="text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-250" style={{ fontFamily: 'Kaushan Script', fontSize: '4.25rem', lineHeight: '1.2' }}>
                Ashburton      Baptist      Church
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-[1.5625rem] leading-6 text-white text-center max-w-5xl mx-auto mb-6 transition-all duration-1000 delay-300">
                <span className="block whitespace-nowrap font-raleway font-normal text-center">A place where faith meets community, and every person matters.</span>
                <span className="block whitespace-nowrap mt-[12px] font-raleway font-normal text-center">Join us as we grow together in love, hope, and purpose.</span>
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={400}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24">
                <Link to="/events" className="group">
                  <GlowingButton variant="outline" size="md" className="!px-6 !py-[14px] !border-gold !bg-gold/20 !text-white hover:!bg-gold hover:!text-white !rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 hover:!border-gold active:scale-95 hover:-translate-y-1 !normal-case">
                    <MonitorPlay size={18} className="mr-2 text-gold transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:h-5 group-hover:w-5 group-hover:translate-x-1 group-hover:text-white" />
                    <span className="text-white font-normal text-base leading-6 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:font-semibold group-hover:tracking-wider">Watch Online</span>
                  </GlowingButton>
                </Link>
                <Link to="/contact" className="group">
                  <GlowingButton variant="outline" size="md" className="!px-6 !py-[14px] !border-white !bg-white/20 !text-white hover:!bg-white hover:!text-charcoal !rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 hover:!border-white active:scale-95 hover:-translate-y-1 !normal-case">
                    <Navigation size={18} className="mr-2 text-gold transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-125 group-hover:translate-y-[-2px] group-hover:text-charcoal" />
                    <span className="text-white font-normal text-base leading-6 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:font-semibold group-hover:tracking-wider group-hover:text-charcoal">Find Us</span>
                  </GlowingButton>
                </Link>
              </div>
            </ScrollReveal>

          </div>
          
          {/* Pulsing Down Arrow */}
          <div className="absolute bottom-[4px] left-1/2 -translate-x-1/2 z-20 pulse-arrow animate-ping-pong">
            <ArrowDownToLine size={32} className="text-gold" />
          </div>
        </div>
      </section>

      {/* Info Strip */}
      <section className="section-plain py-12 md:py-20 relative z-10">
         <div className="container mx-auto px-4">
             <div className="glass-card rounded-[16px] p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-10 border-t border-white/50 animate-scale-in group hover-lift">
                 <div className="flex items-center gap-6 w-full md:w-auto justify-center md:justify-start">
                     <div className="p-4 bg-[#fbcb05] rounded-full text-white flex-shrink-0 shadow-lg shadow-gold/30"><Clock size={32} strokeWidth={2}/></div>
                     <div>
                         <h3 className="font-serif font-normal text-2xl text-charcoal group-hover:text-gold transition-colors duration-300">Sundays 10AM</h3>
                         <p className="text-neutral font-medium group-hover:text-charcoal transition-colors">In-Person & Online</p>
                     </div>
                 </div>
                 <div className="hidden md:block w-px h-24 bg-charcoal/10"></div>
                 <div className="text-center md:text-left max-w-lg">
                     <h3 className="font-serif font-normal text-2xl text-charcoal mb-2 group-hover:text-gold transition-colors duration-300">A Place to Belong</h3>
                     <p className="text-neutral leading-relaxed group-hover:text-charcoal transition-colors">Whether you are exploring faith or looking for a home, you are welcome here.</p>
                 </div>
                 <div className="hidden md:block w-px h-24 bg-charcoal/10"></div>
                <Link to="/im-new" className="w-full md:w-auto group"><GlowingButton variant="outline" fullWidth className="!rounded-full !bg-gold !text-white !border-gold transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-gold/60 active:scale-95 hover:-translate-y-1">
                   <span className="transition-all duration-300 group-hover:tracking-wider">Plan Your Visit</span>
                   <ArrowRight size={18} className="ml-2 transition-all duration-500 group-hover:translate-x-2 group-hover:scale-125"/>
                 </GlowingButton></Link>
             </div>
         </div>
      </section>

      {/* Grid Features */}
      <section className="section-gradient py-12 md:py-20 relative z-10 w-full">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="down" delay={0}>
              <div className="text-center mb-12 md:mb-16">
                  <Handshake className="text-gold mx-auto mb-6" size={64} />
                  <h2 className="text-4xl md:text-5xl md:text-6xl font-serif font-normal text-white mb-4">Life at Ashburton</h2>
                  <span className="text-gold font-bold tracking-[0.3em] block text-base">Get Involved</span>
              </div>
            </ScrollReveal>

            <div className="flex justify-center">
              <div className="grid md:grid-cols-3 gap-8 w-full max-w-[70%]">
                  {[
                      { title: "Ministries", icon: <Network size={24} />, desc: "Connect with your people.", link: "/events" },
                      { title: "Giving", icon: <HandCoins size={24} />, desc: "Fuel the mission.", link: "/giving" },
                      { title: "Sermons", icon: <BookOpen size={24} />, desc: "Catch up on the latest.", link: "/events/sermons" },
                  ].map((item, i) => (
                      <ScrollReveal key={i} direction="up" delay={i * 100}>
                        <VibrantCard className={`group hover-lift text-center flex flex-col items-center justify-center h-full`} glow={i===1}>
                          <div className="flex items-center justify-center gap-4 mb-[14px]">
                            <div 
                              className="p-4 bg-[#fbcb05] rounded-full text-white flex-shrink-0 shadow-lg shadow-gold/30"
                            >{item.icon}</div>
                            <h3 className="text-2xl md:text-3xl font-serif font-normal text-charcoal group-hover:text-gold transition-colors duration-300 text-center">{item.title}</h3>
                          </div>
                          <p className="text-black mb-[26px] leading-relaxed text-center">{item.desc}</p>
                          <Link to={item.link} className="flex items-center justify-center text-charcoal font-bold uppercase tracking-widest text-[15px] group-hover:text-gold transition-colors">
                              EXPLORE <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform"/>
                          </Link>
                        </VibrantCard>
                      </ScrollReveal>
                  ))}
              </div>
            </div>
          </div>
      </section>

      {/* Upcoming Events */}
      <section className="section-plain py-12 md:py-20 relative z-10">
          <div className="container mx-auto px-4">
               <ScrollReveal direction="down" delay={0}>
                 <div className="text-center mb-12">
                     <Calendar className="text-gold mx-auto mb-6" size={64} />
                     <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal">Upcoming</h2>
                     <p className="text-gold mt-2 text-base font-bold">Join us this week.</p>
                 </div>
                 <div className="flex justify-center mb-12">
                     <Link to="/events" className="text-charcoal font-bold border-b-2 border-gold pb-1 hover:text-gold transition-colors">View Calendar</Link>
                 </div>
               </ScrollReveal>

               <div className="flex justify-center">
                 <div className="grid md:grid-cols-3 gap-8 w-full max-w-[80.5%]">
                   {isLoadingEvents ? (
                     // Loading skeleton
                     Array.from({ length: 3 }).map((_, i) => (
                       <ScrollReveal key={i} direction="up" delay={i * 100}>
                         <div className="glass-card border border-white/50 shadow-sm p-0 flex rounded-[8px] overflow-hidden bg-white/70 animate-pulse">
                           <div className="bg-gray-200 w-24 flex flex-col items-center justify-center p-4">
                             <div className="h-8 w-8 bg-gray-300 rounded mb-2"></div>
                             <div className="h-4 w-12 bg-gray-300 rounded"></div>
                           </div>
                           <div className="p-6 flex-1 flex flex-col justify-center">
                             <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
                             <div className="h-4 w-24 bg-gray-200 rounded"></div>
                           </div>
                         </div>
                       </ScrollReveal>
                     ))
                   ) : upcomingEvents.length === 0 ? (
                     // Empty state
                     <div className="col-span-3 text-center py-12">
                       <Calendar className="text-gray-300 mx-auto mb-4" size={48} />
                       <p className="text-neutral text-lg">No upcoming events scheduled</p>
                       <p className="text-neutral text-sm mt-2">Check back soon for new events!</p>
                     </div>
                   ) : (
                     // Real events
                     upcomingEvents.map((evt, i) => {
                       const { day, month } = formatEventDate(evt.date);
                       return (
                         <ScrollReveal key={evt.id} direction="up" delay={i * 100}>
                           <Link to="/events">
                             <div className="glass-card border border-white/50 shadow-sm p-0 flex rounded-[8px] overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/70 hover-lift cursor-pointer">
                               <div className="bg-gold transition-all duration-300 w-24 flex flex-col items-center justify-center p-4 text-white group-hover:scale-105">
                                 <span className="text-2xl md:text-3xl font-black group-hover:scale-110 transition-transform duration-300">{day}</span>
                                 <span className="text-xs md:text-sm font-bold tracking-wider">{month}</span>
                               </div>
                               <div className="p-6 flex-1 flex flex-col justify-center">
                                 <h4 className="text-lg md:text-xl font-bold text-charcoal mb-1 group-hover:text-gold transition-colors duration-300">{evt.title}</h4>
                                 <span className="text-neutral text-sm flex items-center group-hover:text-black transition-colors mb-1">
                                   <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center mr-2 group-hover:bg-gold transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 icon-bounce">
                                     <Clock size={16} className="text-gold group-hover:text-white"/>
                                   </div>
                                   {formatEventTime(evt.date, evt.time)}
                                 </span>
                                 {evt.location && (
                                   <span className="text-neutral text-xs flex items-center mt-1">
                                     <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center mr-2 group-hover:bg-gold transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 icon-bounce">
                                       <MapPin size={16} className="text-gold group-hover:text-white"/>
                                     </div>
                                     {evt.location}
                                   </span>
                                 )}
                                 {evt.category && (
                                   <span className="text-gold text-xs uppercase tracking-widest mt-2 font-bold">{evt.category}</span>
                                 )}
                               </div>
                             </div>
                           </Link>
                         </ScrollReveal>
                       );
                     })
                   )}
                 </div>
               </div>
          </div>
      </section>

      {/* About Preview */}
      <section className="section-gradient py-12 md:py-20 relative z-10 w-full">
          <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-8 items-center">
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
                        <Link to="/about" className="group">
                            <GlowingButton variant="outline" className="!rounded-full !bg-gold !text-white !border-gold transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-gold/60 active:scale-95 hover:-translate-y-1">
                                <span className="transition-all duration-300 group-hover:tracking-wider">Read More</span>
                                <ArrowRight size={16} className="ml-2 transition-all duration-500 group-hover:translate-x-2 group-hover:scale-125"/>
                            </GlowingButton>
                        </Link>
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

      {/* Events Preview */}
      <section className="section-plain py-12 md:py-20 relative z-10">
          <div className="container mx-auto px-4">
              <ScrollReveal direction="down" delay={0}>
                <div className="text-center mb-12">
                    <Settings className="text-gold mx-auto mb-6" size={64} />
                    <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal mb-4">Discover The Heart of A. B. C.</h2>
                    <span className="text-gold font-bold tracking-[0.3em] mb-4 block text-base">Our Church on the Move</span>
                    <p className="text-neutral text-lg max-w-2xl mx-auto">From Sunday services to community events,<br />There's always something happening at A.B.C.</p>
                </div>
              </ScrollReveal>
              <div className="flex justify-center">
                  <div className="grid md:grid-cols-3 gap-8 w-full max-w-[70%]">
                      {/* Static About Us Card - First Card */}
                      <ScrollReveal direction="up" delay={0}>
                          <div className="glass-card rounded-[16px] px-6 py-[3px] md:px-8 md:py-[11px] border-t border-white/50 animate-scale-in group hover-lift text-center flex flex-col items-center justify-center h-full">
                              <div className="flex items-center justify-center gap-4 mb-[14px]">
                                  <div className="p-4 bg-[#fbcb05] rounded-full text-white flex-shrink-0 shadow-lg shadow-gold/30">
                                      <Info size={24} />
                                  </div>
                                  <h3 className="text-2xl font-serif font-normal text-charcoal group-hover:text-gold transition-colors duration-300 text-center">About Us</h3>
                              </div>
                              <p className="text-gray-600 mb-[26px] leading-relaxed group-hover:text-black transition-colors text-center">Get to know A. B. C.</p>
                              <Link to="/about" className="flex items-center justify-center text-charcoal font-bold uppercase tracking-widest text-[15px] group-hover:text-gold transition-colors">
                                  EXPLORE <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform"/>
                              </Link>
                          </div>
                      </ScrollReveal>
                      
                      {/* Static Card 2 */}
                      <ScrollReveal direction="up" delay={100}>
                          <div className="glass-card rounded-[16px] px-6 py-[3px] md:px-8 md:py-[11px] border-t border-white/50 animate-scale-in group hover-lift text-center flex flex-col items-center justify-center h-full">
                              <div className="flex items-center justify-center gap-4 mb-[14px]">
                                  <div className="p-4 bg-[#fbcb05] rounded-full text-white flex-shrink-0 shadow-lg shadow-gold/30">
                                      <Handshake size={24} />
                                  </div>
                                  <h3 className="text-2xl font-serif font-normal text-charcoal group-hover:text-gold transition-colors duration-300 text-center">Our Team</h3>
                              </div>
                              <p className="text-gray-600 mb-[26px] leading-relaxed group-hover:text-black transition-colors text-center">Get to know Our Staff.</p>
                              <Link to="/about#leadership" className="flex items-center justify-center text-charcoal font-bold uppercase tracking-widest text-[15px] group-hover:text-gold transition-colors">
                                  EXPLORE <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform"/>
                              </Link>
                          </div>
                      </ScrollReveal>
                      
                      {/* Static Card 3 */}
                      <ScrollReveal direction="up" delay={200}>
                          <div className="glass-card rounded-[16px] px-6 py-[3px] md:px-8 md:py-[11px] border-t border-white/50 animate-scale-in group hover-lift text-center flex flex-col items-center justify-center h-full">
                              <div className="flex items-center justify-center gap-4 mb-[14px]">
                                  <div className="p-4 bg-[#fbcb05] rounded-full text-white flex-shrink-0 shadow-lg shadow-gold/30">
                                      <Globe2 size={24} />
                                  </div>
                                  <h3 className="text-2xl font-serif font-normal text-charcoal group-hover:text-gold transition-colors duration-300 text-center">Our Mission</h3>
                              </div>
                              <p className="text-gray-600 mb-[26px] leading-relaxed group-hover:text-black transition-colors text-center">Get to Know Our Missionaries.</p>
                              <Link to="/im-new" className="flex items-center justify-center text-charcoal font-bold uppercase tracking-widest text-[15px] group-hover:text-gold transition-colors">
                                  EXPLORE <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform"/>
                              </Link>
                          </div>
                      </ScrollReveal>
                  </div>
              </div>
          </div>
      </section>

      {/* I'm New Preview */}
      <section className="section-gradient py-12 md:py-20 relative z-10 w-full">
          <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
                  <ScrollReveal direction="right" delay={0}>
                    <div className="glass-card rounded-[16px] p-8 md:p-12 bg-white/80 hover-lift">
                          <Info className="text-gold mb-6" size={64} />
                          <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal mb-6">We're glad you're here</h2>
                          <p className="text-neutral text-lg leading-relaxed mb-6">
                              Visiting a new church can be intimidating. We want to make your first experience at Ashburton Baptist as welcoming as possible. 
                              Whether you're just visiting or looking for a place to call home, you belong here.
                          </p>
                          <div className="space-y-3 mb-8">
                              <div className="flex items-start gap-3">
                                  <Clock className="text-gold flex-shrink-0 mt-1" size={20} />
                                  <div>
                                      <p className="font-bold text-charcoal">Service Times</p>
                                      <p className="text-neutral text-sm">Sundays at 10:00 AM</p>
                                  </div>
                              </div>
                              <div className="flex items-start gap-3">
                                  <MapPin className="text-gold flex-shrink-0 mt-1" size={20} />
                                  <div>
                                      <p className="font-bold text-charcoal">Location</p>
                                      <p className="text-neutral text-sm">284 Havelock Street, Ashburton 7700</p>
                                  </div>
                              </div>
                          </div>
                          <Link to="/im-new" className="group">
                              <GlowingButton variant="outline" className="!rounded-full !bg-gold !text-white !border-gold transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-gold/60 active:scale-95 hover:-translate-y-1">
                                  <span className="transition-all duration-300 group-hover:tracking-wider">Learn More</span>
                                  <ArrowRight size={16} className="ml-2 transition-all duration-500 group-hover:translate-x-2 group-hover:scale-125"/>
                              </GlowingButton>
                          </Link>
                      </div>
                  </ScrollReveal>
                  <ScrollReveal direction="left" delay={200}>
                    <div className="space-y-4">
                        <h3 className="text-2xl font-serif font-normal text-white mb-6">Frequently Asked Questions</h3>
                        {[
                            { q: "What to expect at your 1st Service", a: "We recommend arriving 15 minutes early. You'll be welcomed by our team who will help you find a seat." },
                            { q: "How long are the Services?", a: "Our services are 90 minutes long, followed by time to connect in our Connect Café." },
                        ].map((item, i) => (
                            <ScrollReveal key={i} direction="up" delay={i * 100}>
                              <div className="bg-white border border-gray-200 p-6 rounded-[8px] hover:border-gold transition-all duration-300 group shadow-sm hover-lift">
                                  <h4 className="font-serif text-lg text-charcoal font-normal mb-2 group-hover:text-gold transition-colors duration-300">{item.q}</h4>
                                  <p className="text-neutral text-sm">{item.a}</p>
                              </div>
                            </ScrollReveal>
                        ))}
                    </div>
                  </ScrollReveal>
              </div>
          </div>
      </section>

      {/* Prayer Preview */}
      <section className="section-plain py-12 md:py-20 relative z-10">
          <div className="container mx-auto px-4">
              <ScrollReveal direction="down" delay={0}>
                <div className="max-w-3xl mx-auto text-center">
                    <HandHeart className="text-gold mx-auto mb-6" size={64} />
                    <span className="text-gold font-bold tracking-[0.3em] uppercase mb-4 block text-sm">Prayer</span>
                    <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal mb-6">We are here for you</h2>
                    <p className="text-neutral text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
                        Your request is handled with confidentiality and care. Whether you need prayer for yourself, a loved one, or a situation, 
                        our community is ready to stand with you in prayer.
                    </p>
                    <ScrollReveal direction="scale" delay={200}>
                      <div className="glass-card rounded-[16px] p-8 md:p-12 bg-white/80 mb-8 hover-lift">
                          <p className="text-charcoal text-lg mb-6">
                              "Bear one another's burdens, and so fulfill the law of Christ." - Galatians 6:2
                          </p>
                          <p className="text-neutral">
                              Share your prayer request with us, and know that you're being lifted up in prayer by our church family.
                          </p>
                      </div>
                    </ScrollReveal>
                    <ScrollReveal direction="up" delay={400}>
                      <Link to="/need-prayer" className="group">
                          <GlowingButton variant="gold" size="lg" className="!rounded-full transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-gold/60 active:scale-95 hover:-translate-y-1">
                              <span className="text-white transition-all duration-300 group-hover:tracking-wider">Share a Prayer Request</span>
                              <ArrowRight size={18} className="ml-2 text-white transition-all duration-500 group-hover:translate-x-2 group-hover:scale-125"/>
                          </GlowingButton>
                      </Link>
                    </ScrollReveal>
                </div>
              </ScrollReveal>
          </div>
      </section>

      {/* Giving Preview */}
      <section className="section-gradient py-12 md:py-20 relative z-10 w-full">
          <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                  <ScrollReveal direction="down" delay={0}>
                    <div className="text-center mb-12">
                        <Gift className="text-gold mx-auto mb-6" size={64} />
                        <span className="text-gold font-bold tracking-[0.3em] uppercase mb-4 block text-sm">Generosity</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-normal text-white mb-6">Fuel the Mission</h2>
                        <p className="text-white text-lg leading-relaxed max-w-2xl mx-auto mb-8">
                            "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."
                        </p>
                        <p className="text-gold text-sm uppercase tracking-widest font-bold">- 2 Corinthians 9:7</p>
                    </div>
                  </ScrollReveal>
                  <div className="grid md:grid-cols-2 gap-8">
                      <ScrollReveal direction="right" delay={0}>
                        <div className="glass-card rounded-[16px] p-8 bg-white/80 text-center hover-lift">
                          <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-6">
                              <Heart className="text-white group-hover:text-white" size={32} />
                          </div>
                          <h3 className="text-2xl font-serif font-normal text-charcoal mb-4">Direct Deposit</h3>
                          <p className="text-neutral mb-6">Give directly through bank transfer. Simple and secure.</p>
                          <Link to="/giving" className="group">
                              <GlowingButton variant="outline" size="sm" className="!rounded-full !bg-gold !text-white !border-gold transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-gold/60 active:scale-95 hover:-translate-y-1">
                                  <span className="transition-all duration-300 group-hover:tracking-wider">Learn More</span>
                                  <ArrowRight size={14} className="ml-2 transition-all duration-500 group-hover:translate-x-2 group-hover:scale-125"/>
                              </GlowingButton>
                          </Link>
                        </div>
                      </ScrollReveal>
                      <ScrollReveal direction="left" delay={200}>
                        <div className="glass-card rounded-[16px] p-8 bg-white/80 text-center hover-lift">
                          <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-6">
                              <DollarSign className="text-white group-hover:text-white" size={32} />
                          </div>
                          <h3 className="text-2xl font-serif font-normal text-charcoal mb-4">Credit Card</h3>
                          <p className="text-neutral mb-6">Secure online giving via Stripe. Set up recurring giving or make a one-time impact.</p>
                          <Link to="/giving" className="group">
                              <GlowingButton variant="outline" size="sm" className="!rounded-full !bg-gold !text-white !border-gold transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-gold/60 active:scale-95 hover:-translate-y-1">
                                  <span className="transition-all duration-300 group-hover:tracking-wider">Learn More</span>
                                  <ArrowRight size={14} className="ml-2 transition-all duration-500 group-hover:translate-x-2 group-hover:scale-125"/>
                              </GlowingButton>
                          </Link>
                        </div>
                      </ScrollReveal>
                  </div>
                  <ScrollReveal direction="up" delay={400}>
                    <div className="text-center mt-8">
                        <Link to="/giving" className="group">
                            <GlowingButton variant="outline" size="lg" className="!rounded-full !bg-gold !text-white !border-gold transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-gold/60 active:scale-95 hover:-translate-y-1">
                                <span className="transition-all duration-300 group-hover:tracking-wider">Learn More About Giving</span>
                                <ArrowRight size={18} className="ml-2 transition-all duration-500 group-hover:translate-x-2 group-hover:scale-125"/>
                            </GlowingButton>
                        </Link>
                    </div>
                  </ScrollReveal>
              </div>
          </div>
      </section>
    </div>
  );
};