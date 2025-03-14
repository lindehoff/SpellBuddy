'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';

export default function NavBar() {
  const { user, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Auto-hide navbar on mobile after a delay
  useEffect(() => {
    // Only apply auto-hide on mobile devices
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // Show navbar initially
      setIsNavVisible(true);
      
      // Hide navbar after 2 seconds
      const timer = setTimeout(() => {
        setIsNavVisible(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [pathname]); // Reset timer when route changes
  
  // Hide navbar on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Always show navbar when scrolling to the top
      if (currentScrollY < 10) {
        setIsNavVisible(true);
        return;
      }
      
      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
        
        // Auto-hide again after 2 seconds on mobile
        if (window.innerWidth < 768) {
          setTimeout(() => {
            // Only hide if user hasn't scrolled further
            if (window.scrollY === currentScrollY) {
              setIsNavVisible(false);
            }
          }, 2000);
        }
      }
      
      setLastScrollY(currentScrollY);
    };
    
    // Add touch handler for top area to show navbar
    const handleTopTouch = (e: TouchEvent) => {
      // If touch is in the top 40px of the screen
      if (e.touches[0].clientY < 40) {
        setIsNavVisible(true);
        
        // Auto-hide after 2 seconds
        setTimeout(() => {
          setIsNavVisible(false);
        }, 2000);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchstart', handleTopTouch, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTopTouch);
    };
  }, [lastScrollY]);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };
  
  // Close menus when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);
  
  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isUserMenuOpen && !target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };
    
    // Close menu on any click when it's open
    const handleAnyClick = () => {
      if (isUserMenuOpen) {
        // Small delay to allow the click event to register on menu items first
        setTimeout(() => {
          setIsUserMenuOpen(false);
        }, 50);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('click', handleAnyClick);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('click', handleAnyClick);
    };
  }, [isUserMenuOpen]);
  
  return (
    <>
      <div 
        className="fixed top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400/30 to-indigo-400/30 z-40 md:hidden"
        onClick={() => setIsNavVisible(true)}
      />
      <header 
        className={`fixed w-full z-50 transition-transform duration-300 ${
          isNavVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <nav className="glass-card backdrop-blur-md px-4 py-3">
          <div className="container mx-auto flex flex-wrap items-center justify-between">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold gradient-text font-poppins">
                SpellBuddy
              </span>
              <span className="ml-2 text-xs bg-cyan-400/20 text-cyan-300 px-2 py-1 rounded-full border border-cyan-400/30">
                Beta
              </span>
            </Link>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Theme toggle button */}
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full bg-opacity-20 hover:bg-opacity-30 transition-colors duration-200"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden p-2 rounded-full bg-opacity-20 hover:bg-opacity-30 transition-colors duration-200"
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                  />
                </svg>
              </button>
            </div>
            
            {/* Desktop navigation */}
            <div className={`${isMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-auto mt-4 md:mt-0 absolute md:static top-full left-0 right-0 glass-card md:glass-card-none md:bg-transparent p-4 md:p-0`}>
              <div className="flex flex-col md:flex-row md:items-center md:space-x-1">
                <NavLink href="/practice" active={pathname === '/practice'}>
                  Practice
                </NavLink>
                <NavLink href="/progress" active={pathname === '/progress'}>
                  Progress
                </NavLink>
                <NavLink href="/achievements" active={pathname === '/achievements'}>
                  Achievements
                </NavLink>
                
                {loading ? (
                  <div className="flex items-center py-2 md:py-0 px-3">
                    <div className="animate-spin h-4 w-4 border-2 border-cyan-400 rounded-full border-t-transparent"></div>
                    <span className="ml-2 text-sm">Loading...</span>
                  </div>
                ) : user ? (
                  <div className="md:relative user-menu-container">
                    <button 
                      onClick={toggleUserMenu}
                      className="flex items-center font-medium py-2 md:py-1 px-3 rounded-md hover:bg-white/10 w-full md:w-auto text-left transition-colors duration-200"
                    >
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold mr-2">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="mr-1">{user.username}</span>
                      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {isUserMenuOpen && (
                      <div className="md:absolute md:right-0 md:mt-2 md:py-2 md:w-48 glass-card rounded-lg shadow-lg z-50">
                        <Link 
                          href="/preferences" 
                          className="flex items-center px-4 py-2 hover:bg-white/10 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Preferences
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center w-full text-left px-4 py-2 hover:bg-white/10 transition-colors duration-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Log Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <NavLink href="/login" active={pathname === '/login'}>
                      Log In
                    </NavLink>
                    <Link 
                      href="/register" 
                      className="shine-button text-white font-medium py-1.5 px-4 rounded-md transition-all duration-200 text-center mx-1 my-2 md:my-0"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}

// Helper component for navigation links
function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className={`font-medium py-2 md:py-1.5 px-3 rounded-md transition-all duration-200 ${
        active 
          ? 'bg-white/10 text-cyan-300 border-b-2 border-cyan-400' 
          : 'hover:bg-white/10 hover:text-cyan-300'
      }`}
      onClick={() => {
        // Close any open menus when clicking a navigation link
        const event = new Event('click');
        document.dispatchEvent(event);
      }}
    >
      {children}
    </Link>
  );
} 