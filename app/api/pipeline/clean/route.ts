import { NextRequest, NextResponse } from 'next/server';
import { runDataCleaningPipeline, SAMPLE_RAW_BATCH, RawScrapePayload } from '@/lib/cleaningEngine';

export async function GET() {
  const result = runDataCleaningPipeline(SAMPLE_RAW_BATCH);
  return NextResponse.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    auditSummary: result.auditSummary,
    cleanedRecords: result.cleanedRecords,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawPayloads: RawScrapePayload[] = Array.isArray(body) ? body : body.records || SAMPLE_RAW_BATCH;
    const result = runDataCleaningPipeline(rawPayloads);
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      auditSummary: result.auditSummary,
      cleanedRecords: result.cleanedRecords,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to process cleaning pipeline' }, { status: 400 });
  }
}
