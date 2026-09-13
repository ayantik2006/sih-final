import { NextResponse } from 'next/server';
import { INITIAL_INDEX_DATA, ELASTICITY_DATA } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json({
    success: true,
    indexTrend: INITIAL_INDEX_DATA,
    elasticityCurve: ELASTICITY_DATA,
    backtestSummary: {
      daysBacktested: 30,
      correlationWithDGCA: 0.892,
      evaluationMetric: 'MAPE (Mean Absolute % Error)',
      mapeValue: 3.12,
    },
  });
}
