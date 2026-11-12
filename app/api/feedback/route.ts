import { NextRequest, NextResponse } from 'next/server';

/**
 * Feedback & Email Organizer API:
 * Tags every app feedback / bug / live-call note with `[JackQuiz-Feedback]`
 * and folder metadata (`JackQuiz_App_Feedback`) so all emails auto-sort into ONE folder.
 * Automatically sends via Resend if `RESEND_API_KEY` + `FEEDBACK_RECEIVER_EMAIL` are set on server,
 * and always returns structured payload + pre-tagged `mailtoHref` fallback.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      uid = 'guest',
      userName = 'JAC Scholar',
      userEmail = '',
      rating = 5,
      category = 'Live Calling & Tutor',
      subject = 'General',
      chapter = 'General',
      message = '',
    } = body;

    const cleanMsg = String(message || '').trim();
    if (!cleanMsg) {
      return NextResponse.json({ ok: false, error: 'Feedback message cannot be empty.' }, { status: 400 });
    }

    const receiverEmail = (process.env.FEEDBACK_RECEIVER_EMAIL || '').trim();
    const folderTag = '[JackQuiz-Feedback]';
    const folderName = 'JackQuiz_App_Feedback';
    const emailSubject = `${folderTag} [${category}] ${rating}★ from ${userName} (${subject})`;

    const emailBody = [
      `Folder Label: ${folderName}`,
      `Student: ${userName} (${uid})`,
      `Student Email: ${userEmail || 'N/A'}`,
      `Rating: ${rating}/5 Stars`,
      `Category: ${category}`,
      `Subject / Chapter: ${subject} — ${chapter}`,
      `Timestamp: ${new Date().toISOString()}`,
      '',
      'Feedback Message:',
      cleanMsg,
    ].join('\n');

    let deliveredViaEmail = false;
    const resendKey = (process.env.RESEND_API_KEY || '').trim();

    if (resendKey && receiverEmail) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: process.env.FEEDBACK_FROM_EMAIL || 'Jack Quiz <onboarding@resend.dev>',
            to: [receiverEmail],
            subject: emailSubject,
            text: emailBody,
          }),
        });
        deliveredViaEmail = res.ok;
      } catch {
        deliveredViaEmail = false;
      }
    }

    const mailtoHref = receiverEmail
      ? `mailto:${encodeURIComponent(receiverEmail)}?subject=${encodeURIComponent(
          emailSubject
        )}&body=${encodeURIComponent(emailBody)}`
      : `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    return NextResponse.json({
      ok: true,
      deliveredViaEmail,
      folderName,
      folderTag,
      receiverConfigured: Boolean(receiverEmail),
      mailtoHref,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Feedback error' },
      { status: 500 }
    );
  }
}
