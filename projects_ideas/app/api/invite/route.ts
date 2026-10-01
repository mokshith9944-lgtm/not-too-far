import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { email, roomId, roomTitle, inviteUrl } = await req.json();

    if (!email || !roomId) {
      return NextResponse.json({ error: 'Missing required invite fields' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;

    // If Resend API key is available, send official email
    if (apiKey && !apiKey.includes('dummy') && !apiKey.includes('12345')) {
      const resend = new Resend(apiKey);
      const fromEmail = process.env.EMAIL_FROM || 'Not Too Far <no-reply@nottoofar.app>';

      const emailResponse = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: `🎬 Watch Party Invite: "${roomTitle}" on Not Too Far`,
        html: `
          <div style="background-color: #141414; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; text-align: center; border-radius: 8px;">
            <div style="margin-bottom: 20px;">
              <span style="color: #E50914; font-weight: 800; font-size: 24px; letter-spacing: 2px;">NOT TOO FAR</span>
            </div>
            <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin-bottom: 12px;">You've been invited to a Live Watch Party!</h1>
            <p style="color: #aaaaaa; font-size: 14px; max-width: 480px; margin: 0 auto 24px auto;">
              Join your friend to watch <strong>${roomTitle}</strong> in real-time with sub-second synchronization and spatial WebRTC voice chat.
            </p>
            <div style="margin: 30px 0;">
              <a href="${inviteUrl}" style="background-color: #E50914; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; display: inline-block;">
                Join Synchronized Room
              </a>
            </div>
            <p style="color: #666666; font-size: 11px; margin-top: 40px;">
              Zero-drift synchronization powered by Supabase Realtime • Not Too Far
            </p>
          </div>
        `,
      });

      return NextResponse.json({ success: true, emailId: emailResponse.data?.id });
    }

    // In local dev/mock mode: return simulated success
    return NextResponse.json({
      success: true,
      simulated: true,
      message: `Simulated invite dispatched to ${email}`,
      inviteUrl,
    });
  } catch (error: any) {
    console.error('Error sending invite:', error);
    return NextResponse.json({ error: error.message || 'Failed to dispatch email' }, { status: 500 });
  }
}
