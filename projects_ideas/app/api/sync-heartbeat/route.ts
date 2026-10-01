import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const serverReceivedAt = Date.now();
    const body = await req.json();
    const { roomId, clientTimestamp, playhead, playbackState } = body;

    const roundTripTimeEstimate = clientTimestamp ? Math.max(0, serverReceivedAt - clientTimestamp) : 30;

    return NextResponse.json(
      {
        roomId,
        serverTimestamp: serverReceivedAt,
        clientTimestamp,
        estimatedRtt: roundTripTimeEstimate,
        oneWayLatency: roundTripTimeEstimate / 2,
        serverAuthoritativeTime: playhead,
        status: 'synchronized',
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
