import { getStudentById } from "@/helper";
import OpenAI from "openai";

export class OpenAIAssistant {
  private client: OpenAI;
  private conversationHistory: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
  private fallbackQuestionIndex: number = 0;
  private fallbackQuestions: string[] = [
    "Hello! I'm excited to meet with you today. I'm a representative from Virtual Internships, and I'll be conducting your interview. Let's start with: Tell me about yourself.",
    "That's great! Can you walk me through a recent project you've worked on and what technologies you used?",
    "Interesting! How do you typically approach problem-solving when you encounter a challenging technical issue?",
    "Tell me about a time when you had to learn a new technology or framework quickly. How did you go about it?",
    "What interests you most about this particular role and why did you choose this career path?",
    "How do you stay updated with the latest trends and technologies in your field?",
    "Describe a situation where you had to work as part of a team. What was your role and how did you contribute?",
    "What do you consider your biggest strength as a developer, and can you give me an example?",
    "Tell me about a mistake you made in a project and how you handled it.",
    "Where do you see yourself in the next few years, and what skills would you like to develop?",
    "Thank you for sharing all of that with me. Do you have any questions about the role or our company?"
  ];

  constructor(private userId: string) {
    this.client = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
      dangerouslyAllowBrowser: true,
    });
  }

  private getNextFallbackQuestion(): string {
    const question = this.fallbackQuestions[this.fallbackQuestionIndex];
    this.fallbackQuestionIndex = (this.fallbackQuestionIndex + 1) % this.fallbackQuestions.length;
    return question;
  }

  async initialize() {
    // Fetch student details during initialization
    let candidateDetails = "";
    try {
      const res = await getStudentById(this.userId);
      candidateDetails = JSON.stringify(res, null, 2); // Format details for readability
    } catch (error) {
      console.error("Error fetching candidate details for system prompt:", error);
      candidateDetails = "No additional context is available for this candidate.";
    }

    // Initialize system message with candidate details
  this.conversationHistory.push({
  role: "system",
  content: `
    You are an experienced interviewer representing a host company for Virtual Internships. Your role is to simulate a realistic and supportive interview for an intern applying for a remote internship. You ask structured, relevant questions based on the candidate's selected role (BACKEND ENGINEER, FRONTEND ENGINEER, or DEVOPS), and assess their soft skills, communication, and role-specific thinking.

    **PERSONA DETAILS:**
    - You are professional, clear, and conversational — not robotic
    - You care about mentoring young talent and helping them grow
    - You evaluate based on content quality, structure, clarity, and confidence
    - You give brief, encouraging follow-ups when appropriate
    - You ask 3–5 role-relevant questions, increasing slightly in difficulty

    **INTERVIEW FLOW:**
    1. Greet the intern and introduce yourself as a representative from Virtual Internships
    2. Ask a general opening question (e.g., "Tell me about yourself")
    3. Move into 2–3 role-specific behavioral or scenario-based questions
    4. Conclude with a reflective or open-ended question (e.g., "Why this role?")
    5. End the call with a polite, encouraging closing message

    **ROLE-SPECIFIC QUESTION EXAMPLES:**

    **BACKEND ENGINEER:**
    - "Describe your experience with server-side technologies or databases"
    - "How would you handle API rate limiting in a high-traffic application?"
    - "Walk me through debugging a slow database query"

    **FRONTEND ENGINEER:**
    - "Tell me about a challenging UI/UX problem you've solved"
    - "How do you ensure cross-browser compatibility in your projects?"
    - "Explain how you would optimize a slow-loading web page"

    **DEVOPS:**
    - "Describe your experience with deployment pipelines or automation"
    - "How would you handle a production system outage?"
    - "Explain the difference between containers and virtual machines"

    **CONSTRAINTS:**
    - Keep each question under 50 words
    - Do NOT give feedback during the interview
    - Pause between each question to wait for a response
    - Ask ONE question at a time and wait for complete answer

    **TONE:**
    - Supportive, curious, and slightly challenging
    - Like a real manager who wants to see them succeed
    - Professional but warm and encouraging

    **CANDIDATE INFORMATION:**
    ${candidateDetails}
  `,
});

    return this;
  } 

  // Get an initial interview question to start the session
  async getInitialQuestion(): Promise<string> {
    try {
      const completion = await this.client.chat.completions.create({
        messages: [
          ...this.conversationHistory,
          {
            role: "user",
            content: "I'm ready to start my interview session. Please begin."
          },
          {
            role: "system",
            content: "Follow the interview flow: Start by greeting the intern and introducing yourself as a representative from Virtual Internships. Then ask a general opening question like 'Tell me about yourself'. Keep it under 50 words and be warm and professional."
          }
        ],
        model: "llama-3.3-70b-versatile",
        max_tokens: 80,
        temperature: 0.7,
      });

      const responseText = 
        completion.choices[0]?.message?.content || 
        "Hello! I'm excited to meet with you today. I'm a representative from Virtual Internships, and I'll be conducting your interview. Let's start with: Tell me about yourself.";

      // Add this to conversation history
      this.conversationHistory.push({
        role: "user",
        content: "I'm ready to start my interview session. Please begin."
      });
      
      this.conversationHistory.push({
        role: "assistant", 
        content: responseText
      });

      return responseText;
    } catch (error) {
      console.error("Error getting initial question:", error);
      return "Hello! I'm excited to meet with you today. I'm a representative from Virtual Internships, and I'll be conducting your interview. Let's start with: Tell me about yourself.";
    }
  }

  // Get response for interview coaching
