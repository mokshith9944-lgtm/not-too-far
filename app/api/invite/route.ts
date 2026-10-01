import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { recipientEmail, roomTitle, inviteLink } = await req.json();

    if (!recipientEmail || !inviteLink) {
      return NextResponse.json(
        { error: 'recipientEmail and inviteLink are required.' },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      // Graceful fallback for local development or demo without API key
      return NextResponse.json({
        success: true,
        message: 'Mock invite dispatched (set RESEND_API_KEY for live production email delivery)',
        preview: { recipientEmail, roomTitle, inviteLink },
      });
    }

    // Call Resend API directly with Edge Fetch
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Antigravity <noreply@antigravity.live>',
        to: [recipientEmail],
        subject: `🍿 You're invited to watch "${roomTitle}" on Antigravity!`,
        html: `
          <div style="background-color: #141414; color: #ffffff; font-family: sans-serif; padding: 32px; border-radius: 8px;">
            <h1 style="color: #E50914; margin-bottom: 8px;">ANTIGRAVITY</h1>
            <h2 style="color: #ffffff; margin-top: 0;">You're invited to a Synced Watch Party!</h2>
            <p style="color: #cccccc; font-size: 15px;">Your friend invited you to join a real-time synchronized cinema room for <strong>${roomTitle}</strong>.</p>
            <div style="margin: 24px 0;">
              <a href="${inviteLink}" style="background-color: #E50914; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; display: inline-block;">
                Join Watch Room
              </a>
            </div>
            <p style="color: #666666; font-size: 12px;">Ultra-low latency audio, video, and stream sync powered by Antigravity.</p>
          </div>
        `,
      }),
    });

    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to dispatch invite email' },
      { status: 500 }
    );
  }
}
