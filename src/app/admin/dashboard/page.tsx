'use client';

import Link from 'next/link';

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
    description: 'Manage users, achievements, and permissions'
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
  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-white mb-8">Welcome to Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {menuItems.map((item) => (
          item.comingSoon ? (
            <div
              key={item.name}
              className="relative group bg-white/5 overflow-hidden rounded-lg border border-white/10 p-6 opacity-75 cursor-not-allowed"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 text-4xl">{item.icon}</div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">
                    {item.name}
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300">
                      Coming Soon
                    </span>
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">{item.description}</p>
                </div>
              </div>
            </div>
          ) : (
            <Link
              key={item.name}
              href={item.href}
              className="relative group bg-white/5 overflow-hidden rounded-lg border border-white/10 p-6 hover:bg-white/10 transition-all duration-200"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 text-4xl">{item.icon}</div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">{item.description}</p>
                </div>
              </div>
            </Link>
          )
        ))}
      </div>
    </div>
  );
} 