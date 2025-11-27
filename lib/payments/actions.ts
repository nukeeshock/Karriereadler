'use server';

import { redirect } from 'next/navigation';
import { createCustomerPortalSession } from './stripe';
import { withTeam } from '@/lib/auth/middleware';

// LEGACY: checkoutAction removed - app now uses /api/checkout for one-time payments
// export const checkoutAction = withTeam(async (formData, team) => {
//   const priceId = formData.get('priceId') as string;
//   await createCheckoutSession({ team: team, priceId });
// });

export const customerPortalAction = withTeam(async (_, team) => {
  const portalSession = await createCustomerPortalSession(team);
  redirect(portalSession.url);
});
