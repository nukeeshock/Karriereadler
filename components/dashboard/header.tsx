'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Suspense, useState, useTransition } from 'react';
import { Home, LogOut } from 'lucide-react';
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useI18n } from '@/components/providers/i18n-provider';
import { signOut } from '@/app/(login)/actions';
import { User } from '@/lib/db/schema';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const { t } = useI18n();
  const router = useRouter();
  const [signingOut, startTransition] = useTransition();

  if (!user) {
    return (
      <Button asChild className="hidden md:inline-flex rounded-full bg-orange-500 hover:bg-orange-600">
        <Link href="/sign-up">{t('nav.signUp')}</Link>
      </Button>
    );
  }

  const handleSignOut = () => {
    startTransition(async () => {
      // Optimistically clear cached user for instant UI change
      await mutate('/api/user', null, false);
      // signOut() now handles redirect to /sign-in
      await signOut();
    });
  };

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9">
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback>
            {user.email
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1 z-[100]">
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/dashboard" className="flex w-full items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>{t('nav.dashboard')}</span>
          </Link>
        </DropdownMenuItem>
        {user.role && (
          <DropdownMenuItem className="cursor-default opacity-80" disabled>
            {t('roles.role')}: {t(`roles.${user.role as 'admin' | 'owner' | 'member'}`)}
          </DropdownMenuItem>
        )}
        <button type="button" onClick={handleSignOut} className="flex w-full">
          <DropdownMenuItem className="w-full flex-1 cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>{signingOut ? t('nav.signOut') + '…' : t('nav.signOut')}</span>
          </DropdownMenuItem>
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DashboardHeader() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useI18n();

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center hover:opacity-80 transition-opacity min-w-0"
        >
          <Image
            src="/favicon.png"
            alt="Karriereadler"
            width={140}
            height={140}
            className="h-24 sm:h-28 w-auto flex-shrink-0"
            priority
          />
          <span className="text-3xl sm:text-4xl font-black leading-none tracking-tight bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400 bg-clip-text text-transparent drop-shadow-sm truncate ml-2 sm:ml-3 relative z-10">
            Karriereadler
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-5">
          {user ? (
            <>
              <Link
                href="/cv"
                className="text-gray-700 hover:text-orange-600 font-medium transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-105"
              >
                {t('nav.cv')}
              </Link>
              <Link
                href="/cover-letter"
                className="text-gray-700 hover:text-orange-600 font-medium transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-105"
              >
                {t('nav.coverLetter')}
              </Link>
              <Link
                href="/dashboard/buy"
                className="text-gray-700 hover:text-orange-600 font-medium transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-105"
              >
                {t('nav.buy')}
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-orange-600 font-medium transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-105"
              >
                {t('nav.contact')}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/leistungen"
                className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
              >
                Leistungen
              </Link>
              <Link
                href="/pricing"
                className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
              >
                {t('nav.pricing')}
              </Link>
              <Link
                href="/sign-in"
                className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
              >
                {t('nav.signIn')}
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
              >
                {t('nav.contact')}
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
          >
            <span className="sr-only">Toggle menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M4 12h16"></path>
              <path d="M4 18h16"></path>
              <path d="M4 6h16"></path>
            </svg>
          </button>

          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {user ? (
              <>
                <Link
                  href="/cv"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.cv')}
                </Link>
                <Link
                  href="/cover-letter"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.coverLetter')}
                </Link>
                <Link
                  href="/dashboard/buy"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.buy')}
                </Link>
                <Link
                  href="/contact"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.contact')}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/leistungen"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Leistungen
                </Link>
                <Link
                  href="/pricing"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.pricing')}
                </Link>
                <Link
                  href="/sign-in"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.signIn')}
                </Link>
                <Link
                  href="/contact"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.contact')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
