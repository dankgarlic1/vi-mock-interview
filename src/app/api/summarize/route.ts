import { NextRequest, NextResponse } from 'next/server';
import { genAI } from '@/lib/GeminiClient';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { message: 'sessionId is required' },
        { status: 400 }
      );
    }

    // Check if session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { message: 'Session not found' },
        { status: 404 }
      );
    }

    // If session already has a summary, return it
    if (session.summary) {
      return NextResponse.json(
        {
          message: 'Summary already exists',
          summary: session.summary,
        },
        { status: 200 }
      );
    }

    const chats = await prisma.chat.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });

    if (!chats.length) {
      return NextResponse.json(
        { message: 'No chats found for this sessionId' },
        { status: 404 }
      );
    }

    const chatContent = chats
      .map((chat) => `${chat.sender}: ${chat.message}`)
      .join('\n');

    const prompt = `
You are a strict interview evaluator.

Interview:
${chatContent}

Give:

STRENGTHS:
What the candidate did well (with examples)

WEAKNESSES:
Where they struggled (be direct)

IMPROVEMENTS:
What they should study or fix

FINAL VERDICT:
2–3 lines, honest assessment

Rules:
- No fluff
- No corporate tone
- Be direct like a real interviewer
- Be brutally honest
- Give clear verdict dont be diplomatic
`;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
    });

    const summary = result.text;

    // Update session with summary
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: { summary },
    });

    console.log('Session summary generated:', updatedSession.id);

    return NextResponse.json(
      {
        message: 'Chat summary generated successfully',
        summary,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating chat summary:', error);
    return NextResponse.json(
      {
        message: 'Error summarizing the chat',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
