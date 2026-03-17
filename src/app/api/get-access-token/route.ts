import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = process.env.HEYGEN_API_KEY;

    const response = await fetch(
      'https://api.liveavatar.com/v1/sessions/token',
      {
        method: 'POST',
        headers: {
          'x-api-key': apiKey!,
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          avatar_id: '64b526e4-741c-43b6-a918-4e40f3261c7a',

          mode: 'FULL',

          interactivity_type: 'CONVERSATIONAL',

          avatar_persona: {
            language: 'en',

            prompt: `
You are an experienced interviewer representing Virtual Internships.

- Ask structured questions
- One question at a time
- No feedback during interview
- Keep under 50 words
- Be professional but warm
- Test candidates first principles heavily

Candidate info:
${body.candidateContext || 'No context provided'}
            `,

            opening_text:
              "Hi, welcome to your interview. Let's begin. Tell me about yourself.",
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
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
      sessionId: session.id,
      liveSessionId,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
