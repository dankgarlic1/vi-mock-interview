import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { $Enums } from '@prisma/client';
import { genAI } from '@/lib/GeminiClient';

export async function POST(req: NextRequest) {
  try {
    const { message, contexts, metadata } = await req.json();

    const isSmallTalk =
      !message ||
      message.trim().length < 10 ||
      ['hi', 'hello', 'hey'].includes(message.toLowerCase());

    if (
      !process.env.GEMINI_API_KEY &&
      !process.env.NEXT_PUBLIC_GEMINI_API_KEY
    ) {
      throw new Error('Gemini API key is not configured');
    }

    let prompt = '';

    const hasContext = contexts && contexts.length > 0;

    if (isSmallTalk || !hasContext) {
      prompt = `
You are a friendly but professional interview assistant.

User said: "${message}"

Respond naturally like a human:
- Greet them
- Ask what role they are preparing for
- Offer to start a mock interview

Keep it short.
`;
    } else {
      prompt = `
you are an expert interview coach at VI Mock Interview Agent, specializing in technical and behavioral interview preparation. 
I have found ${metadata?.totalResults || 'several'} relevant interview questions and scenarios that might be helpful for the user's query.

Here are the detailed interview resources:
${contexts.join('\n---\n')}

User Query: ${message}

Based on these resources and the user's query, please provide a response that:
1. Directly addresses the user's specific interview question or concern
2. References relevant interview techniques or strategies from our database
3. Highlights key tips that match the user's situation (technical skills, behavioral examples, etc.)
4. Explains why these approaches would be effective
5. Suggests next steps (like practice questions or follow-up preparation)
6. If relevant, mentions any unique interview scenarios or company-specific advice
7. Organizes information in clear sections
8. Uses bullet points for lists
9. Highlights key details in bold

Remember to:
- Be specific when referencing interview techniques and their applications
- Maintain a professional yet encouraging tone
- Acknowledge if some information is not available
- Suggest alternatives if the exact match isn't available
- Encourage the user to practice and ask follow-up questions about specific scenarios

Response:`;
    }

    const result = await genAI.models.generateContentStream({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
    });

    // Create a readable stream
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result) {
            const text = chunk.text || '';
            controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (error) {
          console.error('Error in stream processing:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Streaming Error:', error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const chatmsg = req.nextUrl.searchParams.get('chatmsg');
    const sender = req.nextUrl.searchParams.get('sender');
    const sessionId = req.nextUrl.searchParams.get('sessionId');
    if (!chatmsg || !sender || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required parameters: chatmsg, sender, or sessionId' },
        { status: 400 }
      );
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        chats: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    // console.log('sender', sender);

    const chat = await prisma.chat.create({
      data: {
        sessionId: sessionId,
        sender: sender as $Enums.SenderType,
        message: chatmsg,
      },
    });

    return NextResponse.json({ success: true, chat, session }, { status: 200 });
  } catch (error) {
    console.error('Error handling GET request:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 }
    );
  }
}
