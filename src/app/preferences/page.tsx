'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import UserPreferencesForm from '@/components/UserPreferencesForm';
import { useEffect } from 'react';

export default function PreferencesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  const handleComplete = () => {
    router.push('/practice');
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-cyan-400 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-medium">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in the useEffect
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Decorative elements */}
      <div className="absolute top-40 left-20 w-64 h-64 bg-cyan-500/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-indigo-500/20 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10">
        <h1 className="text-4xl font-bold gradient-text mb-6 text-center font-poppins">Your Preferences</h1>
        <p className="text-xl opacity-90 mb-8 text-center max-w-2xl mx-auto">
          Tell us a bit about yourself so we can create personalized exercises that match your interests and skill level.
        </p>
        
        <UserPreferencesForm onComplete={handleComplete} />
      </div>
    </div>
  );
} 