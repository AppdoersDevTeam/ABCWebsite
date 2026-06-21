import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScrollText } from 'lucide-react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { ScrollReveal } from '../../components/UI/ScrollReveal';
import { StyledSelect } from '../../components/UI/StyledSelect';
import {
  STATEMENT_OF_FAITH_ARTICLES,
  STATEMENT_OF_FAITH_INTRO,
  type FaithArticle,
  type FaithSubsection,
} from '../../lib/statementOfFaith';
import { parseScriptureReferences } from '../../lib/parseScriptureReferences';

/** Body copy — use text-neutral + a single size class; never mix sm:text-base/md:text-lg (breaks text-neutral in Tailwind CDN). */
const BODY_TEXT = 'text-neutral leading-relaxed text-base break-words [overflow-wrap:anywhere]';

const ScriptureBlock = ({ text }: { text: string }) => {
  const [open, setOpen] = useState(false);
  const references = useMemo(() => parseScriptureReferences(text), [text]);

  return (
    <div className="mt-4 sm:mt-5 overflow-hidden rounded-[12px] border border-gray-200 bg-gray-50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full min-h-[44px] items-center justify-between gap-3 px-3 py-3 text-left sm:px-4 md:px-5 bg-white hover:bg-gray-50 transition-colors"
        aria-expanded={open}
      >
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-charcoal">
          Scripture References
          <span className="normal-case tracking-normal font-semibold text-neutral ml-2">({references.length})</span>
        </span>
        <span className="text-charcoal text-lg font-bold shrink-0 leading-none" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div className="border-t border-gray-200 px-3 pb-3 pt-3 sm:px-4 sm:pb-4 md:px-5 md:pb-5 bg-gray-50">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {references.map((ref, i) => (
              <li
                key={`${ref}-${i}`}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm leading-snug text-charcoal"
              >
                {ref}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const SubsectionBlock = ({ subsection, index }: { subsection: FaithSubsection; index: number }) => (
  <div
    className={`${
      index > 0 ? 'mt-5 sm:mt-7 border-t border-gray-200 pt-5 sm:pt-7' : 'mt-5 sm:mt-6'
    } rounded-[10px] sm:rounded-[12px] border-l-4 border-gold bg-gray-50 pl-4 pr-3 py-3 sm:pl-5 sm:pr-4 md:pl-6`}
  >
    {(subsection.label || subsection.title) && (
      <h4 className="font-serif text-base sm:text-lg font-normal text-charcoal mb-2 sm:mb-3 leading-snug break-words">
        {subsection.label && <span className="text-gold font-bold mr-1.5 sm:mr-2">{subsection.label}</span>}
        {subsection.title}
      </h4>
    )}
    {subsection.paragraphs.map((para, i) => (
      <p key={i} className={`${BODY_TEXT} mb-3 sm:mb-4 last:mb-0`}>
        {para}
      </p>
    ))}
    {subsection.scriptures.map((ref, i) => (
      <ScriptureBlock key={i} text={ref} />
    ))}
  </div>
);

const ArticleContent = ({ article }: { article: FaithArticle }) => (
  <div>
    <div className="mb-6 sm:mb-8 border-b border-gray-200 pb-5 sm:pb-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold mb-2">
        Article {article.number} of {STATEMENT_OF_FAITH_ARTICLES.length}
      </p>
      <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-charcoal leading-tight break-words">
        {article.title}
      </h2>
    </div>

    <div className="space-y-4">
      {article.paragraphs.map((para, i) => (
        <p key={i} className={BODY_TEXT}>
          {para}
        </p>
      ))}
    </div>

    {article.subsections.map((sub, i) => (
      <SubsectionBlock key={i} subsection={sub} index={i} />
    ))}

    {article.scriptures.map((ref, i) => (
      <ScriptureBlock key={i} text={ref} />
    ))}
  </div>
);

const ArticleNavButtons = ({
  currentIndex,
  onPrev,
  onNext,
  compact = false,
}: {
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  compact?: boolean;
}) => {
  const prevTitle = currentIndex > 0 ? STATEMENT_OF_FAITH_ARTICLES[currentIndex - 1].title : '';
  const nextTitle =
    currentIndex < STATEMENT_OF_FAITH_ARTICLES.length - 1
      ? STATEMENT_OF_FAITH_ARTICLES[currentIndex + 1].title
      : '';

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
      <button
        type="button"
        onClick={onPrev}
        disabled={currentIndex <= 0}
        className="min-h-[44px] flex-1 rounded-full border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-charcoal hover:border-gold hover:text-gold disabled:border-gray-200 disabled:text-neutral/50 disabled:hover:text-neutral/50 disabled:hover:border-gray-200 transition-colors text-center"
      >
        {compact || !prevTitle ? 'Previous' : `Previous: ${prevTitle}`}
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={currentIndex >= STATEMENT_OF_FAITH_ARTICLES.length - 1}
        className="min-h-[44px] flex-1 rounded-full bg-gold px-4 py-2.5 text-sm font-bold text-charcoal hover:bg-yellow-400 disabled:bg-gray-200 disabled:text-neutral/50 transition-colors text-center"
      >
        {compact || !nextTitle ? 'Next' : `Next: ${nextTitle}`}
      </button>
    </div>
  );
};

export const StatementOfFaith = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeArticle, setActiveArticle] = useState(1);
  const [query, setQuery] = useState('');

  const filteredArticles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STATEMENT_OF_FAITH_ARTICLES;
    return STATEMENT_OF_FAITH_ARTICLES.filter(
      (a) => a.title.toLowerCase().includes(q) || String(a.number).includes(q)
    );
  }, [query]);

  const current = STATEMENT_OF_FAITH_ARTICLES.find((a) => a.number === activeArticle) ?? STATEMENT_OF_FAITH_ARTICLES[0];
  const currentIndex = STATEMENT_OF_FAITH_ARTICLES.findIndex((a) => a.number === activeArticle);

  const goToArticle = (num: number) => {
    setActiveArticle(num);
    window.requestAnimationFrame(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const goPrev = () => {
    if (currentIndex > 0) goToArticle(STATEMENT_OF_FAITH_ARTICLES[currentIndex - 1].number);
  };

  const goNext = () => {
    if (currentIndex < STATEMENT_OF_FAITH_ARTICLES.length - 1) {
      goToArticle(STATEMENT_OF_FAITH_ARTICLES[currentIndex + 1].number);
    }
  };

  const articleSelectOptions = useMemo(
    () =>
      STATEMENT_OF_FAITH_ARTICLES.map((a) => ({
        value: String(a.number),
        label: `${a.number}. ${a.title}`,
      })),
    []
  );

  const articleSelect = (
    <StyledSelect
      id="belief-article-select"
      label="Select an article"
      value={String(activeArticle)}
      options={articleSelectOptions}
      onChange={(value) => goToArticle(Number(value))}
      icon={<ScrollText size={20} aria-hidden="true" />}
      wrapLabels
    />
  );

  const searchInput = (
    <input
      type="search"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search topics…"
      className="input-sun w-full min-h-[44px] rounded-xl px-4 py-2.5 text-sm text-charcoal placeholder:text-neutral/70"
    />
  );

  return (
    <div className="space-y-0 overflow-x-hidden">
      <section className="relative min-h-[45vh] sm:min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/beliefs-hero.jpeg"
            alt="Ashburton Baptist Church congregation"
            className="w-full h-full object-cover brightness-110 saturate-125 contrast-105"
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 bg-gray-700/45" />
        </div>

        <div className="container relative z-10 px-4 sm:px-6 mx-auto pt-28 sm:pt-32 md:pt-36 pb-10 sm:pb-12">
          <div className="max-w-3xl mx-auto text-center">
            <ScrollReveal direction="up" delay={100}>
              <h1
                className="text-white mb-3 px-2"
                style={{ fontFamily: 'Kaushan Script', fontSize: 'clamp(2.25rem, 7vw, 4.25rem)', lineHeight: 1.15 }}
              >
                What We Believe
              </h1>
              <p className="text-white text-base font-raleway leading-relaxed max-w-2xl mx-auto px-1">
                Explore our full Statement of Faith
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="section-plain py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <ScrollReveal direction="down" delay={0}>
            <div className="max-w-3xl mx-auto text-center mb-8 md:mb-10">
              <p className="text-neutral leading-relaxed text-base px-1 break-words">
                {STATEMENT_OF_FAITH_INTRO.adopted}
              </p>
            </div>
          </ScrollReveal>

          {/* Mobile & tablet — sticky controls */}
          <div className="lg:hidden sticky top-[4.5rem] sm:top-20 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-4 sm:mb-6">
            <div className="glass-card rounded-[16px] p-3 sm:p-4 bg-white/90 border border-white/50 shadow-md space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Jump to article</p>
                <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-0.5 text-xs tabular-nums font-bold text-gold">
                  {activeArticle} / {STATEMENT_OF_FAITH_ARTICLES.length}
                </span>
              </div>
              {articleSelect}
              <div className="hidden sm:block">{searchInput}</div>
              <ArticleNavButtons currentIndex={currentIndex} onPrev={goPrev} onNext={goNext} compact />
            </div>
          </div>

          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-5 sm:gap-6 lg:gap-8">
            <aside className="hidden lg:block lg:w-[280px] xl:w-[300px] shrink-0 self-start">
              <div className="space-y-4">
                <div className="glass-card rounded-[16px] p-4 bg-white/70 border border-white/50 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold mb-3 px-1">
                    Browse Articles
                  </p>
                  {searchInput}
                  <ol className="space-y-0.5 mt-3">
                    {filteredArticles.map((article) => {
                      const isActive = activeArticle === article.number;
                      return (
                        <li key={article.number}>
                          <button
                            type="button"
                            onClick={() => goToArticle(article.number)}
                            className={`w-full min-h-[40px] flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-all duration-200 ${
                              isActive
                                ? 'bg-gold/15 border border-gold text-charcoal font-semibold shadow-sm'
                                : 'text-neutral hover:bg-gold/10 hover:text-charcoal border border-transparent'
                            }`}
                          >
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                                isActive ? 'bg-gold text-charcoal' : 'bg-gold/20 text-charcoal'
                              }`}
                            >
                              {article.number}
                            </span>
                            <span className="leading-snug break-words">{article.title}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                  {filteredArticles.length === 0 && (
                    <p className="text-sm text-neutral px-2 py-4 text-center">No articles match your search.</p>
                  )}
                </div>

                <Link to="/about" className="block">
                  <GlowingButton variant="outline" fullWidth className="!rounded-full !normal-case !font-medium">
                    Back to About
                  </GlowingButton>
                </Link>
              </div>
            </aside>

            <div ref={contentRef} className="flex-1 min-w-0 scroll-mt-[7.5rem] sm:scroll-mt-28 lg:scroll-mt-24">
              <div className="glass-card rounded-[16px] sm:rounded-[20px] p-5 sm:p-7 md:p-10 lg:p-12 bg-white/70 border border-white/50 shadow-sm hover-lift">
                <ArticleContent key={current.number} article={current} />

                <div className="lg:hidden mt-8 pt-6 border-t border-gray-200">
                  <p className="text-center text-xs text-neutral mb-3 uppercase tracking-widest font-bold">
                    Jump to article
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {STATEMENT_OF_FAITH_ARTICLES.map((a) => (
                      <button
                        key={a.number}
                        type="button"
                        onClick={() => goToArticle(a.number)}
                        className={`min-h-[40px] min-w-[40px] rounded-full text-sm font-bold transition-colors ${
                          a.number === activeArticle
                            ? 'bg-gold text-charcoal shadow-md'
                            : 'bg-white text-charcoal border border-gray-200 hover:bg-gold/20 hover:border-gold'
                        }`}
                        aria-label={`Article ${a.number}: ${a.title}`}
                        aria-current={a.number === activeArticle ? 'true' : undefined}
                      >
                        {a.number}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-200 space-y-4">
                  <div className="lg:hidden">
                    <ArticleNavButtons currentIndex={currentIndex} onPrev={goPrev} onNext={goNext} compact />
                  </div>

                  <div className="hidden lg:flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={goPrev}
                      disabled={currentIndex <= 0}
                      className="min-h-[44px] rounded-full border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-charcoal hover:border-gold hover:text-gold disabled:border-gray-200 disabled:text-neutral/50 disabled:hover:text-neutral/50 disabled:hover:border-gray-200 transition-colors text-left xl:max-w-[40%]"
                    >
                      {currentIndex > 0
                        ? `Previous: ${STATEMENT_OF_FAITH_ARTICLES[currentIndex - 1].title}`
                        : 'Previous'}
                    </button>

                    <div className="hidden xl:flex items-center gap-1.5 px-2 shrink-0">
                      {STATEMENT_OF_FAITH_ARTICLES.map((a) => (
                        <button
                          key={a.number}
                          type="button"
                          onClick={() => goToArticle(a.number)}
                          title={a.title}
                          className={`h-2.5 rounded-full transition-all duration-200 ${
                            a.number === activeArticle ? 'w-6 bg-gold' : 'w-2.5 bg-gray-300 hover:bg-gold/60'
                          }`}
                          aria-label={`Go to article ${a.number}: ${a.title}`}
                          aria-current={a.number === activeArticle ? 'true' : undefined}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={goNext}
                      disabled={currentIndex >= STATEMENT_OF_FAITH_ARTICLES.length - 1}
                      className="min-h-[44px] rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-charcoal hover:bg-yellow-400 disabled:bg-gray-200 disabled:text-neutral/50 transition-colors text-right xl:max-w-[40%] xl:ml-auto"
                    >
                      {currentIndex < STATEMENT_OF_FAITH_ARTICLES.length - 1
                        ? `Next: ${STATEMENT_OF_FAITH_ARTICLES[currentIndex + 1].title}`
                        : 'Next'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 flex flex-col items-center gap-3">
                <Link to="/about" className="lg:hidden">
                  <GlowingButton variant="outline" className="!rounded-full !normal-case !font-medium">
                    Back to About
                  </GlowingButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
