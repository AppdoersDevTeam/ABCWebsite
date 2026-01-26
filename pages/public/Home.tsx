import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Heart, PlayCircle, Clock, MapPin, Users, Church, DollarSign, Video, Info, HandHeart, Gift, ArrowDownToLine, MonitorPlay, Navigation, UserRound, RefreshCw, Settings, Handshake, Globe2, Network, HandCoins, BookOpen, Plus, Minus } from 'lucide-react';
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
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

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

  const faqItems = [
    { q: "What can I expect at my first service?", a: "From the moment you arrive, you’ll be greeted by friendly people who are genuinely glad you’re here. Our services include worship, prayers, communion, birthdays and aniversaries celebrations, announcements and a Bible-based message that’s practical, intentional and relevant to everyday life. There’s no pressure to participate in anything you’re not comfortable with — simply come as you are and take it at your own pace." },
    { q: "How long is the service?", a: "Our services usually last about 1h30 - 2hrs. This allows time for worship, prayers, communion, birthdays and aniversaries celebrations, announcements and a Bible-based message without feeling rushed or overly long." },
    { q: "Does the church have a kids’ service?", a: "Yes! We offer a safe, fun, and engaging kids’ program during the service. Our trained and caring team creates an age-appropriate environment where children can learn about God while making friends. You’re welcome to check it out or keep your children with you — whatever feels best for your family." },
    { q: "Do I need to be a member or have a church background to attend?", a: "Not at all. You don’t need to be a member, and you don’t need to have any church experience. Whether you’re exploring faith, returning to church, or have followed Jesus for years, you are welcome here." },
    { q: "What if I don’t know anyone?", a: "You’re not alone — many people come for the first time without knowing anyone. Our community is friendly and welcoming, and there are simple ways to connect if you’d like, but no pressure if you prefer to remain anonymous at first." },
    { q: "How can I get connected beyond Sunday services?", a: "There are opportunities to connect through small groups, events, and serving teams. These are great ways to build friendships, grow spiritually, and feel at home in the church — but again, participation is always optional and volunteer." },
    { q: "What does the church believe?", a: "A.B.C. is a Bible-based Christian church focused on loving God, loving people, and serving our community. If you’d like to learn more about what we believe, we’d be happy to talk with you or point you to helpful resources @ About\\Our Beliefs." },
    { q: "Where can I Park?", a: "We have a dedicated car park on Church grounds on Havelock Street. There is also ample free off-street parking available close to and in the vicinity of the Church auditorium. Please Note: that there are roadworks happening around the Church and all over the Town Centre, so please plan your time to allow for extra time to find parking." },
  ];

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
                Ashburton      Baptist      Church
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-base sm:text-lg md:text-[1.375rem] lg:text-[1.5625rem] leading-relaxed text-white text-center max-w-5xl mx-auto mb-6 transition-all duration-1000 delay-300 px-2 sm:px-0">
                <span className="block font-raleway font-normal text-center">A place where faith meets community, and every person matters.</span>
                <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">Join us as we grow together in love, hope, and purpose.</span>
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
                     </div>
                 </div>
                 <div className="hidden md:block w-px h-24 bg-charcoal/10"></div>
                 <div className="text-center md:text-left max-w-lg">
                     <h3 className="font-serif font-normal text-2xl text-charcoal mb-2 group-hover:text-gold transition-colors duration-300">A Place to Belong</h3>
                     <p className="text-neutral leading-relaxed group-hover:text-charcoal transition-colors">Where Faith and Family Grow Together like a Family.</p>
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
      <section className="section-gradient py-12 md:py-20 relative z-10 w-full overflow-hidden">
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
      <section className="section-gradient py-12 md:py-20 relative z-10 w-full overflow-hidden">
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
              <div className="grid md:grid-cols-2 gap-8 items-center">
                  <ScrollReveal direction="right" delay={0}>
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <Church className="text-gold flex-shrink-0" size={64} />
                            <h2 className="text-4xl md:text-5xl font-serif font-normal text-white">Welcome <span className="text-gold">to our Family.</span></h2>
                        </div>
                        <span className="text-gold font-bold tracking-[0.3em] mb-4 block text-base text-center">Who we are.</span>
                        <p className="text-white text-lg leading-relaxed mb-6">
                            We aren't just a building. We are a movement of people passionate about Jesus and our city. 
                            From humble beginnings to a vibrant community, our mission remains the same: <span className="text-black font-bold">Be intention and Missional</span>
                        </p>
                        <p className="text-white leading-relaxed mb-8">
                            To see lives transformed by the gospel of Jesus Christ, equipping every generation to impact their community with hope, love, and service.
                        </p>
                        <Link to="/about" className="group">
                            <GlowingButton variant="outline" className="!rounded-full !bg-gold !text-white !border-gold transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-gold/60 active:scale-95 hover:-translate-y-1">
                                <span className="transition-all duration-300 group-hover:tracking-wider">EXPLORE</span>
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
      <section className="section-gradient py-12 md:py-20 relative z-10 w-full overflow-hidden">
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
              <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
                  <ScrollReveal direction="right" delay={0}>
                    <div className="glass-card rounded-[16px] p-8 md:p-12 bg-white/80 hover-lift">
                          <div className="flex items-center gap-4 mb-6">
                              <Info className="text-gold" size={64} />
                              <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal">Visitins US...</h2>
                          </div>
                          <p className="text-neutral text-lg leading-relaxed mb-6">
                              Visiting a new church can be intimidating. We want to make your first experience at Ashburton Baptist as welcoming as possible. 
                              Whether you’re visiting for the first time or prayerfully considering a church to call home, you are warmly welcome here.
                          </p>
                          <div className="space-y-3 mb-8">
                              <div className="flex items-start gap-3">
                                  <Clock className="text-gold flex-shrink-0 mt-1" size={26} />
                                  <div>
                                      <p className="font-bold text-charcoal">Service Time</p>
                                      <p className="text-neutral text-sm">Sunday at 10:00 am</p>
                                  </div>
                              </div>
                              <div className="flex items-start gap-3">
                                  <svg
                                    className="h-[26px] w-[26px] flex-shrink-0 mt-1 text-gold"
                                    viewBox="0 0 103.4 122.88"
                                    aria-hidden="true"
                                    focusable="false"
                                  >
                                    <path
                                      fill="currentColor"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinejoin="round"
                                      d="M56.76,37.15c-0.09,0.04-0.17,0.09-0.26,0.14c-0.3,0.18-0.55,0.41-0.74,0.7c-0.2,0.32-0.35,0.72-0.44,1.23 c-0.49,2.95-0.2,7.71,0.14,13.21c0.17,2.86,0.36,5.92,0.46,9.27c0.11,3.63-0.08,7.05-0.26,10.45c-0.17,3.18-0.34,6.34-0.27,9.47 c0.01,0.33,0.02,0.72,0.04,1.16c0.01,0.31,0.03,0.69,0.06,1.16c0.25,4.4,0.64,8.24,1.72,11.71c1.04,3.35,2.76,6.43,5.68,9.48 c0.77,0.81,3.66,3.11,6.83,5.55c4.04,3.11,8.45,6.36,9.6,7.07c1.22,0.75,1.6,2.35,0.84,3.57s-2.35,1.6-3.57,0.84 c-1.3-0.8-5.91-4.19-10.05-7.38c-3.34-2.57-6.44-5.06-7.4-6.06c-3.54-3.7-5.63-7.45-6.9-11.54c-0.18-0.57-0.34-1.15-0.49-1.74 c-1.25,4.03-3.35,8.04-6.74,12.14c-0.81,0.98-3.75,3.76-6.92,6.65c-3.85,3.51-8.1,7.26-9.24,8.12c-1.15,0.86-2.78,0.64-3.64-0.51 c-0.86-1.15-0.64-2.78,0.51-3.64c1.03-0.78,5.12-4.39,8.88-7.81c3.05-2.78,5.81-5.37,6.41-6.1c8.41-10.19,7.56-20.32,6.58-32.01 c-0.7-8.4-1.47-17.55,0.78-28.26c0.44-2.1,0.59-3.79,0.08-4.81c-0.33-0.65-1.09-1.13-2.47-1.42c-1.43,1.72-2.78,4.34-4.04,7.56 c-1.57,4.02-2.98,8.94-4.25,14.28c-0.33,1.4-1.73,2.26-3.13,1.93c-1.4-0.33-2.26-1.73-1.93-3.13c1.32-5.52,2.79-10.67,4.48-14.97 c1.61-4.12,3.44-7.49,5.54-9.73L48.68,7c-1.09-1.12-2.03-1.67-2.78-1.54c-1.09,0.2-2.33,1.62-3.75,4.51L31.43,37.74 c-2.73,7.07-4.3,11.75-5.03,16.52c-0.74,4.76-0.68,9.81-0.16,17.66l0.63,9.57c0.06,0.97-0.42,1.85-1.18,2.34L4.1,99.17 c-1.17,0.83-2.79,0.56-3.62-0.61c-0.83-1.17-0.56-2.79,0.61-3.62l20.49-14.57l-0.53-8.13c-0.54-8.19-0.59-13.53,0.22-18.78 c0.81-5.24,2.46-10.19,5.32-17.59L37.33,8.08c0.03-0.1,0.07-0.2,0.12-0.3c2.22-4.57,4.75-6.92,7.54-7.42 c2.25-0.4,4.41,0.38,6.49,2.17c1.56-1.34,3.18-2.26,4.9-2.48c2.75-0.35,5.29,0.91,7.52,4.69c0.11,0.16,0.2,0.34,0.28,0.54 l9.13,24.1c0.66,1.74,1.13,2.95,1.59,4.14c3.92,10.15,7.13,18.45,7.38,30.4c0.07,3,0.12,6.09,0.03,9.22 c-0.08,2.72-0.28,5.45-0.67,8.16l20.8,16.73c1.12,0.9,1.29,2.53,0.4,3.65c-0.9,1.12-2.53,1.29-3.65,0.4L77.2,84.4 c-0.76-0.61-1.09-1.57-0.93-2.47l0,0c0.53-3.01,0.77-5.99,0.86-8.93c0.09-3.03,0.03-6.05-0.03-8.98 C76.85,53,73.79,45.09,70.05,35.4c-0.58-1.51-1.18-3.06-1.61-4.18L59.38,7.3c-0.95-1.6-1.71-2.18-2.35-2.1 c-0.77,0.1-1.71,0.78-2.75,1.8l5.95,26.18c0.35,0.44,0.7,0.9,1.04,1.39c0.47,0.66,0.91,1.34,1.33,2.03 c1.75,2.88,3.24,6.23,4.57,10.08c1.32,3.8,2.48,8.06,3.58,12.82c0.32,1.4-0.55,2.79-1.95,3.11c-1.4,0.32-2.79-0.55-3.11-1.95 c-1.07-4.65-2.18-8.74-3.41-12.29c-1.22-3.51-2.56-6.53-4.11-9.08c-0.37-0.61-0.75-1.19-1.13-1.73 C56.95,37.42,56.85,37.29,56.76,37.15L56.76,37.15z M48.14,32.99c1.45,0.44,2.59,1.08,3.47,1.9c0.62-0.86,1.37-1.54,2.21-2.05 c0.29-0.18,0.6-0.33,0.91-0.47l-3.24-14.23L48.14,32.99L48.14,32.99z"
                                    />
                                  </svg>
                                  <div>
                                      <p className="font-bold text-charcoal">Prayer Meeting</p>
                                      <p className="text-neutral text-sm">Sundays at 5:00 pm</p>
                                  </div>
                              </div>
                              <div className="flex items-start gap-3">
                                  <MapPin className="text-gold flex-shrink-0 mt-1" size={26} />
                                  <div>
                                      <p className="font-bold text-charcoal">Location</p>
                                      <p className="text-neutral text-sm">284 Havelock Street, Ashburton 7700</p>
                                  </div>
                              </div>
                          </div>
                          <Link to="/im-new" className="group">
                              <GlowingButton variant="outline" className="!rounded-full !bg-gold !text-white !border-gold transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-gold/60 active:scale-95 hover:-translate-y-1">
                                  <span className="transition-all duration-300 group-hover:tracking-wider">Plan Your Visit</span>
                                  <ArrowRight size={16} className="ml-2 transition-all duration-500 group-hover:translate-x-2 group-hover:scale-125"/>
                              </GlowingButton>
                          </Link>
                      </div>
                  </ScrollReveal>
                  <ScrollReveal direction="left" delay={200}>
                    <div className="space-y-4">
                        <h3 className="text-[28px] font-serif font-normal text-white mb-6">Frequently Asked Questions</h3>
                        {faqItems.map((item, i) => {
                          const isOpen = openFaqIndex === i;
                          return (
                            <ScrollReveal key={i} direction="up" delay={i * 100}>
                              <div className="bg-white border border-gray-200 px-6 py-[7px] rounded-[8px] hover:border-gold transition-all duration-300 group shadow-sm hover-lift">
                                  <button
                                    type="button"
                                    className="w-full flex items-start gap-3 text-left"
                                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                                    aria-expanded={isOpen}
                                  >
                                    <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#738242] text-[#738242] flex-shrink-0 group-hover:bg-[#fbcb05] group-hover:border-[#fbcb05] group-hover:text-charcoal">
                                      {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                                    </span>
                                    <div className="flex-1">
                                      <h4 className="font-serif text-lg text-charcoal font-normal group-hover:text-gold transition-colors duration-300">
                                        {item.q}
                                      </h4>
                                      {isOpen && <p className="text-neutral text-sm mt-2">{item.a}</p>}
                                    </div>
                                  </button>
                              </div>
                            </ScrollReveal>
                          );
                        })}
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
                    <span className="text-gold font-bold tracking-[0.3em] uppercase mb-4 block text-sm">Prayers</span>
                    <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal mb-6">We do support you...</h2>
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
                              Prayer matters — Let us pray with you and for you.
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
      <section className="section-gradient py-12 md:py-20 relative z-10 w-full overflow-hidden">
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
              <div className="max-w-4xl mx-auto">
                  <ScrollReveal direction="down" delay={0}>
                    <div className="text-center mb-12">
                        <Gift className="text-gold mx-auto mb-6" size={64} />
                        <span className="text-gold font-bold tracking-[0.3em] uppercase mb-4 block text-sm">Generosity</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-normal text-white mb-6">Fuel the Mission</h2>
                        <p className="text-white text-lg leading-relaxed max-w-2xl mx-auto mb-8">
                            Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.
                            <span className="text-gold font-bold text-[15px]"> 2Cor 9:7</span>
                        </p>
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