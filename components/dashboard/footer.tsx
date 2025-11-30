'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Linkedin, Music2 } from 'lucide-react';

import { useI18n } from '@/components/providers/i18n-provider';

export function DashboardFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  const navLinks = [
    { href: '/', label: t('footer.home') },
    { href: '/pricing', label: t('footer.pricing') },
    { href: '/leistungen', label: t('footer.services') },
    { href: '/contact', label: t('footer.contact') },
    { href: '/lebenslauf-schreiben-lassen', label: 'Lebenslauf schreiben lassen' },
    { href: '/anschreiben-schreiben-lassen', label: 'Anschreiben schreiben lassen' }
  ];

  const legalLinks = [
    { href: '/impressum', label: t('footer.imprint') },
    { href: '/datenschutz', label: t('footer.privacy') },
    { href: '/agb', label: 'AGB' },
    { href: '/widerrufsbelehrung', label: 'Widerrufsbelehrung' }
  ];

  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center">
            <Image
              src="/favicon.png"
              alt="Karriereadler"
              width={80}
              height={80}
              className="rounded-lg"
            />
            <p className="font-extrabold text-2xl text-gray-900 tracking-tight leading-none ml-2 sm:ml-3 relative z-10 bg-white/90 px-1 rounded">
              Karriereadler
            </p>
          </div>
          <p className="text-sm text-gray-600" suppressHydrationWarning>© {year} {t('footer.rights')}</p>
        </div>

        <div>
          <p className="font-semibold text-gray-900 mb-3">{t('footer.about')}</p>
          <div className="flex flex-col gap-2">
            {navLinks.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-gray-600 hover:text-orange-600">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="font-semibold text-gray-900 mb-3">{t('footer.contact')}</p>
          <div className="flex flex-col gap-2">
            {legalLinks.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-gray-600 hover:text-orange-600">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="font-semibold text-gray-900 mb-3">{t('footer.followUs')}</p>
          <div className="flex gap-4">
            <Link href="https://www.instagram.com" className="text-gray-600 hover:text-orange-600">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="https://www.tiktok.com" className="text-gray-600 hover:text-orange-600">
              <Music2 className="w-5 h-5" />
            </Link>
            <Link href="https://www.linkedin.com" className="text-gray-600 hover:text-orange-600">
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
