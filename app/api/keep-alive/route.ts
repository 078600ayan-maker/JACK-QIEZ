import { NextResponse } from 'next/server';

/**
 * 24/7 Zero-Sleep Keep-Alive Edge Ping Endpoint
 * Prevents Vercel serverless cold-starts & Supabase REST endpoint idle pauses.
 */
export async function GET() {
  const timestamp = new Date().toISOString();
  let supabaseStatus = 'untested';

  try {
    const start = Date.now();
    const res = await fetch('https://igmgwqergzwbfqlyaufe.supabase.co/rest/v1/', {
      headers: {
        Accept: 'application/json'
      },
      next: { revalidate: 0 }
    });
    const latency = Date.now() - start;
    supabaseStatus = `connected (HTTP ${res.status}, ${latency}ms)`;
  } catch (err: any) {
    supabaseStatus = `degraded: ${err.message}`;
  }

  return NextResponse.json({
    status: 'online',
    uptime: '24/7 zero-sleep active',
    service: 'JACK Quiz Master Backend',
    cron: '5-minute heartbeat active',
    supabase: supabaseStatus,
    timestamp
  }, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