async getResponse(userMessage: string, interviewContexts: string[]): Promise<string> {
  try {
    // Add relevant interview contexts if available
    if (interviewContexts.length > 0) {
                console.log('Adding interview contexts:', interviewContexts.length);
                this.conversationHistory.push({
                    role: "system",
                    content: `Here are relevant interview questions and resources from our database:
${interviewContexts.join("\n\n")}

Use these to ask more targeted role-specific questions for the candidate.`,
                });
    }
    
     console.log(`conversation history length: ${this.conversationHistory.length}`);

    const completion = await this.client.chat.completions.create({
      messages: [
        ...this.conversationHistory,
        {
          role: "user",
          content: userMessage
        },
        {
          role: "system", 
          content: `CRITICAL: Do NOT give feedback during the interview. Simply ask the next question in your interview flow. Keep questions under 50 words. Ask ONE question at a time and wait for their complete response. Be supportive and professional.`
        }
      ],
      model: "llama-3.3-70b-versatile",
      max_tokens: 80,
      temperature: 0.7,
    });

    const responseText = 
      completion.choices[0]?.message?.content || 
      "Thank you for sharing. Now, tell me about a challenging project you've worked on recently.";

    // Add the conversation to history for context
    this.conversationHistory.push({
      role: "user",
      content: userMessage
    });
    
    this.conversationHistory.push({
      role: "assistant", 
      content: responseText
    });

    return responseText;
  } catch (error) {
    console.error("Groq API Error:", error);
    const fallbackQuestion = this.getNextFallbackQuestion();
    
    // Still add to conversation history even with fallback
    this.conversationHistory.push({
      role: "user",
      content: userMessage
    });
    
    this.conversationHistory.push({
      role: "assistant", 
      content: fallbackQuestion
    });
    
    return fallbackQuestion;
  }
  }
  
async getAdditionalContext(userMessage: string): Promise<{
  resources: string[];
  suggestedQuestions: string[];
}> {
  try {
    const completion = await this.client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
          You are an expert at generating interview preparation resources and follow-up questions. 
          Based on the user's interview-related query, provide:
          
          1. **Resources**: 2-3 highly relevant and credible online resources (specific website names or platforms)
          2. **Questions**: 3-4 practical follow-up questions the candidate might want to explore
          
          Guidelines:
          - Resources should be specific to interview preparation (LeetCode, InterviewBit, etc.)
          - Questions should help the candidate dig deeper into interview topics
          - Focus on actionable items that improve interview performance
          - Questions should be from the candidate's perspective asking an interview coach

          Format your response as:
          Resources:
          [List 2-3 specific platforms/resources]
          
          Questions:
          [List 3-4 follow-up questions]
          `,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      model: "llama-3.3-70b-versatile",
      max_tokens: 250,
      temperature: 0.6,
    });

    const responseText =
      completion.choices[0]?.message?.content ||
      "No additional context available.";

    // Extract resources - look for common interview prep platforms
    const resourceLines = responseText.split('\n').filter(line => 
      line.includes('Resources:') || 
      line.toLowerCase().includes('leetcode') ||
      line.toLowerCase().includes('hackerrank') ||
      line.toLowerCase().includes('interviewbit') ||
      line.toLowerCase().includes('codewars') ||
      line.toLowerCase().includes('glassdoor') ||
      line.toLowerCase().includes('pramp') ||
      (line.trim().startsWith('-') && line.toLowerCase().includes('.com'))
    );
    
    const resources = resourceLines
      .map(line => line.replace(/^Resources:/, '').replace(/^-\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 3);

    // Extract questions
    const questionStartIndex = responseText.indexOf("Questions:");
    const questionsText = questionStartIndex > -1 ? responseText.slice(questionStartIndex) : responseText;
    const suggestedQuestions = questionsText
      .split("\n")
      .filter((line) => line.trim().length > 0 && line.includes('?'))
      .map((question) => question.replace(/^Questions:/, '').replace(/^-\s*/, '').trim())
      .slice(0, 4);

    return {
      resources: resources.length > 0 ? resources : ['LeetCode', 'HackerRank', 'Pramp'],
      suggestedQuestions: suggestedQuestions.length > 0 ? suggestedQuestions : [
        "What are common technical questions for my target role?",
        "How should I approach system design questions?", 
        "What coding patterns should I practice?",
        "How can I improve my problem-solving communication?"
      ],
    };
  } catch (error) {
    console.error("Additional Context Error:", error);
    return {
      resources: ['LeetCode', 'HackerRank', 'InterviewBit'],
      suggestedQuestions: [
        "What are the most common technical interview questions?",
        "How should I prepare for behavioral questions?",
        "What coding problems should I practice?",
        "How can I improve my technical communication skills?"
      ],
    };
  }
}

  // Method to reset conversation context
  resetContext() {
    this.conversationHistory = [
      {
        role: "system",
        content: "You are a technical interview coach helping candidates prepare for software engineering interviews.",
      },
    ];
    // Reset fallback question index when context is reset
    this.fallbackQuestionIndex = 0;
  }
}
