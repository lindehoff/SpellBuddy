'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setIsLoading(true);

    try {
      await register(username, email, password);
      router.push('/preferences');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      {/* Decorative elements */}
      <div className="absolute top-40 left-20 w-64 h-64 bg-cyan-500/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-indigo-500/20 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      
      <div className="w-full max-w-md glass-card p-8 rounded-xl shadow-lg border border-white/10 relative z-10">
        <h1 className="text-3xl font-bold gradient-text mb-6 text-center">✨ Create an Account ✨</h1>
        
        <p className="text-center opacity-90 mb-6">
          Join SpellBuddy and start your magical spelling journey! 🧙‍♂️📚
        </p>
        
        {error && (
          <div className="bg-red-500/20 text-red-300 p-4 rounded-xl mb-6 border border-red-500/20">
            ⚠️ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="username" className="block font-medium mb-2">
              👤 Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-white/50"
              required
            />
          </div>
          
          <div className="mb-5">
            <label htmlFor="email" className="block font-medium mb-2">
              ✉️ Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-white/50"
              required
            />
          </div>
          
          <div className="mb-5">
            <label htmlFor="password" className="block font-medium mb-2">
              🔒 Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-white/50"
              required
              minLength={8}
            />
            <p className="text-sm opacity-70 mt-1">
              Must be at least 8 characters long
            </p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block font-medium mb-2">
              🔐 Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-white/50"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full shine-button text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
          >
            {isLoading ? '🔄 Creating Account...' : '🚀 Create Account'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="opacity-90">
            Already have an account?{' '}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 