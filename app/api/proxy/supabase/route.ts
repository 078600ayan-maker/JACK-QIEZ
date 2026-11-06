import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_BASE_URL = 'https://igmgwqergzwbfqlyaufe.supabase.co/rest/v1';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || 'questions';
  
  // Clone params excluding 'path'
  const forwardParams = new URLSearchParams();
  searchParams.forEach((val, key) => {
    if (key !== 'path') forwardParams.append(key, val);
  });

  const targetUrl = `${SUPABASE_BASE_URL}/${path}?${forwardParams.toString()}`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        Accept: 'application/json',
        ...(process.env.SUPABASE_SERVICE_ROLE_KEY
          ? { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` }
          : {})
      },
      next: { revalidate: 300 }
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Supabase upstream error', status: res.status },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to proxy request to Supabase', message: err.message },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || 'user_sync';

  try {
    const body = await request.json();
    const targetUrl = `${SUPABASE_BASE_URL}/${path}`;

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(process.env.SUPABASE_SERVICE_ROLE_KEY
          ? { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` }
          : {})
      },
      body: JSON.stringify(body)
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Proxy mutation error', message: err.message },
      { status: 500 }
    );
  }
}
