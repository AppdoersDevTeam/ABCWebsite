import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Instagram, Facebook, Youtube, ChevronDown, LogIn } from 'lucide-react';
import { GlowingButton } from '../UI/GlowingButton';
import { useAuth } from '../../context/AuthContext';
import { ScrollToTop } from '../ScrollToTop';
import { useAutoSectionReveal } from '../UI/useAutoSectionReveal';
import { usePageMeta } from '../../lib/usePageMeta';
import { getRouteMeta, ROUTE_META } from '../../lib/seoConfig';
import { EVENTS_LABEL } from '../../lib/constants';
import { MINISTRIES, MINISTRIES_LABEL, MINISTRY_MENU_ITEMS } from '../../lib/ministries';
import { AppDialogHost } from '../UI/AppDialogHost';
import { useFocusTrap } from '../UI/useFocusTrap';

export const PublicLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(null);
  const [openFooterSection, setOpenFooterSection] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, refreshUserProfile } = useAuth();
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoginPage = location.pathname === '/login';
  /** Individual leader biography URLs (not the About page leadership section). */
  const isLeadershipBioPage = /^\/about\/leadership\/.+/.test(location.pathname);
  useAutoSectionReveal();

  // Per-route SEO title/description. Dynamic detail pages (event detail, leader
  // bio) manage their own meta from fetched data, so the layout defers (null).
  const isEventDetailPage =
    location.pathname.startsWith('/events/') && !(location.pathname in ROUTE_META);
  const managesOwnMeta = isLeadershipBioPage || isEventDetailPage;
  usePageMeta(managesOwnMeta ? null : getRouteMeta(location.pathname));

  useEffect(() => {
    setIsMenuOpen(false);
    setOpenMobileSubmenu(null);
  }, [location.pathname]);

  useFocusTrap(isMenuOpen, mobileNavRef, () => setIsMenuOpen(false));

  // Refresh user profile when component mounts if user is logged in
  // This ensures we have the latest approval status for the header button
  useEffect(() => {
    if (user) {
      console.log('PublicLayout - User found, refreshing profile to ensure latest approval status');
      // Only refresh once when component mounts
      refreshUserProfile().catch((error) => {
        console.error('PublicLayout - Error refreshing profile:', error);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown) {
        const dropdown = dropdownRefs.current[openDropdown];
        if (dropdown && !dropdown.contains(event.target as Node)) {
          if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current);
          }
          setOpenDropdown(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, [openDropdown]);

  // Scroll to in-page sections (e.g. #leadership). HashRouter URLs look like #/about#leadership — not a valid single CSS selector.
  useEffect(() => {
    const scrollToSection = () => {
      const routeHash = window.location.hash || '';
      if (
        routeHash.includes('access_token') ||
        routeHash.includes('error=') ||
        routeHash.includes('expires_at')
      ) {
        return;
      }

      let sectionId = (location.hash || '').replace(/^#/, '').trim();

      if (!sectionId && routeHash.includes('#', 1)) {
        const second = routeHash.indexOf('#', 1);
        sectionId = routeHash.slice(second + 1).split('&')[0]?.trim() || '';
      }

      if (!sectionId || !/^[a-zA-Z0-9_-]+$/.test(sectionId)) {
        return;
      }

      const tryScroll = (): boolean => {
        try {
          const el = document.getElementById(sectionId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return true;
          }
        } catch {
          console.warn('Invalid section id:', sectionId);
        }
        return false;
      };

      // About sections mount inside the route; retry so scroll runs after paint.
      [0, 80, 200, 450, 800].forEach((ms) => {
        window.setTimeout(() => tryScroll(), ms);
      });
    };

    scrollToSection();
    window.addEventListener('hashchange', scrollToSection);
    return () => window.removeEventListener('hashchange', scrollToSection);
  }, [location.pathname, location.hash]);

  const handleSubmenuClick = (path: string, hash?: string) => {
    setOpenDropdown(null);
    setIsMenuOpen(false);
    
    const [basePath, hashPart] = path.split('#');
    
    // Navigate to the page
    navigate(path);
    
    // Scroll to the hash element after navigation
    if (hashPart && hashPart.length > 0) {
      setTimeout(() => {
        try {
          const element = document.querySelector(`#${hashPart}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } catch (e) {
          // Invalid selector, ignore
          console.warn('Invalid hash selector:', hashPart);
        }
      }, 300);
    }
  };

  const navItems = [
    { 
      label: 'Home', 
      path: '/',
      submenu: []
    },
    { 
      label: 'About', 
      path: '/about',
      submenu: [
        { label: 'Our Vision', path: '/about/vision', hash: '' },
        { label: 'What We Believe', path: '/about/beliefs', hash: '' },
        { label: 'Leadership', path: '/about#leadership', hash: 'leadership' },
        { label: 'History', path: '/about/history', hash: '' },
      ]
    },
    { 
      label: 'Sermons', 
      path: '/events/sermons',
      submenu: []
    },
    {
      label: EVENTS_LABEL,
      path: '/events',
      submenu: []
    },
    { 
      label: MINISTRIES_LABEL, 
      path: '/ministries',
      submenu: MINISTRY_MENU_ITEMS,
    },
    { 
      label: "I'm New", 
      path: '/im-new',
      submenu: [
        { label: 'Welcome', path: '/im-new#welcome', hash: 'welcome' },
        { label: 'Welcome Pack', path: '/im-new#welcome-pack', hash: 'welcome-pack' },
        { label: 'FAQ', path: '/im-new#faq', hash: 'faq' },
      ]
    },
    { 
      label: 'Prayer', 
      path: '/need-prayer',
      submenu: []
    },
    { 
      label: 'Giving', 
      path: '/giving',
      submenu: [
        { label: 'Direct Deposit', path: '/giving#direct-deposit', hash: 'direct-deposit' },
        { label: 'Credit Card', path: '/giving#credit-card', hash: 'credit-card' },
      ]
    },
    { 
      label: 'Contact', 
      path: '/contact',
      submenu: []
    },
  ];

  return (
    <div className="min-h-screen flex min-w-0 flex-col bg-transparent text-charcoal font-sans relative selection:bg-gold selection:text-charcoal">
      <ScrollToTop />
      
      {/* Header */}
      <header className={`fixed w-full z-50 min-w-0 transition-all duration-300 pt-[max(1rem,env(safe-area-inset-top))] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] ${isLoginPage || scrolled ? 'bg-white backdrop-blur-md shadow-sm pb-4' : 'bg-transparent pb-6'}`}>
        <div className="page-container">
          <div className="flex min-w-0 items-center gap-4 md:gap-6">
            {/* Logo — left of the header menu */}
            <Link to="/" className="flex shrink-0 items-center group">
              <img 
                src="/ABC Logo.png" 
                alt="Ashburton Baptist Church" 
                className="h-16 md:h-20 transition-opacity duration-300 group-hover:opacity-80"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden min-w-0 flex-1 xl:flex items-center justify-end gap-x-4 2xl:gap-x-8">
              {navItems.map((item) => (
                <div
                  key={item.path}
                  className="relative shrink-0"
                  ref={(el) => (dropdownRefs.current[item.path] = el)}
                  onMouseEnter={() => {
                    if (dropdownTimeoutRef.current) {
                      clearTimeout(dropdownTimeoutRef.current);
                      dropdownTimeoutRef.current = null;
                    }
                    if (item.submenu && item.submenu.length > 0) {
                      setOpenDropdown(item.path);
                    }
                  }}
                  onMouseLeave={() => {
                    dropdownTimeoutRef.current = setTimeout(() => {
                      setOpenDropdown(null);
                    }, 150);
                  }}
                >
                  {item.external ? (
                    <a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`whitespace-nowrap text-base font-sans font-bold transition-all duration-300 relative group flex items-center gap-1 ${
                        isLoginPage || scrolled
                          ? 'text-[#738242] hover:text-[#738242]'
                          : 'text-white hover:text-white'
                      }`}
                      style={isLoginPage || scrolled ? { color: '#738242' } : undefined}
                    >
                      {item.label}
                      <span className={`absolute -bottom-2 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full bg-gold`}></span>
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      className={`whitespace-nowrap text-base font-sans font-bold transition-all duration-300 relative group flex items-center gap-1 ${
                        isLoginPage || scrolled
                          ? 'text-[#738242] hover:text-[#738242]'
                          : 'text-white hover:text-white'
                      }`}
                      style={isLoginPage || scrolled ? { color: '#738242' } : undefined}
                    >
                      {item.label}
                      {item.submenu && item.submenu.length > 0 && (
                        <ChevronDown
                          size={14}
                          className={`${isLoginPage || scrolled ? 'text-[#738242]' : 'text-white'} transition-transform duration-300 ${openDropdown === item.path ? 'rotate-180' : ''}`}
                          style={isLoginPage || scrolled ? { color: '#738242' } : undefined}
                        />
                      )}
                      <span className={`absolute -bottom-2 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full bg-gold ${location.pathname === item.path ? 'w-full' : ''}`}></span>
                    </Link>
                  )}
                  
                  {/* Dropdown Submenu */}
                  {item.submenu && item.submenu.length > 0 && openDropdown === item.path && (
                    <div 
                      className="absolute top-full left-0 pt-2 w-56 animate-fade-in-up"
                      onMouseEnter={() => {
                        if (dropdownTimeoutRef.current) {
                          clearTimeout(dropdownTimeoutRef.current);
                          dropdownTimeoutRef.current = null;
                        }
                        setOpenDropdown(item.path);
                      }}
                      onMouseLeave={() => {
                        dropdownTimeoutRef.current = setTimeout(() => {
                          setOpenDropdown(null);
                        }, 150);
                      }}
                    >
                      <div className="bg-white rounded-[8px] shadow-xl border border-gray-100 py-2">
                        {item.submenu.map((subItem) => (
                          <a
                            key={subItem.path}
                            href={subItem.path}
                            onClick={(e) => {
                              e.preventDefault();
                              handleSubmenuClick(subItem.path, subItem.hash);
                            }}
                            className={`block px-6 py-3 text-sm transition-colors font-bold cursor-pointer ${
                              isLoginPage || scrolled
                                ? 'text-[#738242] hover:bg-[#fdefb4] hover:text-[#738242]'
                                : 'text-charcoal hover:bg-gold/10 hover:text-gold'
                            }`}
                          >
                            {subItem.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div className={`pl-6 border-l ${scrolled ? 'border-gray-200' : 'border-gray-200'}`}>
                 {isAuthenticated ? (
                   <Link to="/dashboard">
                     <GlowingButton size="sm" variant="gold">Dashboard</GlowingButton>
                   </Link>
                 ) : (
                   <Link 
                     to="/login"
                     className="bg-gold inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-[10px] px-4 py-2.5 font-sans text-sm font-normal hover:bg-[#A8B774] transform hover:scale-105 transition-all duration-300 lg:px-[17px] lg:py-[12px] lg:text-sm xl:px-[25px] xl:text-base"
                   >
                     <LogIn size={18} className="mr-2 text-white" />
                     <span className="shine-text relative z-10 font-sans font-normal normal-case">Log in</span>
                   </Link>
                 )}
              </div>
            </nav>

            <button
              type="button"
              className={`ml-auto xl:hidden inline-flex min-h-[44px] min-w-[44px] items-center justify-center p-2 transition-colors ${
                isLoginPage || scrolled
                  ? 'text-[#738242] hover:text-gold'
                  : 'text-white hover:text-gold'
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="public-mobile-nav"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div
            id="public-mobile-nav"
            ref={mobileNavRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="xl:hidden bg-white fixed inset-0 z-40 flex min-h-[100vh] min-h-[100dvh] flex-col justify-center space-y-6 overflow-y-auto pt-[max(5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] pl-[max(2rem,env(safe-area-inset-left))] pr-[max(2rem,env(safe-area-inset-right))]"
          >
             <button type="button" className="absolute top-[max(2rem,env(safe-area-inset-top))] right-[max(2rem,env(safe-area-inset-right))] inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-charcoal" onClick={() => setIsMenuOpen(false)} aria-label="Close menu"><X size={32}/></button>
            {navItems.map((item) => (
              <div key={item.path} className="space-y-2">
                {item.submenu && item.submenu.length > 0 ? (
                  <>
                    <div 
                      className={`flex min-h-[44px] items-center justify-between text-[22px] sm:text-[24px] md:text-[26px] font-serif font-normal transition-all duration-300 cursor-pointer ${
                        scrolled ? 'text-[#738242] hover:text-[#738242]' : 'text-[#A8B774] hover:text-gold'
                      }`}
                      onClick={() => setOpenMobileSubmenu(openMobileSubmenu === item.path ? null : item.path)}
                    >
                      {item.external ? (
                        <a
                          href={item.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(false);
                          }}
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          to={item.path}
                          onClick={(e) => {
                            if (item.submenu && item.submenu.length > 0) {
                              e.preventDefault();
                              setOpenMobileSubmenu(openMobileSubmenu === item.path ? null : item.path);
                            } else {
                              setIsMenuOpen(false);
                            }
                          }}
                        >
                          {item.label}
                        </Link>
                      )}
                      <ChevronDown 
                        size={24} 
                        className={`transition-transform duration-300 ${openMobileSubmenu === item.path ? 'rotate-180' : ''} ${
                          scrolled ? 'text-[#738242]' : 'text-[#A8B774]'
                        }`} 
                      />
                    </div>
                    {openMobileSubmenu === item.path && (
                      <div className="pl-6 space-y-3 animate-fade-in-up">
                        {item.submenu.map((subItem) => (
                          <a
                            key={subItem.path}
                            href={subItem.path}
                            onClick={(e) => {
                              e.preventDefault();
                              setIsMenuOpen(false);
                              setOpenMobileSubmenu(null);
                              handleSubmenuClick(subItem.path, subItem.hash);
                            }}
                            className={`block text-[18px] sm:text-[20px] md:text-[22px] font-serif transition-colors cursor-pointer ${
                              scrolled ? 'text-[#738242] hover:text-[#738242]' : 'text-[#A8B774] hover:text-gold'
                            }`}
                          >
                            {subItem.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  item.external ? (
                    <a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsMenuOpen(false)}
                      className={`text-[22px] sm:text-[24px] md:text-[26px] font-serif font-normal transition-all duration-300 block ${
                        scrolled ? 'text-[#738242] hover:text-[#738242]' : 'text-[#A8B774] hover:text-gold'
                      }`}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`text-[22px] sm:text-[24px] md:text-[26px] font-serif font-normal transition-all duration-300 block ${
                        scrolled ? 'text-[#738242] hover:text-[#738242]' : 'text-[#A8B774] hover:text-gold'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                )}
              </div>
            ))}
            <div className="pt-8 border-t border-gray-100 w-full">
               {isAuthenticated ? (
                   <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                     <GlowingButton fullWidth>Dashboard</GlowingButton>
                   </Link>
                 ) : (
                   <Link 
                     to="/login" 
                     onClick={() => setIsMenuOpen(false)}
                     className="bg-gold inline-flex min-h-[44px] w-full items-center justify-center whitespace-nowrap rounded-[10px] px-4 py-3 font-sans text-base font-normal hover:bg-[#A8B774] transform hover:scale-105 transition-all duration-300"
                   >
                     <LogIn size={18} className="mr-2 text-white" />
                     <span className="shine-text relative z-10 font-sans font-normal normal-case">Log in</span>
                   </Link>
                 )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow relative z-10 min-w-0">
        <div className="page-shell">
          <div className="page-shell-content min-w-0">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer-gradient text-white pt-24 pb-[max(3rem,calc(2rem+env(safe-area-inset-bottom)))] border-t border-transparent relative z-10 w-full min-w-0 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <div className="page-container">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 border-b border-gray-100 pb-3">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <h3 className="font-serif text-3xl md:text-5xl mb-6 leading-tight">Encounter. Connect.<br /><span className="text-gold">Equip. Impact.</span></h3>
              <div className="flex space-x-6 mt-8 mb-8">
                <a href="#" className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gold hover:bg-gold hover:border-gold hover:text-charcoal transition-all"><Facebook size={20} /></a>
                <a href="#" className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gold hover:bg-gold hover:border-gold hover:text-charcoal transition-all"><Instagram size={20} /></a>
                <a href="#" className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gold hover:bg-gold hover:border-gold hover:text-charcoal transition-all"><Youtube size={20} /></a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-bold text-gold mb-2 uppercase tracking-widest text-xs">Visit</h4>
                  <p className="text-white leading-loose text-sm">
                    284 Havelock Street,<br />
                    Ashburton 7700
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-gold mb-2 uppercase tracking-widest text-xs">Service Times</h4>
                  <p className="text-white leading-loose text-sm">
                    Sundays: 10:00 am<br />
                    Prayer Meeting: 5:00 pm
                  </p>
                </div>
              </div>
            </div>

            {/* Explore Section */}
            <div>
              <button
                onClick={() => setOpenFooterSection(openFooterSection === 'explore' ? null : 'explore')}
                className="md:pointer-events-none flex min-h-[44px] items-center justify-between w-full md:w-auto mb-6 uppercase tracking-widest text-xs font-bold text-gold"
                aria-expanded={openFooterSection === 'explore'}
                aria-controls="footer-explore-links"
              >
                <span>Explore</span>
                <ChevronDown size={16} className={`md:hidden transition-transform duration-300 ${openFooterSection === 'explore' ? 'rotate-180' : ''}`} />
              </button>
              <ul id="footer-explore-links" className={`space-y-3 ${openFooterSection === 'explore' ? 'block' : 'hidden'} md:block`}>
                {navItems.map((item) => (
                  <li key={item.path}>
                    {item.external ? (
                      <a
                        href={item.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-gold transition-colors text-sm"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link to={item.path} className="text-white hover:text-gold transition-colors text-sm">
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Section */}
            <div>
              <button
                onClick={() => setOpenFooterSection(openFooterSection === 'resources' ? null : 'resources')}
                className="md:pointer-events-none flex min-h-[44px] items-center justify-between w-full md:w-auto mb-6 uppercase tracking-widest text-xs font-bold text-gold"
                aria-expanded={openFooterSection === 'resources'}
                aria-controls="footer-resources-links"
              >
                <span>Resources</span>
                <ChevronDown size={16} className={`md:hidden transition-transform duration-300 ${openFooterSection === 'resources' ? 'rotate-180' : ''}`} />
              </button>
              <ul id="footer-resources-links" className={`space-y-3 ${openFooterSection === 'resources' ? 'block' : 'hidden'} md:block`}>
                <li><Link to="/im-new#welcome-pack" className="text-white hover:text-gold transition-colors text-sm">Welcome Pack</Link></li>
                <li><Link to="/im-new#faq" className="text-white hover:text-gold transition-colors text-sm">FAQ</Link></li>
                <li><Link to="/giving#direct-deposit" className="text-white hover:text-gold transition-colors text-sm">Direct Deposit</Link></li>
                <li><Link to="/giving#credit-card" className="text-white hover:text-gold transition-colors text-sm">Credit Card</Link></li>
                {MINISTRIES.slice(0, 6).map((ministry) => (
                  <li key={ministry.slug}>
                    <Link to={ministry.path} className="text-white hover:text-gold transition-colors text-sm">
                      {ministry.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Section */}
            <div>
              <button
                onClick={() => setOpenFooterSection(openFooterSection === 'contact' ? null : 'contact')}
                className="md:pointer-events-none flex min-h-[44px] items-center justify-between w-full md:w-auto mb-6 uppercase tracking-widest text-xs font-bold text-gold"
                aria-expanded={openFooterSection === 'contact'}
                aria-controls="footer-contact-links"
              >
                <span>Get In Touch</span>
                <ChevronDown size={16} className={`md:hidden transition-transform duration-300 ${openFooterSection === 'contact' ? 'rotate-180' : ''}`} />
              </button>
              <div id="footer-contact-links" className={`${openFooterSection === 'contact' ? 'block' : 'hidden'} md:block`}>
                <ul className="space-y-3">
                  <li><Link to="/contact#visit" className="text-white hover:text-gold transition-colors text-sm">Visit Us</Link></li>
                  <li><Link to="/contact#call" className="text-white hover:text-gold transition-colors text-sm">Call Us</Link></li>
                  <li><Link to="/contact#message" className="text-white hover:text-gold transition-colors text-sm">Send Message</Link></li>
                </ul>
                <div className="h-14" aria-hidden="true"></div>
                <div className="mt-9 space-y-2">
                  <p className="text-white text-sm hover:text-gold transition-colors">
                    <span className="text-gold">Phone:</span>{' '}
                    <a href="tel:03-308-5409" className="hover:text-gold transition-colors">03-308 5409</a>
                  </p>
                  <p className="text-white text-sm hover:text-gold transition-colors">
                    <span className="text-gold">Email:</span>{' '}
                    <a href="mailto:office@ashburtonbaptist.co.nz" className="hover:text-gold transition-colors break-all">office@ashburtonbaptist.co.nz</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start text-white text-sm gap-2 pt-3">
            <p className="text-center md:text-left leading-normal">
              <span className="text-gold">&copy; 2026 Ashburton Baptist Church.</span>
              <br />
              <span className="text-white">Developed by </span>
              <a
                href="https://www.appdoers.co.nz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gold transition-colors underline"
              >
                Appdoers.co.nz
              </a>
            </p>
            <div className="flex w-full flex-col items-center md:w-auto md:items-end leading-normal">
              <button
                onClick={() => setOpenFooterSection(openFooterSection === 'legal' ? null : 'legal')}
                className="md:pointer-events-none flex min-h-[44px] md:min-h-0 items-center justify-between w-full md:w-auto uppercase tracking-widest text-xs font-bold text-gold py-0"
                aria-expanded={openFooterSection === 'legal'}
                aria-controls="footer-legal-links"
              >
                <span>Legal</span>
                <ChevronDown size={16} className={`md:hidden transition-transform duration-300 ${openFooterSection === 'legal' ? 'rotate-180' : ''}`} />
              </button>
              <div id="footer-legal-links" className={`flex flex-col md:flex-row md:gap-x-6 ${openFooterSection === 'legal' ? '' : 'hidden'} md:flex`}>
                <Link to="/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-gold transition-colors">Terms & Conditions</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <AppDialogHost />
    </div>
  );
};