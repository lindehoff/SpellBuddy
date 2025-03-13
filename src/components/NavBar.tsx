'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function NavBar() {
  const { user, logout, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Hide navbar on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };
  
  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isUserMenuOpen && !target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);
  
  return (
    <header 
      className={`fixed w-full z-50 transition-transform duration-300 ${
        isNavVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <nav className="bg-white/90 backdrop-blur-sm shadow-md px-4 py-2">
        <div className="container mx-auto flex flex-wrap items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              SpellBuddy
            </span>
            <span className="ml-2 text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
              Beta
            </span>
          </Link>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-md text-indigo-700 hover:bg-indigo-100"
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
          
          {/* Desktop navigation */}
          <div className={`${isMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-auto mt-4 md:mt-0`}>
            <div className="flex flex-col md:flex-row md:items-center md:space-x-1">
              <NavLink href="/practice" active={pathname === '/practice'}>
                Practice
              </NavLink>
              <NavLink href="/progress" active={pathname === '/progress'}>
                Progress
              </NavLink>
              
              {loading ? (
                <span className="text-gray-500 py-2 md:py-0 px-3">Loading...</span>
              ) : user ? (
                <div className="md:relative user-menu-container">
                  <button 
                    onClick={toggleUserMenu}
                    className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium py-2 md:py-1 px-3 rounded-md hover:bg-indigo-50 w-full md:w-auto text-left"
                  >
                    <span className="mr-1">{user.username}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="md:absolute md:right-0 md:mt-2 md:py-2 md:w-48 md:bg-white md:rounded-md md:shadow-lg md:border md:border-gray-200 z-50">
                      <Link 
                        href="/preferences" 
                        className="block px-4 py-2 text-indigo-600 hover:bg-indigo-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Preferences
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-indigo-600 hover:bg-indigo-50"
                      >
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
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1 px-4 rounded-md transition-colors duration-200 text-center mx-1 my-2 md:my-0"
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
  );
}

// Helper component for navigation links
function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className={`font-medium py-2 md:py-1 px-3 rounded-md transition-colors duration-200 ${
        active 
          ? 'bg-indigo-100 text-indigo-800' 
          : 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50'
      }`}
    >
      {children}
    </Link>
  );
} 