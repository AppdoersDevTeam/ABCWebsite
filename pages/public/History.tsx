import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { ScrollReveal } from '../../components/UI/ScrollReveal';
import { Calendar, Building, Flame, Heart, BookOpen, ArrowRight, ArrowDownToLine } from 'lucide-react';

export const History = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const timeline = [
    {
      year: '1882',
      title: 'The Beginning',
      icon: <Calendar size={32} />,
      content: 'In 1882, it was recognised within the wider Ashburton Community that there was a call to pursue the possibility of starting a local Baptist Church under the guidance of the wider Canterbury Association. On the 1st Sunday in October 1882, the very first Baptist Church service was held in Templar Hall, conducted by Rev. T. Bray. The Canterbury Association provided regular speakers for the following 3 years, until Mr J W Sawle was appointed as the first-ever Pastor in March of 1886.'
    },
    {
      year: '1885-1887',
      title: 'The First Building',
      icon: <Building size={32} />,
      content: 'In August of 1885, a plot of land was purchased in Peter Street for the sum of £75. Just two years later in April 1887, the Church building was completed and opened its doors to the community. Although the building itself was small, it served its purpose short term and was eventually used as the schoolroom for the Church.'
    },
    {
      year: '1896',
      title: 'The Tabernacle',
      icon: <Building size={32} />,
      content: 'Probably the most exciting development in the life of the Church was with the building of a new, much larger church. The Tabernacle seated 250 people and opened in November 1896. The completion of The Tabernacle was due to the astute efforts of Rev. Albert Agar, the Pastor at the time and also the lead architect for the project. Originally from Australia, Rev Agar had arrived in Ashburton in 1893 and as the dynamic leader of the Church drove not only the promotion of the financing scheme but also the building project to fruition.'
    },
    {
      year: '1925',
      title: 'The Tabernacle Fire',
      icon: <Flame size={32} />,
      content: 'Sadly, on 4th March 1925, the Tabernacle was burnt to the ground. It was a devastating loss and the building held many memories for the older members of the congregation. Many were baptised and married here as well as farewelling many loved ones into God\'s care. Undeterred, church members continued to meet at the Tancred Street Hall.'
    },
    {
      year: '1926',
      title: 'Havelock Street Building',
      icon: <Building size={32} />,
      content: 'In due course, a new church building commenced, on land purchased on the corner of Cass and Havelock Street, where it stands today. The Havelock Street building was opened on 14th August 1926. Built at a cost of £5000 with a £850 mortgage, becoming debt-free in 1933.'
    },
    {
      year: '1985-2011',
      title: 'Growth & Rebuilding',
      icon: <Building size={32} />,
      content: 'In the mid-1980s, the Church was altered and extended to accommodate a growing congregation. Over the following 20 years the Church family continued to grow and areas of the building underwent considerable wear and tear. With the view to build a new Church in a different location, another property was purchased in Alford Forest Road. But after much prayer and consideration, this property was sold and the current site was extended instead. This building is now finished and officially opened on 1st May 2011. Sadly the old church building was irrevocably damaged by an earthquake on 22nd February 2011. After much prayer and consideration, it was decided to demolish the old building and make room to rebuild in the future. In its place we now have a car park, but plans are in place to extend the building.'
    }
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
            <ScrollReveal direction="up" delay={100}>
              <h1 className="text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-200" style={{ fontFamily: 'Inter', fontSize: '2.5rem', lineHeight: '1.2', marginTop: '63px' }}>
                Our Story
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={150}>
              <h1 className="text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-250" style={{ fontFamily: 'Kaushan Script', fontSize: '4.25rem', lineHeight: '1.2' }}>
                History
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-[1.5625rem] leading-6 text-white text-center max-w-5xl mx-auto mb-6 transition-all duration-1000 delay-300">
                <span className="block whitespace-nowrap font-raleway font-normal text-center">Established 1882</span>
                <span className="block whitespace-nowrap mt-[12px] font-raleway font-normal text-center">Over 140 years of faithful service to our community</span>
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={400}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24">
                <Link to="/about" className="group">
                  <GlowingButton variant="outline" size="md" className="!px-6 !py-[14px] !border-gold !bg-gold/20 !text-white hover:!bg-gold hover:!text-white !rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 hover:!border-gold active:scale-95 hover:-translate-y-1 !normal-case">
                    <span className="text-white font-normal text-base leading-6 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:font-semibold group-hover:tracking-wider">Back to About</span>
                    <ArrowRight size={18} className="ml-2 text-gold transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:h-5 group-hover:w-5 group-hover:translate-x-1 group-hover:text-white" />
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
      
      <section className="section-gradient-soft py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-5xl">
        {/* Header Section */}
        <ScrollReveal direction="down" delay={0}>
          <div className="text-center mb-16">
            <BookOpen className="text-gold mx-auto mb-6" size={64} />
            <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal mb-4">Ashburton Baptist Church</h2>
            <p className="text-gold mt-2 text-base font-bold">Est. 1882</p>
            <p className="text-lg text-neutral max-w-3xl mx-auto leading-relaxed mt-4">
              Over 140 years of faithful service to our community, built on the foundation of Jesus Christ.
            </p>
          </div>
        </ScrollReveal>

        {/* Timeline */}
        <div className="space-y-12">
          {timeline.map((item, i) => (
            <ScrollReveal key={i} direction="up" delay={i * 100}>
              <div className="relative hover-lift">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="md:w-32 flex-shrink-0">
                    <div className="flex items-center gap-4 md:flex-col md:items-start">
                      <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center text-white group-hover:bg-gold group-hover:text-white transition-all duration-300">
                        {item.icon}
                      </div>
                      <div className="md:mt-4">
                        <span className="text-2xl md:text-3xl font-serif font-normal text-charcoal block">{item.year}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="glass-card rounded-[16px] p-8 md:p-10 bg-white/70 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <h3 className="text-2xl md:text-3xl font-serif font-normal text-charcoal mb-4">{item.title}</h3>
                      <p className="text-neutral leading-relaxed text-lg">{item.content}</p>
                    </div>
                  </div>
                </div>
                {i < timeline.length - 1 && (
                  <div className="hidden md:block absolute left-8 top-24 w-0.5 h-12 bg-gold/30"></div>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Gratitude Section */}
        <ScrollReveal direction="up" delay={600}>
          <div className="mt-20 md:mt-32">
            <div className="glass-card rounded-[16px] p-8 md:p-12 text-center bg-white/70 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover-lift">
              <Heart className="text-gold mx-auto mb-6" size={48} />
              <h3 className="text-3xl md:text-4xl font-serif font-normal text-charcoal mb-8">Gratitude and Thanks</h3>
              <div className="space-y-6 text-neutral leading-relaxed text-lg max-w-4xl mx-auto">
                <p>
                  We want to acknowledge the large number of church members from the past who have poured their lives into our Church to bring glory to God's name during their time here. Their commitment and dedication in seeking and pursuing God's will for this Church, ensures that their work will continue to thrive.
                </p>
                <p>
                  The Church has always been a family with many unofficial church "Grandparents" in our congregation. These are those wonderful people that show abundant love and support to the children within the Church family. We are so proud in knowing that genuine love and compassion have always been a hallmark of this Church.
                </p>
                <p>
                  We are grateful for the faithful prayers of so many of God's people in our Church. All of those faithful members from past generations who diligently prayed with vision for the future of our Church, through to the faithfulness of the prayer warriors of today.
                </p>
                <p className="text-charcoal font-bold text-xl mt-8">
                  We have, by the grace of God, built a building, but God reminds us that we are the living stones of His temple. Built on the everlasting foundation stone, Jesus Christ. Let us live our lives as his Chosen, proclaiming His wonderful acts to the community around us.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
        </div>
      </section>
    </div>
  );
};


