import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Instagram, Facebook, Youtube, ChevronDown } from 'lucide-react';
import { GlowingButton } from '../UI/GlowingButton';
import { useAuth } from '../../context/AuthContext';
import { BackgroundBlobs } from '../UI/BackgroundBlobs';
import { ScrollToTop } from '../ScrollToTop';

export const PublicLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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
          setOpenDropdown(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  // Handle smooth scrolling to hash sections
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
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
    <div className="min-h-screen flex flex-col bg-base text-charcoal font-sans relative overflow-x-hidden selection:bg-gold selection:text-charcoal">
      <ScrollToTop />
      <BackgroundBlobs />
      
      {/* Header */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
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
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <div
                  key={item.path}
                  className="relative"
                  ref={(el) => (dropdownRefs.current[item.path] = el)}
                  onMouseEnter={() => item.submenu && item.submenu.length > 0 && setOpenDropdown(item.path)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    to={item.path}
                    className={`text-sm font-bold uppercase tracking-widest hover:text-gold transition-all duration-300 relative group flex items-center gap-1 ${
                      location.pathname === item.path ? 'text-gold' : 'text-charcoal'
                    }`}
                  >
                    {item.label}
                    {item.submenu && item.submenu.length > 0 && (
                      <ChevronDown size={14} className={`transition-transform duration-300 ${openDropdown === item.path ? 'rotate-180' : ''}`} />
                    )}
                    <span className={`absolute -bottom-2 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full ${location.pathname === item.path ? 'w-full' : ''}`}></span>
                  </Link>
                  
                  {/* Dropdown Submenu */}
                  {item.submenu && item.submenu.length > 0 && openDropdown === item.path && (
                    <div 
                      className="absolute top-full left-0 mt-2 w-56 bg-white rounded-[8px] shadow-xl border border-gray-100 py-2 animate-fade-in-up"
                      onMouseEnter={() => setOpenDropdown(item.path)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      {item.submenu.map((subItem) => (
                        <a
                          key={subItem.path}
                          href={subItem.path}
                          onClick={(e) => {
                            e.preventDefault();
                            handleSubmenuClick(subItem.path, subItem.hash);
                          }}
                          className="block px-6 py-3 text-sm text-charcoal hover:bg-gold/10 hover:text-gold transition-colors font-medium cursor-pointer"
                        >
                          {subItem.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pl-6 border-l border-gray-200">
                 {isAuthenticated ? (
                   <Link to="/dashboard">
                     <GlowingButton size="sm" variant="gold">Dashboard</GlowingButton>
                   </Link>
                 ) : (
                   <Link to="/login">
                    <GlowingButton variant="outline" size="sm">Log In</GlowingButton>
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
                      className="flex items-center justify-between text-4xl font-serif font-bold text-charcoal hover:text-gold transition-all duration-300 cursor-pointer"
                      onClick={() => setOpenMobileSubmenu(openMobileSubmenu === item.path ? null : item.path)}
                    >
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
                      <ChevronDown 
                        size={24} 
                        className={`transition-transform duration-300 ${openMobileSubmenu === item.path ? 'rotate-180' : ''}`} 
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
                            className="block text-2xl font-serif text-neutral hover:text-gold transition-colors cursor-pointer"
                          >
                            {subItem.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-4xl font-serif font-bold text-charcoal hover:text-gold transition-all duration-300 block"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            <div className="pt-8 border-t border-gray-100 w-full">
               {isAuthenticated ? (
                   <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                     <GlowingButton fullWidth>Dashboard</GlowingButton>
                   </Link>
                 ) : (
                   <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <GlowingButton fullWidth variant="gold">Log In</GlowingButton>
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
      <footer className="bg-white text-charcoal pt-24 pb-12 border-t border-gray-100 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 border-b border-gray-100 pb-12 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <h3 className="font-serif text-3xl md:text-5xl mb-6 leading-tight">Encounter. Connect.<br /><span className="text-gold">Equip. Impact.</span></h3>
              <div className="flex space-x-6 mt-8 mb-8">
                <a href="#" className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-charcoal hover:bg-gold hover:border-gold hover:text-charcoal transition-all"><Facebook size={20} /></a>
                <a href="#" className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-charcoal hover:bg-gold hover:border-gold hover:text-charcoal transition-all"><Instagram size={20} /></a>
                <a href="#" className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-charcoal hover:bg-gold hover:border-gold hover:text-charcoal transition-all"><Youtube size={20} /></a>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-charcoal mb-2 uppercase tracking-widest text-xs">Visit</h4>
                <p className="text-neutral leading-loose text-sm">
                  284 Havelock Street,<br />
                  Ashburton 7700
                </p>
              </div>
              <div className="space-y-2 mt-6">
                <h4 className="font-bold text-charcoal mb-2 uppercase tracking-widest text-xs">Service Times</h4>
                <p className="text-neutral leading-loose text-sm">
                  Sundays: 10:00 AM<br />
                  Online: 10:00 AM
                </p>
              </div>
            </div>

            {/* Explore Section */}
            <div>
              <h4 className="font-bold text-charcoal mb-6 uppercase tracking-widest text-xs">Explore</h4>
              <ul className="space-y-3">
                <li><Link to="/" className="text-neutral hover:text-gold transition-colors text-sm">Home</Link></li>
                <li><Link to="/about" className="text-neutral hover:text-gold transition-colors text-sm">About</Link></li>
                <li><Link to="/about#vision" className="text-neutral hover:text-gold transition-colors text-sm pl-4">Our Vision</Link></li>
                <li><Link to="/about#beliefs" className="text-neutral hover:text-gold transition-colors text-sm pl-4">Our Beliefs</Link></li>
                <li><Link to="/about#leadership" className="text-neutral hover:text-gold transition-colors text-sm pl-4">Leadership</Link></li>
                <li><Link to="/about/history" className="text-neutral hover:text-gold transition-colors text-sm pl-4">History</Link></li>
                <li><Link to="/events" className="text-neutral hover:text-gold transition-colors text-sm">Events</Link></li>
                <li><Link to="/im-new" className="text-neutral hover:text-gold transition-colors text-sm">I'm New</Link></li>
                <li><Link to="/need-prayer" className="text-neutral hover:text-gold transition-colors text-sm">Prayer</Link></li>
                <li><Link to="/giving" className="text-neutral hover:text-gold transition-colors text-sm">Giving</Link></li>
                <li><Link to="/contact" className="text-neutral hover:text-gold transition-colors text-sm">Contact</Link></li>
              </ul>
            </div>

            {/* Resources Section */}
            <div>
              <h4 className="font-bold text-charcoal mb-6 uppercase tracking-widest text-xs">Resources</h4>
              <ul className="space-y-3">
                <li><Link to="/im-new#welcome-pack" className="text-neutral hover:text-gold transition-colors text-sm">Welcome Pack</Link></li>
                <li><Link to="/im-new#faq" className="text-neutral hover:text-gold transition-colors text-sm">FAQ</Link></li>
                <li><Link to="/giving#direct-deposit" className="text-neutral hover:text-gold transition-colors text-sm">Direct Deposit</Link></li>
                <li><Link to="/giving#credit-card" className="text-neutral hover:text-gold transition-colors text-sm">Credit Card</Link></li>
                <li><Link to="/events#sunday-service" className="text-neutral hover:text-gold transition-colors text-sm">Sunday Service</Link></li>
                <li><Link to="/events#young-adults" className="text-neutral hover:text-gold transition-colors text-sm">Young Adults</Link></li>
                <li><Link to="/events#community-lunch" className="text-neutral hover:text-gold transition-colors text-sm">Community Lunch</Link></li>
                <li><Link to="/events#kids-program" className="text-neutral hover:text-gold transition-colors text-sm">Kids Program</Link></li>
              </ul>
            </div>

            {/* Contact Section */}
            <div>
              <h4 className="font-bold text-charcoal mb-6 uppercase tracking-widest text-xs">Get In Touch</h4>
              <ul className="space-y-3">
                <li><Link to="/contact#visit" className="text-neutral hover:text-gold transition-colors text-sm">Visit Us</Link></li>
                <li><Link to="/contact#call" className="text-neutral hover:text-gold transition-colors text-sm">Call Us</Link></li>
                <li><Link to="/contact#email" className="text-neutral hover:text-gold transition-colors text-sm">Email Us</Link></li>
                <li><Link to="/contact#message" className="text-neutral hover:text-gold transition-colors text-sm">Send Message</Link></li>
              </ul>
              <div className="mt-6 space-y-2">
                <p className="text-neutral text-sm">Phone: <a href="tel:03-308-5409" className="hover:text-gold transition-colors">03-308 5409</a></p>
                <p className="text-neutral text-sm">Email: <a href="mailto:office@ashburtonbaptist.co.nz" className="hover:text-gold transition-colors break-all">office@ashburtonbaptist.co.nz</a></p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center text-neutral text-sm gap-4">
            <p>&copy; {new Date().getFullYear()} Ashburton Baptist Church.</p>
            <div className="flex flex-col items-end gap-2">
              <div className="flex space-x-6">
                <Link to="/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-gold transition-colors">Terms & Conditions</Link>
              </div>
              <p className="text-xs text-neutral">
                Website developed by{' '}
                <a href="https://appdoers.co.nz/" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline transition-colors">Appdoers</a>
                {' '}in partnership with{' '}
                <a href="https://buildwithsds.com/" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline transition-colors">Build With SDS</a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};