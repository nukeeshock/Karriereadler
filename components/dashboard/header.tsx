'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Suspense, useState, useTransition, useEffect } from 'react';
import {
  LogOut,
  Menu,
  User as UserIcon,
  LogIn,
  X,
  Settings,
  Shield,
  Activity,
  FileText,
  ShieldCheck,
  Users
} from 'lucide-react';
import useSWR, { mutate } from 'swr';
import { usePathname } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useI18n } from '@/components/providers/i18n-provider';
import { signOut } from '@/app/(login)/actions';
import { User } from '@/lib/db/schema';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const accountLinks = [
  { href: '/dashboard/orders', label: 'Meine Aufträge', icon: FileText },
  { href: '/dashboard/general', label: 'Account-Informationen', icon: Settings },
  { href: '/dashboard/security', label: 'Sicherheit', icon: Shield },
  { href: '/dashboard/activity', label: 'Aktivitäten', icon: Activity }
];

// Admin links - shown only for admin/owner roles
const adminLinks = [
  { href: '/admin/orders', label: 'Admin-Bereich', icon: ShieldCheck, roles: ['admin', 'owner'] as const },
  { href: '/dashboard/owner', label: 'Rollenverwaltung', icon: Users, roles: ['owner'] as const }
];

// Filter admin links based on user role
function getAdminLinksForRole(role: string | null | undefined) {
  if (!role) return [];
  return adminLinks.filter(link => (link.roles as readonly string[]).includes(role));
}

