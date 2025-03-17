'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminData {
  username: string;
}

interface MenuItem {
  name: string;
  icon: string;
  href: string;
  description: string;
  comingSoon?: boolean;
}

const menuItems: MenuItem[] = [
  {
    name: 'Users',
    icon: '👥',
    href: '/admin/users',
    description: 'Manage users, achievements, and permissions',
    comingSoon: true
  },
  {
    name: 'Achievements',
    icon: '🏆',
    href: '/admin/achievements',
    description: 'Create and manage achievements',
    comingSoon: true
  },
  {
    name: 'Database',
    icon: '🗄️',
    href: '/admin/database',
    description: 'Database maintenance and backups',
    comingSoon: true
  },
  {
    name: 'Settings',
    icon: '⚙️',
    href: '/admin/settings',
    description: 'Application settings and version management',
    comingSoon: true
  }
];

export default function AdminDashboard() {
  const router = useRouter();
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

    loadAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <nav className="bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-white text-xl font-bold">🛡️ Admin Dashboard</span>
            </div>
            <div className="flex items-center">
              <span className="text-white mr-4">👤 {admin.username}</span>
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
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {menuItems.map((item) => (
              <div
                key={item.name}
                className="relative group bg-white/5 overflow-hidden rounded-lg border border-white/10 p-6 hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 text-4xl">{item.icon}</div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-white">
                      {item.name}
                      {item.comingSoon && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300">
                          Coming Soon
                        </span>
                      )}
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 