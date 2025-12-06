import { NextRequest, NextResponse } from 'next/server';
import { getUser, getOrdersByUserId } from '@/lib/db/queries';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse pagination params
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_SIZE), 10))
    );

    const { orders, total } = await getOrdersByUserId(user.id, { page, limit });
    const totalPages = Math.ceil(total / limit);

    // Return only the fields needed by the frontend
    const ordersResponse = orders.map(order => ({
      id: order.id,
      productType: order.productType,
      status: order.status,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      finishedFileUrl: order.finishedFileUrl,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    return NextResponse.json({
      orders: ordersResponse,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
