'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';

export default function NavBar() {
  const { user, logout, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-indigo-700">
            SpellBuddy
          </Link>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
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
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
              <Link 
                href="/practice" 
                className="text-indigo-600 hover:text-indigo-800 font-medium py-2 md:py-0"
              >
                Practice
              </Link>
              <Link 
                href="/progress" 
                className="text-indigo-600 hover:text-indigo-800 font-medium py-2 md:py-0"
              >
                Progress
              </Link>
              <Link 
                href="/about" 
                className="text-indigo-600 hover:text-indigo-800 font-medium py-2 md:py-0"
              >
                About
              </Link>
              
              {loading ? (
                <span className="text-gray-500 py-2 md:py-0">Loading...</span>
              ) : user ? (
                <>
                  <Link 
                    href="/preferences" 
                    className="text-indigo-600 hover:text-indigo-800 font-medium py-2 md:py-0"
                  >
                    Preferences
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="text-indigo-600 hover:text-indigo-800 font-medium py-2 md:py-0 text-left"
                  >
                    Log Out
                  </button>
                  <span className="text-gray-700 font-medium py-2 md:py-0 md:ml-4">
                    Hi, {user.username}
                  </span>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-indigo-600 hover:text-indigo-800 font-medium py-2 md:py-0"
                  >
                    Log In
                  </Link>
                  <Link 
                    href="/register" 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 text-center"
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