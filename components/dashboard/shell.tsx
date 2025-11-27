'use client';

import { DashboardHeader } from './header';
import { DashboardFooter } from './footer';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen">
      <DashboardHeader />
      {children}
      <DashboardFooter />
    </section>
  );
}
