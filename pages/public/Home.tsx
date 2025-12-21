import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Heart, PlayCircle, Clock, MapPin, Users, Church, DollarSign, Video, Info, HandHeart, Gift } from 'lucide-react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { VibrantCard } from '../../components/UI/VibrantCard';

// Internal Typewriter Component for smooth sequencing without cursor
interface TypewriterTextProps {
  text: string;
  delay: number;
  className: string;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ text, delay, className }) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, 120); // Typing speed
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(startTimeout);
  }, [text, delay]);

  return (
    <span className={`${className} inline-block min-h-[1em]`}>
      {displayText}
    </span>
  );
};

export const Home = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [cycle, setCycle] = useState(0);

  // Restart animation loop every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setCycle(prev => prev + 1);
    }, 120000); // 2 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const { left, top, width, height } = heroRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;
      
      heroRef.current.style.setProperty('--mouse-x', x.toString());
      heroRef.current.style.setProperty('--mouse-y', y.toString());
      heroRef.current.style.setProperty('--spotlight-x', `${e.clientX - left}px`);
      heroRef.current.style.setProperty('--spotlight-y', `${e.clientY - top}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="space-y-0 overflow-hidden">
      
      {/* Sun Drenched Hero with Interaction */}
      <section 
        ref={heroRef}
        className="relative min-h-[95vh] flex items-center justify-center pt-40 pb-12 lg:pt-32 group perspective-1000 overflow-hidden"
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
            <img 
              src="/ABC background01.png" 
              alt="Ashburton Baptist Church" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]"></div>
        </div>

        {/* Dynamic Spotlight Overlay */}
        <div 
            className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
            style={{
                background: `radial-gradient(600px circle at var(--spotlight-x) var(--spotlight-y), rgba(251, 203, 5, 0.2), transparent 40%)`
            }}
        />

        <div className="container relative z-10 px-4">
           <div className="grid lg:grid-cols-12 gap-12 items-center">
              
              {/* Typography Impact - Typewriter */}
              <div 
                className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left"
              >
                  <h1 className="flex flex-col leading-[0.85] tracking-tighter mb-8 min-h-[200px] lg:min-h-[280px] justify-center lg:justify-start pt-8 lg:pt-12">
                      <TypewriterText 
                        key={`enc-${cycle}`}
                        text="ENCOUNTER" 
                        delay={0} 
                        className="text-[9vw] lg:text-[6rem] font-black text-gold drop-shadow-sm opacity-90 font-sans"
                      />
                      <div className="md:ml-20">
                         <TypewriterText 
                            key={`con-${cycle}`}
                            text="CONNECT" 
                            delay={1200} 
                            className="text-[8vw] lg:text-[5.5rem] font-black text-charcoal font-serif"
                        />
                      </div>
                      <div className="md:ml-40">
                         <TypewriterText 
                            key={`imp-${cycle}`}
                            text="IMPACT" 
                            delay={2200} 
                            className="text-[8vw] lg:text-[5.5rem] font-black text-white drop-shadow-lg font-sans"
                         />
                      </div>
                  </h1>
                  
                  <div 
                    className="opacity-0 animate-fade-in-up" 
                    style={{ animationDelay: '3000ms', animationFillMode: 'forwards' }}
                  >
                      <p className="text-lg md:text-2xl text-neutral font-light max-w-2xl mx-auto lg:ml-20 mb-10 leading-relaxed">
                          We are a vibrant community in Ashburton, illuminated by the Gospel and sharing warmth with our city.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start lg:ml-20">
                          <Link to="/im-new"><GlowingButton size="lg" fullWidth={false} className="w-full sm:w-auto shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-transform">I'm New</GlowingButton></Link>
                          <Link to="/events"><GlowingButton variant="outline" size="lg" fullWidth={false} className="w-full sm:w-auto hover:-translate-y-1 transition-transform">What's On</GlowingButton></Link>
                      </div>
                  </div>
              </div>

              {/* Action Area - Floating Glass - Inverse Parallax */}
              <div 
                className="lg:col-span-5 h-full flex flex-col gap-6 justify-center mt-8 lg:mt-0 transition-transform duration-100 ease-out animate-fade-in-up delay-700"
                style={{
                    transform: 'translate(calc(var(--mouse-x) * 10px), calc(var(--mouse-y) * 10px))'
                }}
              >
                  <div className="glass-card rounded-[24px] p-6 md:p-8 hover:-translate-y-1 transition-all duration-500 shadow-2xl border-l-4 border-l-gold bg-white/60 backdrop-blur-xl">
                      <h3 className="text-2xl md:text-3xl font-serif font-bold text-charcoal mb-4">Visit Us</h3>
                      <div className="flex items-center gap-4 mb-4 text-neutral">
                          <Clock className="text-gold flex-shrink-0 animate-pulse-slow" />
                          <span className="font-bold">Sunday 10AM</span>
                      </div>
                      <div className="flex items-center gap-4 text-neutral">
                          <MapPin className="text-gold flex-shrink-0" />
                          <span>284 Havelock Street, Ashburton 7700</span>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <Link to="/events" className="glass-card rounded-[24px] p-6 flex flex-col items-center justify-center text-center hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white/60">
                          <div className="p-3 bg-gray-50 rounded-full group-hover:bg-gold group-hover:text-charcoal transition-colors mb-3">
                            <Calendar size={28} className="text-charcoal" />
                          </div>
                          <span className="font-bold text-sm uppercase tracking-wider text-neutral group-hover:text-charcoal">Events</span>
                      </Link>
                      <Link to="#" className="bg-gold rounded-[24px] p-6 flex flex-col items-center justify-center text-center hover:bg-yellow-400 hover:-translate-y-2 transition-all duration-300 cursor-pointer shadow-lg shadow-gold/30 group">
                          <div className="p-3 bg-white/20 rounded-full mb-3">
                            <PlayCircle size={28} className="text-charcoal" />
                          </div>
                          <span className="font-bold text-sm uppercase tracking-wider text-charcoal">Latest Sermon</span>
                      </Link>
                  </div>
              </div>
           </div>
        </div>
      </section>

      {/* Info Strip */}
      <section className="py-12 md:py-20 relative z-10">
         <div className="container mx-auto px-4">
             <div className="glass-card rounded-[16px] p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-10 hover:shadow-2xl transition-shadow duration-500 border-t border-white/50 animate-scale-in">
                 <div className="flex items-center gap-6 w-full md:w-auto justify-center md:justify-start">
                     <div className="p-4 bg-gold rounded-full text-charcoal flex-shrink-0 shadow-lg shadow-gold/30 animate-pulse-slow"><Clock size={32} strokeWidth={2}/></div>
                     <div>
                         <h3 className="font-serif font-bold text-2xl text-charcoal">Sundays 10AM</h3>
                         <p className="text-neutral font-medium">In-Person & Online</p>
                     </div>
                 </div>
                 <div className="hidden md:block w-px h-24 bg-charcoal/10"></div>
                 <div className="text-center md:text-left max-w-lg">
                     <h3 className="font-serif font-bold text-2xl text-charcoal mb-2">A Place to Belong</h3>
                     <p className="text-neutral leading-relaxed">Whether you are exploring faith or looking for a home, you are welcome here.</p>
                 </div>
                 <div className="hidden md:block w-px h-24 bg-charcoal/10"></div>
                 <Link to="/im-new" className="w-full md:w-auto"><GlowingButton variant="outline" fullWidth className="hover:bg-charcoal hover:text-white hover:border-charcoal">Plan Your Visit</GlowingButton></Link>
             </div>
         </div>
      </section>

      {/* Grid Features */}
      <section className="py-12 md:py-20 container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 md:mb-16">
              <span className="text-gold font-bold tracking-[0.3em] uppercase mb-4 block animate-slide-in-right">Get Involved</span>
              <h2 className="text-4xl md:text-5xl md:text-6xl font-serif font-bold text-charcoal animate-fade-in-up">Life at Ashburton</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
              {[
                  { title: "Ministries", icon: <Church size={40} />, desc: "Connect with your people.", link: "/events" },
                  { title: "Giving", icon: <DollarSign size={40} />, desc: "Fuel the mission.", link: "/giving" },
                  { title: "Sermons", icon: <Video size={40} />, desc: "Catch up on the latest.", link: "#" },
              ].map((item, i) => (
                  <VibrantCard key={i} className={`group animate-fade-in-up hover-lift`} glow={i===1} style={{ animationDelay: `${300 + i * 200}ms` }}>
                      <div className="mb-6 text-charcoal p-4 bg-gold/10 rounded-full w-fit group-hover:bg-gold transition-all duration-300 shadow-sm group-hover:scale-110 group-hover:rotate-6 icon-bounce">{item.icon}</div>
                      <h3 className="text-2xl md:text-3xl font-serif font-bold text-charcoal mb-3 group-hover:text-gold transition-colors duration-300">{item.title}</h3>
                      <p className="text-neutral mb-8 leading-relaxed group-hover:text-charcoal transition-colors">{item.desc}</p>
                      <Link to={item.link} className="flex items-center text-charcoal font-bold uppercase tracking-widest text-xs group-hover:text-gold transition-colors">
                          Learn More <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform"/>
                      </Link>
                  </VibrantCard>
              ))}
          </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-12 md:py-20 relative z-10">
          <div className="container mx-auto px-4">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                   <div>
                     <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal">Upcoming</h2>
                     <p className="text-neutral mt-2">Join us this week.</p>
                   </div>
                   <Link to="/events" className="text-charcoal font-bold border-b-2 border-gold pb-1 hover:text-gold transition-colors">View Calendar</Link>
               </div>

               <div className="grid md:grid-cols-3 gap-6">
                   {[
                       { day: '24', month: 'OCT', title: 'Worship Night', time: '7:00 PM' },
                       { day: '27', month: 'OCT', title: 'Community Picnic', time: '12:00 PM' },
                       { day: '03', month: 'NOV', title: 'Baptism Sunday', time: '10:00 AM' },
                   ].map((evt, i) => (
                       <div key={i} className="glass-card border border-white/50 shadow-sm p-0 flex rounded-[8px] overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/70 animate-fade-in-up hover-lift" style={{ animationDelay: `${400 + i * 150}ms` }}>
                           <div className="bg-gold/10 group-hover:bg-gold transition-all duration-300 w-24 flex flex-col items-center justify-center p-4 text-charcoal group-hover:scale-105">
                               <span className="text-2xl md:text-3xl font-black group-hover:scale-110 transition-transform duration-300">{evt.day}</span>
                               <span className="text-xs md:text-sm font-bold tracking-wider">{evt.month}</span>
                           </div>
                           <div className="p-6 flex-1 flex flex-col justify-center">
                               <h4 className="text-lg md:text-xl font-bold text-charcoal mb-1 group-hover:text-gold transition-colors duration-300">{evt.title}</h4>
                               <span className="text-neutral text-sm flex items-center group-hover:text-charcoal transition-colors"><Clock size={14} className="mr-2 text-gold animate-pulse-slow"/> {evt.time}</span>
                           </div>
                       </div>
                   ))}
               </div>
          </div>
      </section>

      {/* About Preview */}
      <section className="py-12 md:py-20 relative z-10 bg-gray-50">
          <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="animate-fade-in-left delay-200">
                      <span className="text-gold font-bold tracking-[0.3em] uppercase mb-4 block text-sm">Who We Are</span>
                      <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal mb-6">Established 1882. <span className="text-gold">Reimagined Daily.</span></h2>
                      <p className="text-neutral text-lg leading-relaxed mb-6">
                          We aren't just a building. We are a movement of people passionate about Jesus and our city. 
                          From humble beginnings to a vibrant community, our mission remains the same: <span className="text-charcoal font-bold">Impact.</span>
                      </p>
                      <p className="text-neutral leading-relaxed mb-8">
                          To see lives transformed by the gospel of Jesus Christ, equipping every generation to impact their community with hope, love, and service.
                      </p>
                      <Link to="/about">
                          <GlowingButton variant="outline" className="group">
                              Read More <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform"/>
                          </GlowingButton>
                      </Link>
                  </div>
                  <div className="animate-fade-in-right delay-400">
                      <div className="glass-card rounded-[16px] p-8 md:p-12 bg-white/80 hover-lift">
                          <div className="grid grid-cols-2 gap-4">
                              {['One God', 'Jesus Savior', 'Spirit Power', 'Bible Authority'].map((item, i) => (
                                  <div key={i} className="bg-white shadow-sm p-6 rounded-[8px] border border-gray-100 flex flex-col justify-center items-center text-center hover:shadow-md hover:border-gold transition-all duration-300 group">
                                      <span className="text-xl md:text-2xl font-serif font-bold mb-2 text-charcoal">{item.split(' ')[0]}</span>
                                      <span className="text-xs uppercase tracking-widest text-neutral group-hover:text-gold font-bold">{item.split(' ')[1]}</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Events Preview */}
      <section className="py-12 md:py-20 relative z-10">
          <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                  <span className="text-gold font-bold tracking-[0.3em] uppercase mb-4 block text-sm">What's On</span>
                  <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal mb-4">Join Us This Week</h2>
                  <p className="text-neutral text-lg max-w-2xl mx-auto">From Sunday services to community events, there's always something happening at Ashburton Baptist.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
                  {[
                      { title: "Sunday Service", time: "Every Sunday, 10:00 AM", category: "Service", icon: <PlayCircle size={24}/>, desc: "Join us for worship and teaching." },
                      { title: "Young Adults", time: "Wednesdays, 7:00 PM", category: "Connect", icon: <Users size={24}/>, desc: "A space for 18-30s to connect." },
                  ].map((evt, i) => (
                      <div key={i} className="group relative bg-white border border-gray-100 shadow-sm p-6 rounded-[8px] hover:shadow-lg hover:border-gold/30 transition-all duration-300 animate-fade-in-up hover-lift" style={{ animationDelay: `${300 + i * 150}ms` }}>
                          <div className="bg-gold/10 p-4 rounded-full text-charcoal mb-4 w-fit group-hover:bg-gold transition-colors duration-300 group-hover:scale-110 group-hover:rotate-6 icon-bounce">
                              {evt.icon}
                          </div>
                          <div className="flex items-center gap-3 mb-2">
                              <span className="text-gold font-bold text-xs uppercase tracking-widest bg-gold/5 px-2 py-1 rounded-[4px] border border-gold/20">{evt.category}</span>
                              <span className="text-neutral text-sm font-bold">{evt.time}</span>
                          </div>
                          <h3 className="text-2xl font-serif font-bold text-charcoal mb-2 group-hover:text-gold transition-colors duration-300">{evt.title}</h3>
                          <p className="text-neutral">{evt.desc}</p>
                      </div>
                  ))}
              </div>
              <div className="text-center">
                  <Link to="/events">
                      <GlowingButton variant="outline" className="group">
                          View All Events <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform"/>
                      </GlowingButton>
                  </Link>
              </div>
          </div>
      </section>

      {/* I'm New Preview */}
      <section className="py-12 md:py-20 relative z-10 bg-gray-50">
          <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
                  <div className="animate-fade-in-left delay-200">
                      <div className="glass-card rounded-[16px] p-8 md:p-12 bg-white/80 hover-lift">
                          <Info className="text-gold mb-6" size={48} />
                          <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal mb-6">We're glad you're here</h2>
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
                          <Link to="/im-new">
                              <GlowingButton variant="outline" className="group">
                                  Learn More <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform"/>
                              </GlowingButton>
                          </Link>
                      </div>
                  </div>
                  <div className="animate-fade-in-right delay-400">
                      <div className="space-y-4">
                          <h3 className="text-2xl font-serif font-bold text-charcoal mb-6">Frequently Asked Questions</h3>
                          {[
                              { q: "What to expect at your 1st Service", a: "We recommend arriving 15 minutes early. You'll be welcomed by our team who will help you find a seat." },
                              { q: "How long are the Services?", a: "Our services are 90 minutes long, followed by time to connect in our Connect Café." },
                          ].map((item, i) => (
                              <div key={i} className="bg-white border border-gray-200 p-6 rounded-[8px] hover:border-gold transition-all duration-300 group shadow-sm hover-lift">
                                  <h4 className="font-serif text-lg text-charcoal font-bold mb-2 group-hover:text-gold transition-colors duration-300">{item.q}</h4>
                                  <p className="text-neutral text-sm">{item.a}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Prayer Preview */}
      <section className="py-12 md:py-20 relative z-10">
          <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                  <HandHeart className="text-gold mx-auto mb-6 animate-float" size={64} />
                  <span className="text-gold font-bold tracking-[0.3em] uppercase mb-4 block text-sm">Prayer</span>
                  <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal mb-6">We are here for you</h2>
                  <p className="text-neutral text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
                      Your request is handled with confidentiality and care. Whether you need prayer for yourself, a loved one, or a situation, 
                      our community is ready to stand with you in prayer.
                  </p>
                  <div className="glass-card rounded-[16px] p-8 md:p-12 bg-white/80 mb-8 hover-lift">
                      <p className="text-charcoal text-lg mb-6">
                          "Bear one another's burdens, and so fulfill the law of Christ." - Galatians 6:2
                      </p>
                      <p className="text-neutral">
                          Share your prayer request with us, and know that you're being lifted up in prayer by our church family.
                      </p>
                  </div>
                  <Link to="/need-prayer">
                      <GlowingButton size="lg" className="group">
                          Share a Prayer Request <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform"/>
                      </GlowingButton>
                  </Link>
              </div>
          </div>
      </section>

      {/* Giving Preview */}
      <section className="py-12 md:py-20 relative z-10 bg-gray-50">
          <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-12">
                      <Gift className="text-gold mx-auto mb-6 animate-float" size={64} />
                      <span className="text-gold font-bold tracking-[0.3em] uppercase mb-4 block text-sm">Generosity</span>
                      <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal mb-6">Fuel the Mission</h2>
                      <p className="text-neutral text-lg leading-relaxed max-w-2xl mx-auto mb-8">
                          "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."
                      </p>
                      <p className="text-gold text-sm uppercase tracking-widest font-bold">- 2 Corinthians 9:7</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                      <div className="glass-card rounded-[16px] p-8 bg-white/80 text-center hover-lift animate-fade-in-left delay-200">
                          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-gold transition-colors duration-300">
                              <Heart className="text-gold group-hover:text-charcoal" size={32} />
                          </div>
                          <h3 className="text-2xl font-serif font-bold text-charcoal mb-4">Direct Deposit</h3>
                          <p className="text-neutral mb-6">Give directly through bank transfer. Simple and secure.</p>
                      </div>
                      <div className="glass-card rounded-[16px] p-8 bg-white/80 text-center hover-lift animate-fade-in-right delay-400">
                          <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                              <DollarSign className="text-charcoal" size={32} />
                          </div>
                          <h3 className="text-2xl font-serif font-bold text-charcoal mb-4">Credit Card</h3>
                          <p className="text-neutral mb-6">Secure online giving via Stripe. Set up recurring giving or make a one-time impact.</p>
                      </div>
                  </div>
                  <div className="text-center mt-8">
                      <Link to="/giving">
                          <GlowingButton variant="outline" size="lg" className="group">
                              Learn More About Giving <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform"/>
                          </GlowingButton>
                      </Link>
                  </div>
              </div>
          </div>
      </section>
    </div>
  );
};