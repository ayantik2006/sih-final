import { NextRequest, NextResponse } from 'next/server';
import { MOCK_RAW_FARES } from '@/lib/mockData';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const route = searchParams.get('route');
  const airline = searchParams.get('airline');

  let results = MOCK_RAW_FARES;
  if (route && route !== 'ALL') {
    results = results.filter((f) => f.route === route);
  }
  if (airline && airline !== 'ALL') {
    results = results.filter((f) => f.airline === airline);
  }

  return NextResponse.json({
    success: true,
    count: results.length,
    data: results,
  });
}
