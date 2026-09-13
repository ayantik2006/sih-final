import { NextRequest, NextResponse } from 'next/server';
import { MOCK_RAW_FARES } from '@/lib/mockData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({ format: 'json' }));
    const format = body.format || 'json';

    if (format === 'csv') {
      let csv = "Date,Route,Airline,Window,BaseFare,Tax,TotalFare,Source\n";
      MOCK_RAW_FARES.forEach((r) => {
        csv += `${r.date},${r.route},${r.airline},${r.bookingWindow},${r.baseFare},${r.tax},${r.totalFare},${r.source}\n`;
      });
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="apix_export.csv"',
        },
      });
    }

    return NextResponse.json({
      success: true,
      exportedAt: new Date().toISOString(),
      recordCount: MOCK_RAW_FARES.length,
      records: MOCK_RAW_FARES,
    });
  } catch {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
