'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Settings, Shield, Menu, X, BarChart3, FolderCog, Crown } from 'lucide-react';
import useSWR from 'swr';
import { User, UserRole } from '@/lib/db/schema';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideSidebar =
    pathname?.startsWith('/dashboard/buy') ||
    pathname?.startsWith('/dashboard/kaufen');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.OWNER;
  const isOwner = user?.role === UserRole.OWNER;

  const navItems = [
    { href: '/dashboard', icon: ShoppingBag, label: 'Käufe', description: 'Kaufhistorie & Credits' },
    { href: '/dashboard/general', icon: Settings, label: 'Allgemein', description: 'Account-Einstellungen' },
    { href: '/dashboard/security', icon: Shield, label: 'Sicherheit', description: 'Passwort & Account-Sicherheit' }
  ];

  if (isAdmin) {
    navItems.push({
      href: '/admin',
      icon: FolderCog,
      label: 'Admin',
      description: 'Anfragen verwalten'
    });
  }

  if (isOwner) {
    navItems.push({
      href: '/dashboard/owner',
      icon: Crown,
      label: 'Owner',
      description: 'Rollen & Team'
    });
  }

  if (hideSidebar) {
    return (
      <div className="flex flex-col min-h-[calc(100dvh-68px)] max-w-7xl mx-auto w-full bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-68px)] max-w-7xl mx-auto w-full bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 sticky top-0 z-[40]">
        <div className="flex items-center">
          <span className="font-semibold text-gray-900">Einstellungen</span>
        </div>
        <Button
          className="-mr-3"
          variant="ghost"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <X className="h-6 w-6 text-gray-700" />
          ) : (
            <Menu className="h-6 w-6 text-gray-700" />
          )}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden h-full">
        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-[55] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`w-72 bg-white lg:bg-white/60 lg:backdrop-blur-sm border-r border-gray-200 lg:block ${
            isSidebarOpen ? 'block' : 'hidden'
          } lg:relative absolute inset-y-0 left-0 z-[60] lg:z-10 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="h-full overflow-y-auto p-6">
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Navigation
              </h2>
              {user?.role && (
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                  Rolle: <span className="font-semibold">{user.role}</span>
                </p>
              )}
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        onClick={() => setIsSidebarOpen(false)}
                        className={`group relative flex items-start gap-3 p-4 rounded-xl transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200'
                            : 'bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 border border-gray-100 hover:border-orange-200 hover:shadow-md'
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                            isActive
                              ? 'bg-white/20'
                              : 'bg-orange-100 group-hover:bg-orange-200'
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${
                              isActive ? 'text-white' : 'text-orange-600'
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-900'}`}>
                            {item.label}
                          </p>
                          <p className={`text-xs mt-0.5 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                            {item.description}
                          </p>
                        </div>
                        {isActive && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
