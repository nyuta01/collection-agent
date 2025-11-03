import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Collection, Item } from '@/lib/collection';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * GET /api/collections/:id/items/search?q=query
 * Search items in a collection
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const collection = await Collection.get(id);

    // Get query parameter
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Missing query parameter: q' }, { status: 400 });
    }

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const itemAPI = Item(collection);
    const results = await itemAPI.search(query);

    return NextResponse.json({
      query,
      count: results.length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search items' },
      { status: 500 }
    );
  }
}
