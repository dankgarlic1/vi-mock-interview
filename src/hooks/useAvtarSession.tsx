import React from 'react';

import { useState, useEffect, useRef } from 'react';
import StreamingAvatar, {
  AvatarQuality,
  StartAvatarResponse,
  StreamingEvents,
  TaskMode,
  TaskType,
  VoiceEmotion,
} from '@heygen/streaming-avatar';
import { OpenAIAssistant } from '@/lib/openai-assistant';
import { getStudentById } from '@/helper';
import { useMemoizedFn, usePrevious } from 'ahooks';

import axios from 'axios';
import { storeChats, summarizeChat } from '@/lib/db';
import { toast } from 'sonner';
import { User } from '@/components/video-bot/AICounselingChatbot';

const useAvtarSession = ({ user }: { user: User }) => {
  const [messages, setMessages] = useState<
    { text: string; sender: 'user' | 'ai' }[]
  >([]);
  const [stream, setStream] = useState<MediaStream>();
  const [language] = useState<string>('en');
  const [data, setData] = useState<StartAvatarResponse>();
  const [text, setText] = useState<string>('');
  const [chatMode, setChatMode] = useState('text_mode');
  const [isUserTalking, setIsUserTalking] = useState(false);
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);
  const openaiAssistant = useRef<OpenAIAssistant | null>(null);
  const [debug, setDebug] = useState<string>();
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const sessionIdRef = useRef<string>('');
  const [subtitles, setSubtitles] = useState(''); // Array of subtitle parts
  const [additionalContext, setAdditionalContext] = useState<{
    resources: string[];
    suggestedQuestions: string[];
  }>({
    resources: [],
    suggestedQuestions: [],
  });
  let sentenceBuffer = '';
  const [isVoiceMode, setIsVoiceMode] = useState(false); // Voice mode toggle
  const [endSessionPage, setEndSessionPage] = useState(false);
  const [startLoading, setStartLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const pendingChatWritesRef = useRef<Promise<any>[]>([]);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  const userId = user.id;

  useEffect(() => {
    const handleBeforeUnload = (event: any) => {
      // Display a custom warning message before the page is unloaded
      event.preventDefault(); // For modern browsers
      event.returnValue = ''; // For older browsers
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  async function fetchAccessToken() {
    try {
      const response = await axios.post('/api/get-access-token', {
        userId: user.id,
      });
      console.log('Response:', response.data);
      setSessionId(response.data.sessionId);
      const token = response.data.token;
      return token;
    } catch (error) {
      toast.error(`Error Creating Session: ${error} Please try again `);
      console.error('Error fetching access token:', error);
      return '';
    }
  }

  async function fetchAccessTokenWithSpecificKey(apiKey: any) {
    try {
      const response = await axios.post(
        '/api/get-access-token',
        { userId: user.id },
        {
          headers: { 'x-api-key': apiKey },
        }
      );
      console.log('Response:', response.data);
      setSessionId(response.data.sessionId);
      return response.data.token;
    } catch (error) {
      console.error(`Error fetching token with key ${apiKey}:`, error);
      throw new Error(`Token fetch failed with key: ${apiKey}`);
    }
  }

  const HEYGEN_API_KEY = process.env.NEXT_PUBLIC_HEYGEN_API_KEY;

  // Diagnostic function to check HeyGen API connectivity
  async function testHeyGenConnection() {
    try {
      console.log('Testing HeyGen API connectivity...');
      const response = await fetch('https://api.heygen.com/v1/streaming.create_token', {
        method: 'POST',
        headers: {
          'x-api-key': HEYGEN_API_KEY || '',
        },
      });
      
      if (response.ok) {
        console.log('✅ HeyGen API connection successful');
        return true;
      } else {
        console.error('❌ HeyGen API connection failed:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ HeyGen API connection error:', error);
      return false;
    }
  }
  async function getCandidateDetails() {
    let candidateDetails = "";
    try {
      const res = await getStudentById(userId);
      candidateDetails = JSON.stringify(res, null, 2); // Format details for readability
    } catch (error) {
      console.error("Error fetching candidate details for system prompt:", error);
      candidateDetails = "No additional context is available for this candidate.";
    }
    return candidateDetails;
  }

  function setupAvatarEventListeners() {
    if (!avatar.current) return;

    console.log('Setting up avatar event listeners...');

    avatar.current?.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
      setLoading(false);
      console.log('Avatar started talking', e);
    });
    
    avatar.current?.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
      console.log('Avatar stopped talking', e);
    });
    
    avatar.current?.on(StreamingEvents.STREAM_DISCONNECTED, () => {
      console.log('Stream disconnected');
      if (isSessionActive) {
        toast.error('Avatar session disconnected unexpectedly');
        setIsSessionActive(false);
        setStream(undefined);
        setStartLoading(false);
      }
    });
    
    avatar.current?.on(StreamingEvents.STREAM_READY, (event) => {
      console.log('>>>>> Stream ready:', event.detail);
      setStream(event.detail);
      
      // Automatically start the interview with an initial question
      setTimeout(() => {
        if (isSessionActive) {
          startInterview();
        }
      }, 1000); // Small delay to ensure everything is ready
    });
    
    avatar.current?.on(StreamingEvents.USER_START, (event) => {
      console.log('>>>>> User started talking:', event);
      setIsUserTalking(true);
    });
    
    avatar.current?.on(StreamingEvents.USER_STOP, (event) => {
      console.log('>>>>> User stopped talking:', event);
      setIsUserTalking(false);
    });

    // Add event listener for processing user voice input
    avatar.current?.on(StreamingEvents.USER_TALKING_MESSAGE, async (e) => {
      const userMessage = e.detail.message;
      console.log('>>>>> User voice message received:', userMessage);
      console.log('>>>>> Current chat mode:', chatMode);
      console.log('>>>>> Is voice mode:', isVoiceMode);
      console.log('>>>>> OpenAI Assistant available:', !!openaiAssistant.current);
      
      // Process the voice input through voice-specific flow (no chat display)
      if (userMessage && userMessage.trim().length > 0) {
        console.log('>>>>> Processing voice message through handleVoiceSpeak...');
        await handleVoiceSpeak(userMessage.trim());
      } else {
        console.log('>>>>> Voice message was empty or invalid');
      }
    });

    avatar.current?.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (e) => {
      const message = e.detail.message;
      sentenceBuffer += message;
      console.log(`Avatar message: ${message}`);
    });
  }

  async function startSession() {
    try {
      setStartLoading(true);
      setIsSessionActive(false);
      console.log('Starting avatar session...');

      // Fetch token using the API key
      const token = await fetchAccessTokenWithSpecificKey(HEYGEN_API_KEY);
      console.log(`Token received, length: ${token?.length}`);

      // Initialize avatar first
      avatar.current = new StreamingAvatar({ token });
      console.log('StreamingAvatar instance created');

      // Set up event listeners BEFORE creating the avatar
      setupAvatarEventListeners();

      // Initialize OpenAI assistant
      openaiAssistant.current = new OpenAIAssistant(userId);
      await openaiAssistant.current.initialize();
      console.log('OpenAI assistant initialized');

      const candidateDetails = await getCandidateDetails();

      // Create and start avatar with error handling
      console.log('Creating avatar...');
      const res = await avatar.current.createStartAvatar({
        quality: AvatarQuality.Medium,
        avatarName: 'Wayne_20240711',
        language: language,
        disableIdleTimeout: true,
        voice: { rate: 2.0, emotion: VoiceEmotion.SERIOUS },
        knowledgeBase: `You are an experienced interviewer representing a host company for Virtual Internships. Your role is to simulate a realistic and supportive interview for an intern applying for a remote internship.

**PERSONA:**
- Professional, clear, and conversational — not robotic
- You care about mentoring young talent and helping them grow
- Supportive, curious, and slightly challenging
- Like a real manager who wants to see them succeed

**INTERVIEW APPROACH:**
- Ask structured, relevant questions based on the candidate's role (Backend, Frontend, or DevOps)
- Follow standard interview flow: greeting → opening question → role-specific questions → closing
- Keep each question under 50 words
- Ask ONE question at a time and wait for complete answer
- Do NOT give feedback during the interview

**CANDIDATE INFORMATION:**
${candidateDetails}

**IMPORTANT:** You will receive dynamic question contexts and guidance from the OpenAI assistant. Follow those recommendations for the most relevant and up-to-date interview questions.`,
      });
      
      console.log(`Avatar creation response:`, res);
      setData(res);
      setIsSessionActive(true);
      
      // Let the event listeners handle the stream setup
      // Stream should be ready when STREAM_READY event fires
      setStartLoading(false);

    } catch (error) {
      console.error('Failed to create avatar:', error);
      toast.error('Failed to create avatar. Please check your connection and try again.');
      setStartLoading(false);
      setIsSessionActive(false);
    }
  }

  // Function to start the interview with an initial question
  async function startInterview() {
    console.log('Starting interview with initial question...');
    
    try {
      if (!openaiAssistant.current) {
        openaiAssistant.current = new OpenAIAssistant(userId);
        await openaiAssistant.current.initialize();
        console.log('OpenAI assistant initialized');
      }

      // Get initial interview question
      const initialQuestion = await openaiAssistant.current.getInitialQuestion();
      console.log('Initial question:', initialQuestion);

      // Add to messages and speak
      setMessages((prev) => [...prev, { text: initialQuestion, sender: 'ai' }]);

      if (avatar.current && isSessionActive) {
        await avatar.current.speak({
          text: initialQuestion,
          taskType: TaskType.REPEAT,
          taskMode: TaskMode.SYNC,
        });
      }

      // Store the initial message
      if (sessionIdRef.current) {
        const write = storeChats({ sessionId: sessionIdRef.current, message: initialQuestion, sender: 'AI' });
        pendingChatWritesRef.current.push(write);
        await write.catch(() => {});
      }

    } catch (error) {
      console.error('Error starting interview:', error);
      const fallbackQuestion = "Hello! Welcome to your mock interview. What specific role are you interviewing for today?";
      setMessages((prev) => [...prev, { text: fallbackQuestion, sender: 'ai' }]);
      
      if (avatar.current && isSessionActive) {
        console.log('Using fallback question...');
        await avatar.current.speak({
          text: fallbackQuestion,
          taskType: TaskType.REPEAT,
          taskMode: TaskMode.SYNC,
        });
      }
    }
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  /* ***Using server-side API for interview context search*** */
  async function handleSpeak(question?: string) {
    console.log(`handle speak triggered`);
    const userQuery = question || text || '';
    setMessages((prev) => [...prev, { text: userQuery, sender: 'user' }]);
    setIsTyping(true);
    setLoading(true);

    if (!openaiAssistant.current) {
      setDebug('Avatar or OpenAI Assistant not initialized');
      openaiAssistant.current = new OpenAIAssistant(userId);
      await openaiAssistant.current.initialize();
      console.log(`openai initialized`);
    }

    console.log(`in handle speak`);

    // Fetch interview question contexts using server-side API
    let interviewContexts: any = [];
    try {
      const searchResponse = await fetch('/api/search-interview-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery }),
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.success && searchData.contexts) {
          interviewContexts = searchData.contexts;
          console.log('Interview contexts:', interviewContexts);
        }
      }
    } catch (error) {
      console.error('Error fetching interview contexts:', error);
    }

    try {
      console.log(`text is ${userQuery}`);

      const newText = `user query is: ${userQuery}`;
      console.log(`new text is ${newText}`);

      const response = await openaiAssistant.current.getResponse(
        userQuery,
        interviewContexts
      );
      const additionalContext =
        await openaiAssistant.current.getAdditionalContext(userQuery);
      console.log(`additionalContext is ${JSON.stringify(additionalContext)}`);
      setAdditionalContext(additionalContext);

      console.log(`RESP IS: ${JSON.stringify(response)}`);
      setIsTyping(false);
      setLoading(false);
      setMessages((prev) => [...prev, { text: response, sender: 'ai' }]);

      if (avatar.current && isSessionActive) {
        await avatar.current.speak({
          text: response,
          taskType: TaskType.REPEAT,
          taskMode: TaskMode.SYNC,
        });
      }

      // Store the chat history and await writes to ensure persistence
      if (sessionIdRef.current) {
        const userWrite = storeChats({ sessionId: sessionIdRef.current, message: userQuery, sender: 'USER' });
        const aiWrite = storeChats({ sessionId: sessionIdRef.current, message: response, sender: 'AI' });
        pendingChatWritesRef.current.push(userWrite, aiWrite);
        await Promise.allSettled([userWrite, aiWrite]);
      }

      // Clear the input
      setText('');
    } catch (e: any) {
      setIsTyping(false);
      setLoading(false);
      setDebug(e.message);
      console.error(`Error in handleSpeak: ${e.message}`);
    }
  }

  async function handleInterrupt() {
    if (!avatar.current) {
      setDebug('Avatar API not initialized');
      return;
    }
    await avatar.current.interrupt().catch((e) => {
      setDebug(e.message);
    });
  }
  
  async function endSession() {
    console.log('🏁 Ending session...');
    setIsSessionActive(false);
    
    // Stop the avatar first
    if (avatar.current) {
      try {
        await avatar.current.stopAvatar();
        console.log('✅ Avatar stopped successfully');
      } catch (error) {
        console.error('❌ Error stopping avatar:', error);
      }
    }
    
    // Flush any pending chat writes before summarizing
    if (pendingChatWritesRef.current.length > 0) {
      try {
        await Promise.allSettled(pendingChatWritesRef.current);
      } catch {}
      pendingChatWritesRef.current = [];
    }

    // Generate summary if session has chats
    if (sessionIdRef.current) {
      try {
        console.log('🔄 Generating session summary for session:', sessionIdRef.current);
        
        // Let's check if we have any chats first
        console.log('📊 Current messages in UI:', messages.length);
        
        const result = await summarizeChat(sessionIdRef.current);
        if (result) {
          console.log('✅ Session summary generated successfully:', result.summary);
        } else {
          console.warn('⚠️ No summary result returned - this might be normal if no chats exist');
        }
      } catch (error) {
        console.error('❌ Error generating summary:', error);
      }
    } else {
      console.warn('⚠️ No sessionId available for summary generation');
    }
    
    setStream(undefined);
    
    // Add a small delay before redirect to ensure summary completes
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1000);
  }
  
  const handleChangeChatMode = useMemoizedFn(async (v) => {
    if (v === chatMode) {
      return;
    }
    if (v === 'text_mode') {
      avatar.current?.closeVoiceChat();
    } else {
      await avatar.current?.startVoiceChat();
    }
    setChatMode(v);
  });

  const previousText = usePrevious(text);

  const handleVoiceIconClick = async () => {
    try {
      console.log(`handlevoiceicon clicked`);
      if (!isVoiceMode) {
        // Ensure session is active and OpenAI assistant is initialized
        if (!avatar.current || !isSessionActive) {
          await startSession(); // Your existing session start method
          // Wait a bit for session to be fully ready
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

        // Initialize OpenAI assistant if not already done
        if (!openaiAssistant.current) {
          console.log('Initializing OpenAI Assistant for voice mode...');
          openaiAssistant.current = new OpenAIAssistant(userId);
          await openaiAssistant.current.initialize();
        }

        console.log(`Switching to voice mode...`);

        await avatar.current?.startVoiceChat();
        avatar.current?.startListening();
        setIsVoiceMode(true);
        setChatMode('voice_mode');

        // If this is the first interaction and no messages exist, start the interview
        if (messages.length === 0 && openaiAssistant.current) {
          console.log('Starting interview flow in voice mode...');
          try {
            const initialQuestion = await openaiAssistant.current.getInitialQuestion();
            console.log('Initial question:', initialQuestion);
            
            setMessages((prev) => [...prev, { text: initialQuestion, sender: 'ai' }]);
            
            if (avatar.current && isSessionActive) {
              await avatar.current.speak({
                text: initialQuestion,
                taskType: TaskType.REPEAT,
                taskMode: TaskMode.SYNC,
              });
            }

            // Store the initial AI message
            if (sessionId) {
              storeChats({ sessionId: sessionId, message: initialQuestion, sender: 'AI' });
            }
          } catch (error) {
            console.error('Error getting initial question in voice mode:', error);
          }
        } else if (messages.length > 0) {
          // If conversation already exists, let user know voice mode is active
          const voiceModeMessage = "Voice mode is now active. Please speak your response.";
          if (avatar.current && isSessionActive) {
            await avatar.current.speak({
              text: voiceModeMessage,
              taskType: TaskType.REPEAT,
              taskMode: TaskMode.SYNC,
            });
          }
        }
      } else {
        console.log(`Switching to text mode...`);

        avatar.current?.stopListening();
        avatar.current?.closeVoiceChat();
        setIsVoiceMode(false);
        setChatMode('text_mode');
      }
    } catch (error) {
      console.error('Voice mode toggle error:', error);
      toast.error('Failed to toggle voice mode');
    }
  };

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => mediaStream.current?.play();
    }
  }, [stream]);

  async function handleSend() {
    const userDetails = await getStudentById(user.id);
    console.log('User Details:', userDetails);
    setMessages((prev) => [
      ...prev,
      { text, sender: 'user' },
      { text: text, sender: 'ai' },
    ]);
    setText('');
  }
  
  /* ***Voice-specific handler that doesn't add to chat display*** */
  async function handleVoiceSpeak(userQuery: string) {
    console.log(`handleVoiceSpeak triggered with: ${userQuery}`);
    setLoading(true);

    // Ensure we have a valid sessionId before storing chats
    if (!sessionIdRef.current) {
      const startedAt = Date.now();
      while (!sessionIdRef.current && Date.now() - startedAt < 3000) {
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    if (!openaiAssistant.current) {
      setDebug('Avatar or OpenAI Assistant not initialized');
      openaiAssistant.current = new OpenAIAssistant(userId);
      await openaiAssistant.current.initialize();
      console.log(`OpenAI initialized for voice mode`);
    }

    // Fetch interview question contexts using the same dynamic approach as text mode
    let interviewContexts: any = [];
    try {
      const searchResponse = await fetch('/api/search-interview-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery }),
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.success && searchData.contexts) {
          interviewContexts = searchData.contexts;
          console.log('Voice mode - Interview contexts:', interviewContexts.length);
        }
      }
    } catch (error) {
      console.error('Voice mode - Error fetching interview contexts:', error);
    }

    try {
      const response = await openaiAssistant.current.getResponse(
        userQuery,
        interviewContexts
      );

      console.log(`Voice mode response: ${response}`);
      setLoading(false);

      // Only speak the response, don't add to chat
      if (avatar.current && isSessionActive) {
        await avatar.current.speak({
          text: response,
          taskType: TaskType.REPEAT,
          taskMode: TaskMode.SYNC,
        });
      }

      // Store the chat history (but don't display in UI)
      if (sessionIdRef.current) {
        const userWrite = storeChats({ sessionId: sessionIdRef.current, message: userQuery, sender: 'USER' });
        const aiWrite = storeChats({ sessionId: sessionIdRef.current, message: response, sender: 'AI' });
        pendingChatWritesRef.current.push(userWrite, aiWrite);
        await Promise.allSettled([userWrite, aiWrite]);
      }

    } catch (e: any) {
      setLoading(false);
      setDebug(`Voice mode error: ${e.message}`);
      console.error(`Error in handleVoiceSpeak: ${e.message}`);
    }
  }

  return {
    messages,
    text,
    setText,
    handleSend,
    handleSpeak,
    handleInterrupt,
    handleVoiceIconClick,
    isVoiceMode,
    mediaStream,
    chatMode,
    handleChangeChatMode,
    endSessionPage,
    debug,
    loading,
    subtitles,
    additionalContext,
    endSession,
    messagesEndRef,
    startSession,
    startInterview,
    stream,
    setEndSessionPage,
    startLoading,
    setMessages,
    isTyping,
    isSessionActive,
    setIsSessionActive,
  };
};

export default useAvtarSession;
