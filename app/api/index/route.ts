import { NextResponse } from 'next/server';
import { INITIAL_INDEX_DATA } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json(
    {
      status: 'success',
      apiVersion: 'v1.0',
      publisher: 'Ministry of Statistics & Programme Implementation (MoSPI)',
      basePeriod: '2025-01-01=100',
      latestIndex: {
        date: '2026-09-14',
        apixValue: 102.45,
        changeFromYesterdayPercent: 1.2,
        dgcaBenchmark: 102.1,
        dgcaCorrelationCoefficient: 0.892,
        mapePercent: 3.12,
        formula: 'DGCA Passenger-Weighted Fisher Ideal Index',
      },
      recentPoints: INITIAL_INDEX_DATA,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    }
  );
}
