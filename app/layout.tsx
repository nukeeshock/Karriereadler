import './globals.css';
import type { Metadata, Viewport } from 'next';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import '@/lib/server-disable-localstorage';
import Script from 'next/script';
import AppProviders from './providers';

export const metadata: Metadata = {
  title: 'Karriereadler – Manuelle Lebensläufe & Anschreiben vom Profi',
  description:
    'Karriereadler erstellt deinen Lebenslauf und dein Anschreiben manuell: individuelle Beratung, klare Texte, professionelles Ergebnis.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.png?v=2', type: 'image/png', sizes: '512x512' },
      { url: '/favicon.png?v=2', type: 'image/png', sizes: '192x192' },
      { url: '/favicon.ico?v=2', sizes: '48x48' }
    ],
    apple: [
      { url: '/favicon.png?v=2', sizes: '180x180', type: 'image/png' },
      { url: '/favicon.png?v=2', sizes: '167x167', type: 'image/png' },
      { url: '/favicon.png?v=2', sizes: '152x152', type: 'image/png' },
      { url: '/favicon.png?v=2', sizes: '120x120', type: 'image/png' }
    ],
    shortcut: '/favicon.png?v=2',
    other: [
      { rel: 'apple-touch-icon-precomposed', url: '/favicon.png?v=2' }
    ]
  },
  openGraph: {
    title: 'Karriereadler – Manuelle Lebensläufe & Anschreiben vom Profi',
    description: 'Karriereadler erstellt deinen Lebenslauf und dein Anschreiben manuell: individuelle Beratung, klare Texte, professionelles Ergebnis.',
    url: 'https://karriereadler.com',
    siteName: 'Karriereadler',
    images: [
      {
        url: '/logo_adler_notagline.png',
        width: 1200,
        height: 630,
        alt: 'Karriereadler Logo'
      }
    ],
    locale: 'de_DE',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Karriereadler – Manuelle Lebensläufe & Anschreiben vom Profi',
    description: 'Karriereadler erstellt deinen Lebenslauf und dein Anschreiben manuell: individuelle Beratung, klare Texte, professionelles Ergebnis.',
    images: ['/logo_adler_notagline.png']
  },
  appleWebApp: {
    capable: true,
    title: 'Karriereadler',
    statusBarStyle: 'default'
  }
};

export const viewport: Viewport = {
  maximumScale: 1
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Await the data before passing to SWR fallback to prevent hydration issues
  const [user, team] = await Promise.all([
    getUser(),
    getTeamForUser()
  ]);

  return (
    <html
      lang="de"
      className="bg-white text-black font-sans"
      suppressHydrationWarning
    >
      <body className="min-h-[100dvh] bg-gray-50" suppressHydrationWarning>
        <Script id="strip-gchrome-attrs" strategy="beforeInteractive">
          {`
            (function() {
              const stripAttrs = (node) => {
                if (!node || !node.attributes) return;
                for (const attr of Array.from(node.attributes)) {
                  if (attr.name && attr.name.startsWith('__gchrome_')) {
                    node.removeAttribute(attr.name);
                  }
                }
              };

              const stripTree = (root) => {
                if (!root) return;
                stripAttrs(root);
                for (const child of Array.from(root.children || [])) {
                  stripTree(child);
                }
              };

              // Initial pass
              stripTree(document.documentElement);

              // Observe mutations to strip new injections
              const observer = new MutationObserver((mutations) => {
                for (const m of mutations) {
                  if (m.target) stripAttrs(m.target);
                  for (const node of Array.from(m.addedNodes || [])) {
                    stripTree(node);
                  }
                }
              });

              observer.observe(document.documentElement, {
                attributes: true,
                childList: true,
                subtree: true
              });
            })();
          `}
        </Script>
        <SWRConfig
          value={{
            fallback: {
              '/api/user': user,
              '/api/team': team
            }
          }}
        >
          <AppProviders>{children}</AppProviders>
        </SWRConfig>
      </body>
    </html>
  );
}
