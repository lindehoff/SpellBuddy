'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface AdminData {
  username: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: string;
  comingSoon?: boolean;
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: '🏠'
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: '👥'
  },
  {
    name: 'Achievements',
    href: '/admin/achievements',
    icon: '🏆',
    comingSoon: true
  },
  {
    name: 'Database',
    href: '/admin/database',
    icon: '🗄️',
    comingSoon: true
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: '⚙️',
    comingSoon: true
  }
];

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdmin() {
      try {
        const response = await fetch('/api/admin/me');
        if (response.ok) {
          const data = await response.json();
          setAdmin(data.data);
        } else {
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Failed to load admin:', error);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    }

    if (pathname !== '/admin/login') {
      loadAdmin();
    } else {
      setLoading(false);
    }
  }, [router, pathname]);

  if (pathname === '/admin/login') {
    return children;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!admin && pathname !== '/admin/login') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <nav className="bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin/dashboard" className="text-white text-xl font-bold">
                🛡️ Admin Dashboard
              </Link>
              <div className="hidden md:block ml-10">
                <div className="flex items-center space-x-4">
                  {navItems.map((item) => (
                    <div key={item.name}>
                      {item.comingSoon ? (
                        <span className="text-gray-400 cursor-not-allowed px-3 py-2 rounded-md text-sm font-medium opacity-75">
                          {item.icon} {item.name}
                          <span className="ml-1 text-xs text-cyan-500/50">Soon</span>
                        </span>
                      ) : (
                        <Link
                          href={item.href}
                          className={`${
                            pathname === item.href
                              ? 'bg-white/10 text-white'
                              : 'text-gray-300 hover:bg-white/5 hover:text-white'
                          } px-3 py-2 rounded-md text-sm font-medium`}
                        >
                          {item.icon} {item.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-white mr-4">👤 {admin?.username}</span>
              <button
                onClick={async () => {
                  await fetch('/api/admin/logout', { method: 'POST' });
                  router.push('/admin/login');
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
} 