import { NextRequest, NextResponse } from 'next/server';
import { fetchSiliconAnalystsIntelligence } from '@/services/siliconAnalysts';

export async function GET(req: NextRequest) {
  const apiKey = process.env.SILICON_ANALYSTS_API_KEY;
  if (!apiKey) {
    console.error('[Semiconductor API] SILICON_ANALYSTS_API_KEY is missing in server environment.');
    return NextResponse.json({ success: false, error: 'API key unconfigured in server environment.' }, { status: 500 });
  }

  try {
    const data = await fetchSiliconAnalystsIntelligence(apiKey);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[Semiconductor API] Live fetch transaction failed:', error.message || error);
    return NextResponse.json({ success: false, error: error.message || 'Semiconductor Intelligence temporarily unavailable' }, { status: 502 });
  }
}
