import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Instagram, Facebook, Youtube, ChevronDown, LogIn } from 'lucide-react';
import { GlowingButton } from '../UI/GlowingButton';
import { useAuth } from '../../context/AuthContext';
import { ScrollToTop } from '../ScrollToTop';
import { useAutoSectionReveal } from '../UI/useAutoSectionReveal';

export const PublicLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
  useAutoSectionReveal();

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

  // Handle smooth scrolling to hash sections
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      // Skip OAuth callback parameters (access_token, error, etc.)
      if (hash && (hash.includes('access_token') || hash.includes('error=') || hash.includes('expires_at'))) {
        return; // Don't try to scroll to OAuth parameters
      }
      
      // Validate hash: must start with # and have at least one valid character
      if (hash && hash.length > 1 && hash.startsWith('#')) {
        try {
          const element = document.querySelector(hash);
          if (element) {
            setTimeout(() => {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }
        } catch (e) {
          // Invalid selector, ignore
          console.warn('Invalid hash selector:', hash);
        }
      }
    };

    // Scroll on initial load if hash exists
    scrollToHash();

    // Listen for hash changes
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, [location]);

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
        { label: 'Our Vision', path: '/about#vision', hash: 'vision' },
        { label: 'Our Beliefs', path: '/about#beliefs', hash: 'beliefs' },
        { label: 'Leadership', path: '/about#leadership', hash: 'leadership' },
        { label: 'History', path: '/about/history', hash: '' },
      ]
    },
    { 
      label: 'Watch Sermons', 
      path: 'https://www.youtube.com',
      submenu: [],
      external: true
    },
    { 
      label: 'Events', 
      path: '/events',
      submenu: [
        { label: 'Sunday Service', path: '/events#sunday-service', hash: 'sunday-service' },
        { label: 'Young Adults', path: '/events#young-adults', hash: 'young-adults' },
        { label: 'Community Lunch', path: '/events#community-lunch', hash: 'community-lunch' },
        { label: 'Kids Program', path: '/events#kids-program', hash: 'kids-program' },
      ]
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
      submenu: [
        { label: 'Visit Us', path: '/contact#visit', hash: 'visit' },
        { label: 'Call Us', path: '/contact#call', hash: 'call' },
        { label: 'Email Us', path: '/contact#email', hash: 'email' },
        { label: 'Send Message', path: '/contact#message', hash: 'message' },
      ]
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-charcoal font-sans relative overflow-x-hidden selection:bg-gold selection:text-charcoal">
      <ScrollToTop />
      
      {/* Header */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${isLoginPage || scrolled ? 'bg-white backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <img 
                src="/ABC Logo.png" 
                alt="Ashburton Baptist Church" 
                className="h-16 md:h-20 transition-opacity duration-300 group-hover:opacity-80"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-[42px]">
              {navItems.map((item) => (
                <div
                  key={item.path}
                  className="relative"
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
                      className={`text-base font-sans font-bold transition-all duration-300 relative group flex items-center gap-1 rounded-[6px] px-2 py-1 -mx-2 -my-1 ${
                        isLoginPage || scrolled
                          ? 'text-[#738242] hover:text-[#738242] hover:bg-[#fdefb4]'
                          : 'text-white hover:text-gold'
                      }`}
                    >
                      {item.label}
                      <span className={`absolute -bottom-2 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                        isLoginPage || scrolled ? 'bg-[#738242]' : 'bg-gold'
                      }`}></span>
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      className={`text-base font-sans font-bold transition-all duration-300 relative group flex items-center gap-1 rounded-[6px] px-2 py-1 -mx-2 -my-1 ${
                        isLoginPage || scrolled
                          ? 'text-[#738242] hover:text-[#738242] hover:bg-[#fdefb4]'
                          : 'text-white hover:text-gold'
                      }`}
                    >
                      {item.label}
                      {item.submenu && item.submenu.length > 0 && (
                        <ChevronDown size={14} className={`${isLoginPage || scrolled ? 'text-[#738242]' : 'text-white'} transition-transform duration-300 ${openDropdown === item.path ? 'rotate-180' : ''}`} />
                      )}
                      <span className={`absolute -bottom-2 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                        isLoginPage || scrolled ? 'bg-[#738242]' : 'bg-gold'
                      } ${location.pathname === item.path ? 'w-full' : ''}`}></span>
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
                     className="bg-gold px-[9px] py-[8px] lg:px-[17px] lg:py-[12px] xl:px-[25px] xl:py-[12px] rounded-[10px] font-sans font-normal text-xs lg:text-sm xl:text-base hover:bg-[#A8B774] transform hover:scale-105 transition-all duration-300 inline-flex items-center justify-center whitespace-nowrap"
                   >
                     <LogIn size={18} className="mr-2 text-white" />
                     <span className="shine-text relative z-10 font-sans font-normal normal-case">Log in</span>
                   </Link>
                 )}
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-charcoal hover:text-gold transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white absolute w-full h-screen top-0 left-0 p-8 flex flex-col justify-center space-y-6 z-40 overflow-y-auto">
             <button className="absolute top-8 right-8 text-charcoal" onClick={() => setIsMenuOpen(false)}><X size={32}/></button>
            {navItems.map((item) => (
              <div key={item.path} className="space-y-2">
                {item.submenu && item.submenu.length > 0 ? (
                  <>
                    <div 
                      className="flex items-center justify-between text-[22px] sm:text-[24px] md:text-[26px] font-serif font-normal text-[#A8B774] hover:text-gold transition-all duration-300 cursor-pointer"
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
                        className={`text-[#A8B774] transition-transform duration-300 ${openMobileSubmenu === item.path ? 'rotate-180' : ''}`} 
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
                            className="block text-[18px] sm:text-[20px] md:text-[22px] font-serif text-[#A8B774] hover:text-gold transition-colors cursor-pointer"
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
                      className="text-[22px] sm:text-[24px] md:text-[26px] font-serif font-normal text-[#A8B774] hover:text-gold transition-all duration-300 block"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-[22px] sm:text-[24px] md:text-[26px] font-serif font-normal text-[#A8B774] hover:text-gold transition-all duration-300 block"
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
                     className="bg-gold px-[9px] py-[8px] lg:px-[17px] lg:py-[12px] xl:px-[25px] xl:py-[12px] rounded-[10px] font-sans font-normal text-base lg:text-sm xl:text-base hover:bg-[#A8B774] transform hover:scale-105 transition-all duration-300 w-full inline-flex items-center justify-center whitespace-nowrap"
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
      <main className="flex-grow relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer-gradient text-white pt-24 pb-12 border-t border-transparent relative z-10 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 border-b border-gray-100 pb-6 mb-6">
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
                className="md:pointer-events-none flex items-center justify-between w-full md:w-auto mb-6 uppercase tracking-widest text-xs font-bold text-gold"
                aria-expanded={openFooterSection === 'explore'}
                aria-controls="footer-explore-links"
              >
                <span>Explore</span>
                <ChevronDown size={16} className={`md:hidden transition-transform duration-300 ${openFooterSection === 'explore' ? 'rotate-180' : ''}`} />
              </button>
              <ul id="footer-explore-links" className={`space-y-3 ${openFooterSection === 'explore' ? 'block' : 'hidden'} md:block`}>
                <li><Link to="/" className="text-white hover:text-gold transition-colors text-sm">Home</Link></li>
                <li><Link to="/about" className="text-white hover:text-gold transition-colors text-sm">About</Link></li>
                <li><Link to="/events" className="text-white hover:text-gold transition-colors text-sm">Events</Link></li>
                <li><Link to="/im-new" className="text-white hover:text-gold transition-colors text-sm">I'm New</Link></li>
                <li><Link to="/need-prayer" className="text-white hover:text-gold transition-colors text-sm">Prayer</Link></li>
                <li><Link to="/giving" className="text-white hover:text-gold transition-colors text-sm">Giving</Link></li>
                <li><Link to="/contact" className="text-white hover:text-gold transition-colors text-sm">Contact</Link></li>
              </ul>
            </div>

            {/* Resources Section */}
            <div>
              <button
                onClick={() => setOpenFooterSection(openFooterSection === 'resources' ? null : 'resources')}
                className="md:pointer-events-none flex items-center justify-between w-full md:w-auto mb-6 uppercase tracking-widest text-xs font-bold text-gold"
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
                <li><Link to="/events#sunday-service" className="text-white hover:text-gold transition-colors text-sm">Sunday Service</Link></li>
                <li><Link to="/events#young-adults" className="text-white hover:text-gold transition-colors text-sm">Young Adults</Link></li>
                <li><Link to="/events#kids-program" className="text-white hover:text-gold transition-colors text-sm">Kids Program</Link></li>
              </ul>
            </div>

            {/* Contact Section */}
            <div>
              <button
                onClick={() => setOpenFooterSection(openFooterSection === 'contact' ? null : 'contact')}
                className="md:pointer-events-none flex items-center justify-between w-full md:w-auto mb-6 uppercase tracking-widest text-xs font-bold text-gold"
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
          <div className="flex flex-col md:flex-row justify-between items-center text-white text-sm gap-4">
            <p>
              <span className="text-gold">&copy; 2026 Ashburton Baptist Church.</span>
              <span className="text-white"> | Develeped by APPDOERS.</span>
            </p>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => setOpenFooterSection(openFooterSection === 'legal' ? null : 'legal')}
                className="md:pointer-events-none flex items-center justify-between w-full md:w-auto uppercase tracking-widest text-xs font-bold text-gold"
                aria-expanded={openFooterSection === 'legal'}
                aria-controls="footer-legal-links"
              >
                <span>Legal</span>
                <ChevronDown size={16} className={`md:hidden transition-transform duration-300 ${openFooterSection === 'legal' ? 'rotate-180' : ''}`} />
              </button>
              <div id="footer-legal-links" className={`flex flex-col md:flex-row md:space-x-6 ${openFooterSection === 'legal' ? 'gap-2' : 'hidden'} md:flex`}>
                <Link to="/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-gold transition-colors">Terms & Conditions</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};