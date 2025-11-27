'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CoverLetterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/cover-letter/new');
  }, [router]);

  return (
    <section className="flex-1 p-4 lg:p-8 flex items-center justify-center">
      <p className="text-gray-500">Weiterleitung...</p>
    </section>
  );
}
