import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { ScrollReveal } from '../../components/UI/ScrollReveal';
import { Church, ArrowRight, ArrowDownToLine } from 'lucide-react';

const HOW_WE_LIVE: ReadonlyArray<{ lead: string; rest: string }> = [
  {
    lead: 'We grow as disciples',
    rest: ' through Bible‑centred teaching, caring small groups, and Christ‑centred worship, so people reach their God‑given potential as mature followers of Jesus.',
  },
  {
    lead: 'We build authentic relationships',
    rest: ' that draw others to Christ through our actions and character, demonstrating His love in our homes, workplaces, schools, and neighbourhoods.',
  },
  {
    lead: 'We live empowered by the Holy Spirit',
    rest: ', seeking to be filled, led, and transformed so that our lives become a visible expression of God’s grace and truth.',
  },
  {
    lead: 'We equip and multiply leaders for every generation',
    rest: ', forming servant‑hearted men and women who can teach, shepherd, and disciple others with biblical conviction and Christlike humility.',
  },
  {
    lead: 'We train for mission—locally and globally',
    rest: '—preparing hearts and hands to share the gospel in our district and among the nations God has brought to Ashburton.',
  },
  {
    lead: 'We partner in prayer and mission',
    rest: ', cultivating a culture of prayer for our church, our district, and the global harvest, and encouraging whole‑of‑life stewardship, including business‑as‑mission partnerships that advance the gospel.',
  },
];

export const Vision = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-0 overflow-hidden">
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
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

        <div className="container relative z-10 px-4 mx-auto pt-[224px] md:pt-[256px]">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal direction="up" delay={150}>
              <h1
                className="text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-250"
                style={{ fontFamily: 'Kaushan Script', fontSize: '4.25rem', lineHeight: '1.2' }}
              >
                Our Vision
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-base sm:text-lg md:text-[1.375rem] lg:text-[1.5625rem] leading-relaxed text-white text-center max-w-5xl mx-auto mb-6 transition-all duration-1000 delay-300 px-2 sm:px-0">
                <span className="block font-raleway font-normal text-center">Christ‑centred. Spirit‑empowered.</span>
                <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">Every generation growing in love for God.</span>
                <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">Disciples of Jesus impacting Ashburton and the nations.</span>
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={400}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24">
                <Link to="/" className="group">
                  <GlowingButton
                    variant="outline"
                    size="md"
                    className="!px-6 !py-[14px] !border-gold !bg-gold/20 !text-white hover:!bg-gold hover:!text-white !rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 hover:!border-gold active:scale-95 hover:-translate-y-1 !normal-case"
                  >
                    <span className="text-white font-normal text-base leading-6 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:font-semibold group-hover:tracking-wider">
                      Back to Home
                    </span>
                    <ArrowRight
                      size={18}
                      className="ml-2 text-gold transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:h-5 group-hover:w-5 group-hover:translate-x-1 group-hover:text-white"
                    />
                  </GlowingButton>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 pulse-arrow animate-ping-pong">
          <ArrowDownToLine size={32} className="text-gold" />
        </div>
      </section>

      <section className="section-plain py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <ScrollReveal direction="down" delay={0}>
            <div className="text-center mb-12 md:mb-16">
              <Church className="text-gold mx-auto mb-6" size={64} />
              <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal mb-4">Our Church Vision</h2>
              <p className="text-gold mt-2 text-base font-bold">Ashburton Baptist Church</p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={100}>
            <div className="glass-card rounded-[16px] p-8 md:p-12 bg-white/70 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover-lift mb-10 md:mb-14">
              <h3 className="text-2xl md:text-3xl font-serif font-normal text-charcoal mb-6">Vision</h3>
              <p className="text-neutral leading-relaxed text-lg">
                To be a Christ‑centred, Spirit‑empowered church in Ashburton where every generation grows in their love
                for God, becomes mature, resilient disciples of Jesus, and joins His mission to impact our community and
                the nations.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={150}>
            <div className="glass-card rounded-[16px] p-8 md:p-12 bg-white/70 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover-lift mb-10 md:mb-14">
              <h3 className="text-2xl md:text-3xl font-serif font-normal text-charcoal mb-6">What this looks like</h3>
              <p className="text-neutral leading-relaxed text-lg">
                We are building a legacy church that loves God, loves one another, and makes disciples in a rapidly
                changing, multi‑ethnic Ashburton. We want to move people beyond surface‑level belief into deep
                discipleship, forming followers of Jesus who know His Word, walk in His ways, and reflect His character in
                everyday life.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={200}>
            <div className="glass-card rounded-[16px] p-8 md:p-12 bg-white/70 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover-lift">
              <h3 className="text-2xl md:text-3xl font-serif font-normal text-charcoal mb-8">How we live out this vision</h3>
              <ul className="space-y-6 leading-relaxed text-lg list-none pl-0">
                {HOW_WE_LIVE.map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" aria-hidden />
                    <span>
                      <span className="text-black">{item.lead}</span>
                      <span className="text-neutral">{item.rest}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};
