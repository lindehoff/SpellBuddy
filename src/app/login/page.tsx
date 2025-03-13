'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(usernameOrEmail, password);
      router.push('/');
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      {/* Decorative elements */}
      <div className="absolute top-40 left-10 sm:left-20 w-48 sm:w-64 h-48 sm:h-64 bg-cyan-500/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-10 sm:right-20 w-64 sm:w-80 h-64 sm:h-80 bg-indigo-500/20 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      
      <div className="w-full max-w-md glass-card p-5 sm:p-8 rounded-xl shadow-lg border border-white/10 relative z-10">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-4 sm:mb-6 text-center">✨ Welcome Back ✨</h1>
        
        <p className="text-center opacity-90 mb-4 sm:mb-6 text-sm sm:text-base">
          Log in to continue your spelling adventure! 🧙‍♂️📚
        </p>
        
        {error && (
          <div className="bg-red-500/20 text-red-300 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 border border-red-500/20 text-sm sm:text-base">
            ⚠️ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4 sm:mb-5">
            <label htmlFor="usernameOrEmail" className="block font-medium mb-1 sm:mb-2 text-sm sm:text-base">
              👤 Username or Email
            </label>
            <input
              type="text"
              id="usernameOrEmail"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-white/50 text-sm sm:text-base"
              required
            />
          </div>
          
          <div className="mb-5 sm:mb-6">
            <label htmlFor="password" className="block font-medium mb-1 sm:mb-2 text-sm sm:text-base">
              🔒 Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-white/50 text-sm sm:text-base"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full shine-button text-white font-bold py-2 sm:py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 text-sm sm:text-base"
          >
            {isLoading ? '🔄 Logging in...' : '🚪 Log In'}
          </button>
        </form>
        
        <div className="mt-4 sm:mt-6 text-center">
          <p className="opacity-90 text-sm sm:text-base">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 