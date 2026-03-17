import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = process.env.HEYGEN_API_KEY;
    console.log('hekllo', apiKey);

    const response = await fetch(
      'https://api.liveavatar.com/v1/sessions/token',
      {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          avatar_id: '64b526e4-741c-43b6-a918-4e40f3261c7a',
          mode: 'LITE',
          interactivity_type: 'CONVERSATIONAL',
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || 'Failed to create session token');
    }

    const liveSessionId = data.data.session_id;

    const session = await prisma.session.create({
      data: {
        userId: body.userId,
        liveAvatarSessionId: liveSessionId,
      },
    });

    return NextResponse.json({
      token: data.data.session_token,
      sessionId: session.id, //DB session
      liveSessionId, //external session
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
