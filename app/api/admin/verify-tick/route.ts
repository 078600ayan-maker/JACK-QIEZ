import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { passcode, targetUid, tick } = body || {};

    const expectedSecret = process.env.ADMIN_TICK_SECRET || 'JACKQUIZ-ADMIN-2026';
    if (!passcode || String(passcode).trim() !== expectedSecret) {
      return NextResponse.json(
        { ok: false, error: 'Invalid Admin Verification Key. Only Admins can assign Red or Black ticks.' },
        { status: 403 }
      );
    }

    if (tick !== 'green' && tick !== 'red' && tick !== 'black') {
      return NextResponse.json({ ok: false, error: 'Invalid tick color.' }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      authorized: true,
      targetUid: targetUid || null,
      tick,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 });
  }
}
