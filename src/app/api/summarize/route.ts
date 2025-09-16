import { NextRequest, NextResponse } from "next/server";
import { genAI } from "@/lib/GeminiClient";
import prisma from "@/lib/prisma";

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { message: "sessionId is required" },
        { status: 400 }
      );
    }

    // Check if session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { message: "Session not found" },
        { status: 404 }
      );
    }

    // If session already has a summary, return it
    if (session.summary) {
      return NextResponse.json(
        {
          message: "Summary already exists",
          summary: session.summary,
        },
        { status: 200 }
      );
    }

    const chats = await prisma.chat.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" }, 
    });

    if (!chats.length) {
      return NextResponse.json(
        { message: "No chats found for this sessionId" },
        { status: 404 }
      );
    }

    const chatContent = chats
      .map((chat) => `${chat.sender}: ${chat.message}`)
      .join("\n");

    const prompt = `
You are an expert interview coach analyzing a mock interview session. Based on the conversation below, provide a comprehensive performance analysis.

Interview conversation:
${chatContent}

Generate a professional interview performance summary with the following structure:

**STRENGTHS:**
Identify what the candidate did well during the interview, including technical knowledge, communication skills, problem-solving approach, and specific strong answers.

**AREAS FOR IMPROVEMENT:**
Highlight where the candidate struggled, including technical gaps, unclear explanations, questions they couldn't answer, or communication issues.

**RECOMMENDATIONS:**
Provide specific actionable advice on what they should study, practice, or improve for future interviews.

**OVERALL PERFORMANCE:**
Conclude with a balanced 2-3 sentence summary that captures their overall performance and key next steps.

Requirements:
- Write in a professional, direct tone
- Do not start with conversational words like "Okay" or "Let's analyze"
- Use clear paragraph format without bullet points or asterisks
- Be specific and reference actual examples from the conversation
- Focus on actionable, constructive feedback
- Keep the total response concise but comprehensive
`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text(); 

    // Update session with summary
    const updatedSession = await prisma.session.update({
        where: { id: sessionId },
        data: { summary },
    });
    
    console.log("Session summary generated:", updatedSession.id);

    return NextResponse.json(
      {
        message: "Chat summary generated successfully",
        summary,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating chat summary:", error);
    return NextResponse.json(
      { 
        message: "Error summarizing the chat", 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
