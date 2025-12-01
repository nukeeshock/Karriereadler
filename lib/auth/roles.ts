import { User } from '@/lib/db/schema';

/**
 * Check if user has admin privileges (admin or owner role)
 */
export function isAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.role === 'admin' || user.role === 'owner';
}

/**
 * Check if user has owner role
 */
export function isOwner(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.role === 'owner';
}

/**
 * Check if current user can access a specific order
 * - Admins can access any order
 * - Regular users can only access their own orders
 */
export function canAccessOrder(orderUserId: number, currentUser: User | null): boolean {
  if (!currentUser) return false;
  return isAdmin(currentUser) || orderUserId === currentUser.id;
}