// NavLink mit Gradient-Underline
function NavLink({ href, children, active = false }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link
      href={href}
      className="group relative text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors duration-200"
    >
      <span className="relative z-10">{children}</span>
      <span
        className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300 ${
          active ? 'w-full opacity-100' : 'w-0 group-hover:w-full opacity-0 group-hover:opacity-100'
        }`}
      ></span>
    </Link>
  );
}

// User Menu für eingeloggte User
function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const { t } = useI18n();
  const [signingOut, startTransition] = useTransition();

  if (!user) return null;

  const handleSignOut = () => {
    startTransition(async () => {
      await mutate('/api/user', null, false);
      await signOut();
    });
  };

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="group relative w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:rotate-90 overflow-hidden"
          aria-label="User menu"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
          <span className="relative z-10 text-sm font-semibold transition-transform group-hover:scale-110 duration-300">
            {user.email?.charAt(0).toUpperCase()}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 z-[100] bg-white/95 backdrop-blur-sm border-orange-200">
        {user.role && (
          <DropdownMenuItem className="cursor-default opacity-80 bg-orange-50" disabled>
            <span className="text-sm">
              Status: <span className="font-semibold">{t(`roles.${user.role as 'admin' | 'owner' | 'member'}`)}</span>
            </span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {/* Admin Links - only for admin/owner */}
        {getAdminLinksForRole(user.role).length > 0 && (
          <>
            {getAdminLinksForRole(user.role).map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} className="flex items-center gap-2 cursor-pointer">
                    <Icon className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
          </>
        )}
        {accountLinks.map((item) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href} className="flex items-center gap-2 cursor-pointer">
                <Icon className="h-4 w-4 text-orange-600" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <button type="button" onClick={handleSignOut} className="flex w-full">
          <DropdownMenuItem className="w-full flex-1 cursor-pointer focus:bg-red-50">
            <LogOut className="mr-2 h-4 w-4 text-red-600" />
            <span className="font-medium">{signingOut ? t('nav.signOut') + '…' : t('nav.signOut')}</span>
          </DropdownMenuItem>
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DashboardHeader() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useI18n();
  const pathname = usePathname();

  // Scroll-Listener für Header-Schrumpf-Effekt
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation Items
  const navItems = user
    ? [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/leistungen', label: 'Leistungen' },
        { href: '/contact', label: t('nav.contact') }
      ]
    : [
        { href: '/leistungen', label: 'Leistungen' },
        { href: '/pricing', label: t('nav.pricing') },
        { href: '/contact', label: t('nav.contact') }
      ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 transition-all duration-300 ${
          scrolled ? 'h-14 shadow-md' : 'h-17 shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-8">
          {/* Logo + Branding */}
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity flex-shrink-0">
            <Image
              src="/KARRIEREADLER_logo_Kunterserstrich.png"
              alt="Karriereadler Logo"
              width={scrolled ? 150 : 180}
              height={scrolled ? 30 : 35}
              className="transition-all duration-300"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 flex-1">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href} active={pathname === item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop CTA + User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                    <UserIcon className="w-6 h-6" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 z-[100] bg-white/95 backdrop-blur-sm">
                  <DropdownMenuItem asChild>
                    <Link href="/sign-up" className="flex items-center cursor-pointer">
                      <UserIcon className="mr-2 h-4 w-4 text-orange-600" />
                      <div>
                        <div className="font-semibold">Registrieren</div>
                        <div className="text-xs text-gray-500">Neues Konto</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/sign-in" className="flex items-center cursor-pointer">
                      <LogIn className="mr-2 h-4 w-4" />
                      <div>
                        <div className="font-medium">Anmelden</div>
                        <div className="text-xs text-gray-500">Bereits registriert?</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link
                  href="/kaufen"
                  className="group relative px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  <span className="relative z-10">Jetzt Lebenslauf verbessern</span>
                </Link>
                <Suspense fallback={<div className="h-10 w-10" />}>
                  <UserMenu />
                </Suspense>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            aria-label="Menü öffnen"
            aria-expanded={mobileMenuOpen}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Spacer damit Content nicht unter fixed Header rutscht */}
      <div className={`transition-all duration-300 ${scrolled ? 'h-14' : 'h-17'}`} />

      {/* Mobile Fullscreen Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white md:hidden">
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between px-4 h-17 border-b border-gray-200">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center py-2 -ml-2 pl-2 pr-4 hover:opacity-80 transition-opacity active:scale-95"
              >
                <Image
                  src="/KARRIEREADLER_logo_Kunterserstrich.png"
                  alt="Karriereadler Logo"
                  width={160}
                  height={32}
                />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-12 h-12 -mr-2 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors active:scale-95"
                aria-label="Menü schließen"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* User Info (if logged in) */}
            {user && (
              <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-md">
                    <span className="text-lg font-semibold">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-gray-600 truncate">{user.email}</p>
                    {user.role && (
                      <p className="text-xs text-orange-600 font-medium mt-0.5">
                        {t(`roles.${user.role as 'admin' | 'owner' | 'member'}`)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Nav Links */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                    pathname === item.href
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {/* Admin Links for Mobile - only for admin/owner */}
              {user && getAdminLinksForRole(user.role).length > 0 && (
                <div className="pt-6 mt-4 border-t border-gray-200 space-y-2">
                  <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide px-1">
                    Administration
                  </p>
                  {getAdminLinksForRole(user.role).map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname?.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
                          isActive
                            ? 'bg-purple-50 text-purple-700 border-purple-100'
                            : 'text-gray-700 border-transparent hover:bg-purple-50'
                        }`}
                      >
                        <Icon className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
              {user && (
                <div className="pt-6 mt-4 border-t border-gray-200 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
                    Mein Konto
                  </p>
                  {accountLinks.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname?.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
                          isActive
                            ? 'bg-orange-50 text-orange-700 border-orange-100'
                            : 'text-gray-700 border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </nav>

            {/* Mobile CTA */}
            <div className="p-4 border-t border-gray-200 space-y-2">
              {!user ? (
                <div className="flex gap-2">
                  <Link
                    href="/sign-up"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-900 text-center font-medium"
                  >
                    Registrieren
                  </Link>
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-900 text-center font-medium"
                  >
                    Anmelden
                  </Link>
                </div>
              ) : (
                <>
                  <Link
                    href="/kaufen"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-6 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center font-semibold shadow-lg"
                  >
                    Jetzt Lebenslauf verbessern
                  </Link>
                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await mutate('/api/user', null, false);
                      await signOut();
                    }}
                    className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Abmelden</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
