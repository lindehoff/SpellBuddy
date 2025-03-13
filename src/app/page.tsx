"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

export default function Home() {
  const { theme: _ } = useTheme(); // Rename to _ to indicate intentionally unused
  const [mounted, setMounted] = useState(false);
  
  // Ensure theme is available after hydration
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
      {/* Decorative elements */}
      <div className="absolute top-40 left-20 w-64 h-64 bg-cyan-500/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-indigo-500/20 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10 max-w-4xl w-full">
        <div className="glass-card rounded-2xl p-8 md:p-12 animate-float">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 font-poppins">
              Welcome to <span className="gradient-text">SpellBuddy</span>!
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 font-medium opacity-90">
              A fun and encouraging way to practice English spelling.
              Translate Swedish texts, speak your answers, and improve your spelling skills!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/practice" 
                className="shine-button text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105"
              >
                Start Practicing
              </Link>
              
              <Link 
                href="/progress" 
                className="glass-card hover:bg-white/10 font-bold py-4 px-8 rounded-xl text-lg border border-white/20 transition-all duration-300 transform hover:scale-105"
              >
                View Progress
              </Link>
            </div>
          </div>
          
          {/* Features section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <FeatureCard 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              }
              title="Speech Recognition"
              description="Practice your pronunciation by speaking your translations and get instant feedback."
            />
            
            <FeatureCard 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              title="Track Progress"
              description="Monitor your improvement over time with detailed statistics and insights."
            />
            
            <FeatureCard 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              }
              title="Earn Achievements"
              description="Unlock badges and rewards as you improve your spelling skills."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-card rounded-xl p-6 transition-all duration-300 hover:transform hover:scale-105 hover:bg-white/10">
      <div className="text-cyan-300 mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="opacity-80">{description}</p>
    </div>
  );
}
