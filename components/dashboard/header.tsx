'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Suspense, useState, useTransition, useEffect } from 'react';
import { Home, LogOut, Menu, User as UserIcon, LogIn, X } from 'lucide-react';
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
        <DropdownMenuItem className="cursor-pointer focus:bg-orange-50">
          <Link href="/dashboard" className="flex w-full items-center">
            <Home className="mr-2 h-4 w-4 text-orange-600" />
            <span className="font-medium">{t('nav.dashboard')}</span>
          </Link>
        </DropdownMenuItem>
        {user.role && (
          <DropdownMenuItem className="cursor-default opacity-80 bg-orange-50" disabled>
            <span className="text-sm">
              {t('roles.role')}: <span className="font-semibold">{t(`roles.${user.role as 'admin' | 'owner' | 'member'}`)}</span>
            </span>
          </DropdownMenuItem>
        )}
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
        { href: '/kaufen', label: t('nav.buy') },
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
              src="/logo_hero.png"
              alt="Karriereadler Logo"
              width={scrolled ? 140 : 160}
              height={scrolled ? 40 : 48}
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
              <div className="flex items-center">
                <Image src="/logo_hero.png" alt="Karriereadler Logo" width={140} height={40} />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                aria-label="Menü schließen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
            </nav>

            {/* Mobile CTA */}
            <div className="p-4 border-t border-gray-200">
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
                    className="block w-full px-6 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center font-semibold shadow-lg mb-3"
                  >
                    Jetzt Lebenslauf verbessern
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-6 py-4 rounded-xl bg-gray-100 text-gray-900 text-center font-semibold"
                  >
                    Zum Dashboard
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
