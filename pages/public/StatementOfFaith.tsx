import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { ScrollReveal } from '../../components/UI/ScrollReveal';
import {
  STATEMENT_OF_FAITH_ARTICLES,
  STATEMENT_OF_FAITH_INTRO,
  type FaithArticle,
  type FaithSubsection,
} from '../../lib/statementOfFaith';
import { ArrowRight, ArrowDownToLine, ScrollText } from 'lucide-react';

const ScriptureBlock = ({ text }: { text: string }) => (
  <div className="mt-4 rounded-[10px] border border-gold/20 bg-gold/5 px-4 py-3 md:px-5 md:py-4">
    <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-2">Scripture</p>
    <p className="text-sm leading-relaxed text-neutral/90 font-serif italic">{text}</p>
  </div>
);

const SubsectionBlock = ({ subsection, index }: { subsection: FaithSubsection; index: number }) => (
  <div className={index > 0 ? 'mt-8 border-t border-charcoal/8 pt-8' : 'mt-6'}>
    {(subsection.label || subsection.title) && (
      <h4 className="font-serif text-xl text-charcoal mb-3">
        {subsection.label && (
          <span className="text-gold font-bold mr-2">{subsection.label}</span>
        )}
        {subsection.title}
      </h4>
    )}
    {subsection.paragraphs.map((para, i) => (
      <p key={i} className="text-neutral leading-relaxed text-base md:text-lg mb-4 last:mb-0">
        {para}
      </p>
    ))}
    {subsection.scriptures.map((ref, i) => (
      <ScriptureBlock key={i} text={ref} />
    ))}
  </div>
);

const ArticleCard = ({ article, index }: { article: FaithArticle; index: number }) => (
  <ScrollReveal direction="up" delay={Math.min(index * 30, 300)}>
    <article
      id={`article-${article.number}`}
      className="scroll-mt-28 glass-card rounded-[16px] p-6 md:p-10 bg-white/70 border border-white/50 shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-start gap-4 md:gap-6 mb-6">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold font-serif text-xl border border-gold/30"
          aria-hidden
        >
          {article.number}
        </span>
        <h3 className="font-serif text-2xl md:text-3xl font-normal text-charcoal pt-1.5">
          {article.title}
        </h3>
      </div>

      {article.paragraphs.map((para, i) => (
        <p key={i} className="text-neutral leading-relaxed text-base md:text-lg mb-4 last:mb-0">
          {para}
        </p>
      ))}

      {article.subsections.map((sub, i) => (
        <SubsectionBlock key={i} subsection={sub} index={i} />
      ))}

      {article.scriptures.map((ref, i) => (
        <ScriptureBlock key={i} text={ref} />
      ))}
    </article>
  </ScrollReveal>
);

export const StatementOfFaith = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [activeArticle, setActiveArticle] = useState<number>(1);

  useEffect(() => {
    const ids = STATEMENT_OF_FAITH_ARTICLES.map((a) => `article-${a.number}`);
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          const num = parseInt(visible[0].target.id.replace('article-', ''), 10);
          if (!Number.isNaN(num)) setActiveArticle(num);
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.5] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToArticle = (articleNumber: number) => {
    setActiveArticle(articleNumber);
    document.getElementById(`article-${articleNumber}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="space-y-0 overflow-hidden">
      <section
        ref={heroRef}
        className="relative min-h-[70vh] md:min-h-screen flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <img
            src="/ABC background01.png"
            alt="Ashburton Baptist Church"
            className="w-full h-full object-cover brightness-110 saturate-125 contrast-105"
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 bg-gray-700/45" />
        </div>

        <div className="container relative z-10 px-4 mx-auto pt-[224px] md:pt-[256px] pb-24">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal direction="up" delay={150}>
              <h1
                className="text-white text-center max-w-5xl mx-auto mb-4"
                style={{ fontFamily: 'Kaushan Script', fontSize: '4.25rem', lineHeight: '1.2' }}
              >
                What We Believe
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-base sm:text-lg md:text-[1.375rem] leading-relaxed text-white text-center max-w-3xl mx-auto mb-2 font-raleway">
                {STATEMENT_OF_FAITH_INTRO.title}
              </p>
              <p className="text-gold text-sm font-bold tracking-[0.2em] uppercase">
                {STATEMENT_OF_FAITH_INTRO.churchName}
              </p>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={350}>
              <div className="flex justify-center mt-8">
                <Link to="/about" className="group">
                  <GlowingButton
                    variant="outline"
                    size="md"
                    className="!px-6 !py-[14px] !border-gold !bg-gold/20 !text-white hover:!bg-gold hover:!text-white !rounded-full !normal-case"
                  >
                    <span className="text-white font-normal text-base">Back to About</span>
                    <ArrowRight size={18} className="ml-2 text-gold group-hover:translate-x-1 transition-transform" />
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
        <div className="container mx-auto px-4">
          <ScrollReveal direction="down" delay={0}>
            <div className="max-w-3xl mx-auto text-center mb-10 md:mb-14">
              <ScrollText className="text-gold mx-auto mb-5" size={56} />
              <p className="text-neutral leading-relaxed text-lg">{STATEMENT_OF_FAITH_INTRO.adopted}</p>
              <p className="text-xs uppercase tracking-widest text-gold/80 mt-3 font-bold">
                {STATEMENT_OF_FAITH_INTRO.draftLabel}
              </p>
            </div>
          </ScrollReveal>

          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12">
            <aside className="lg:w-64 xl:w-72 shrink-0">
              <nav
                className="lg:sticky lg:top-28 glass-card rounded-[16px] p-4 md:p-5 border border-white/50 bg-white/80 shadow-sm max-h-[70vh] overflow-y-auto"
                aria-label="Articles of faith"
              >
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold mb-4 px-2">
                  Articles
                </p>
                <ol className="space-y-1">
                  {STATEMENT_OF_FAITH_ARTICLES.map((article) => (
                    <li key={article.number}>
                      <button
                        type="button"
                        onClick={() => scrollToArticle(article.number)}
                        className={`w-full text-left block rounded-lg px-3 py-2 text-sm leading-snug transition-colors duration-200 ${
                          activeArticle === article.number
                            ? 'bg-gold/15 text-charcoal font-semibold border-l-2 border-gold'
                            : 'text-neutral hover:bg-gold/8 hover:text-charcoal border-l-2 border-transparent'
                        }`}
                      >
                        <span className="text-gold font-bold mr-1.5">{article.number}.</span>
                        {article.title}
                      </button>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>

            <div className="flex-1 min-w-0 space-y-8 md:space-y-10">
              {STATEMENT_OF_FAITH_ARTICLES.map((article, i) => (
                <ArticleCard key={article.number} article={article} index={i} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
