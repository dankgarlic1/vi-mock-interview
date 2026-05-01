'use client';

import { useState, useRef } from 'react';
import { Room } from 'livekit-client';
import { OpenAIAssistant } from '@/lib/openai-assistant';

export default function useAvtarSession({ user }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(true);

  const roomRef = useRef<Room | null>(null);
  const assistantRef = useRef<OpenAIAssistant | null>(null);
  const localAudioTrackRef = useRef<MediaStreamTrack | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const hasInterviewStartedRef = useRef(false);
  const isProcessingTranscriptionRef = useRef(false);

  const userId = user.id;
  const targetRole = user.targetRole;

  // 🔥 SEND EVENT
  function sendEvent(payload: any) {
    try {
      roomRef.current?.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify(payload)),
        { topic: 'agent-control' }
      );
    } catch (error) {
      console.error('Failed to send event', error);
    }
  }

  // 🔥 GET TOKEN
  async function fetchToken() {
    const res = await fetch('/api/get-access-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();
    console.log('TOKEN RESPONSE:', data);

    if (!res.ok || !data?.token) {
      throw new Error(data?.error || 'Failed to fetch avatar token');
    }

    return data.token;
  }

  async function cleanupSession() {
    hasInterviewStartedRef.current = false;
    isProcessingTranscriptionRef.current = false;

    localAudioTrackRef.current?.stop();
    localAudioTrackRef.current = null;

    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.srcObject = null;
      audioElementRef.current.remove();
      audioElementRef.current = null;
    }

    const currentRoom = roomRef.current;
    if (currentRoom) {
      currentRoom.removeAllListeners();
      await currentRoom.disconnect();
    }

    roomRef.current = null;
    setStream(undefined);
    setIsSessionActive(false);
  }

  // 🔥 START SESSION
  async function startSession() {
    try {
      await cleanupSession();
      setLoading(true);
      setDebug('');

      console.log('STEP 1: requesting mic...');
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioTrack = micStream.getAudioTracks()[0];
      localAudioTrackRef.current = audioTrack;

      console.log('STEP 2: fetching token...');
      const token = await fetchToken();

      console.log('STEP 3: starting session...');
      const res = await fetch('https://api.liveavatar.com/v1/sessions/start', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      console.log('SESSION RESPONSE:', data);

      if (!res.ok) {
        if (data?.code === 4033) {
          setDebug('NO_CREDITS');
          return;
        }

        throw new Error(data?.message || 'Session failed');
      }

      const { livekit_url, livekit_client_token } = data.data;

      console.log('STEP 4: connecting LiveKit...');
      console.log('URL:', livekit_url);

      const room = new Room();
      roomRef.current = room;

      const askFirstQuestion = async () => {
        const sanitizedRole =
          typeof targetRole === 'string' && targetRole.trim().length > 0
            ? targetRole.trim()
            : 'software engineer';
        const initialQuery = `${sanitizedRole} interview questions`;

        const ragRes = await fetch('/api/search-interview-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: initialQuery }),
        });

        if (!ragRes.ok) {
          throw new Error('Failed to fetch first question context');
        }

        const ragData = await ragRes.json();
        const contexts = ragData?.contexts || [];
        const first = await assistantRef.current!.getResponse('Start interview', contexts);

        console.log('FIRST QUESTION:', first);
        setMessages([{ text: first, sender: 'ai' }]);
        sendEvent({
          event_type: 'avatar.speak_text',
          text: first,
        });
      };

      const maybeStartInterview = async (reason: string) => {
        if (hasInterviewStartedRef.current || !roomRef.current) {
          return;
        }

        if (roomRef.current.remoteParticipants.size === 0) {
          setDebug('Waiting for interviewer to connect...');
          console.log(`Waiting for remote participant (${reason})`);
          return;
        }

        hasInterviewStartedRef.current = true;
        setDebug('Interviewer connected. Starting interview...');
        if (isVoiceMode) {
          sendEvent({ event_type: 'avatar.start_listening' });
        }
        await askFirstQuestion();
      };

      // 🎥 VIDEO TRACK
      room.on('trackSubscribed', (track) => {
        console.log('🔥 TRACK RECEIVED:', track.kind);

        if (track.kind === 'video') {
          const mediaStream = new MediaStream([track.mediaStreamTrack]);
          setStream(mediaStream);

          console.log('✅ VIDEO STREAM SET');
        }
        if (track.kind === 'audio') {
          if (audioElementRef.current) {
            audioElementRef.current.pause();
            audioElementRef.current.srcObject = null;
            audioElementRef.current.remove();
            audioElementRef.current = null;
          }

          const audioEl = document.createElement('audio');
          audioEl.srcObject = new MediaStream([track.mediaStreamTrack]);
          audioEl.autoplay = true;
          audioEl.muted = false;
          audioElementRef.current = audioEl;
          document.body.appendChild(audioEl);

          console.log('🔊 AUDIO ATTACHED');
        }

        void maybeStartInterview(`track:${track.kind}`);
      });

      // 🤖 INIT AI
      assistantRef.current = new OpenAIAssistant(userId);
      await assistantRef.current.initialize();

      console.log('✅ AI INITIALIZED');

      // 📡 EVENTS
      room.on('dataReceived', async (payload, _, __, topic) => {
        let startedTranscriptionProcessing = false;
        try {
          const msg = JSON.parse(new TextDecoder().decode(payload));
          console.log('📡 EVENT:', topic, msg);

          if (topic === 'agent-response') {
            if (msg.event_type === 'user.speak_started') {
              setDebug('🎤 Listening...');
            }

            if (msg.event_type === 'user.speak_ended') {
              setDebug('🧠 Processing...');
            }

            if (msg.event_type === 'user.transcription') {
              if (isProcessingTranscriptionRef.current) {
                return;
              }

              const userText =
                typeof msg.text === 'string' ? msg.text.trim() : '';
              if (!userText) {
                return;
              }

              isProcessingTranscriptionRef.current = true;
              startedTranscriptionProcessing = true;
              console.log('USER:', userText);

              setMessages((prev) => [
                ...prev,
                { text: userText, sender: 'user' },
              ]);

              const res = await fetch('/api/search-interview-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  query:
                    targetRole && targetRole.trim()
                      ? `${targetRole.trim()} interview: ${userText}`
                      : `interview: ${userText}`,
                }),
              });

              if (!res.ok) {
                throw new Error('Failed to fetch interview context');
              }

              const ragData = await res.json();

              const contexts = ragData?.contexts || [];

              console.log('RAG:', contexts);

              // 🔥 STEP 2: pass into LLM
              const response = await assistantRef.current!.getResponse(
                `
You are a strict interviewer for a ${targetRole || 'software engineer'} role.

Context:
${contexts.join('\n')}

User answer:
${userText}

Your job:
- Ask the NEXT relevant interview question
- Do NOT answer
- Do NOT explain
- Keep it short and realistic
`
              );

              console.log('AI:', response);

              setMessages((prev) => [
                ...prev,
                { text: response, sender: 'ai' },
              ]);

              sendEvent({
                event_type: 'avatar.speak_text',
                text: response,
              });
            }

            if (msg.event_type === 'avatar.speak_started') {
              setDebug('🗣️ Avatar speaking...');
            }

            if (msg.event_type === 'avatar.speak_ended') {
              setDebug('✅ Done');
              if (isVoiceMode) {
                sendEvent({ event_type: 'avatar.start_listening' });
              }
            }
          }
        } catch (e) {
          console.error('EVENT ERROR:', e);
          setDebug('Failed to process voice event');
        } finally {
          if (startedTranscriptionProcessing) {
            isProcessingTranscriptionRef.current = false;
          }
        }
      });

      room.on('participantConnected', () => {
        void maybeStartInterview('participantConnected');
      });

      console.log('STEP 4: connecting LiveKit...');
      console.log('URL:', livekit_url);
      await room.connect(livekit_url, livekit_client_token);
      console.log('✅ LIVEKIT CONNECTED');

      await room.localParticipant.publishTrack(audioTrack);
      console.log('🎤 MIC PUBLISHED');

      setIsSessionActive(true);
      void maybeStartInterview('postConnect');
    } catch (err: any) {
      console.error('❌ ERROR:', err);
      setDebug(err.message);
      await cleanupSession();
    } finally {
      setLoading(false);
    }
  }

  // 🔥 TEXT MODE
  async function handleSpeak() {
    if (!text) return;

    setMessages((prev) => [...prev, { text, sender: 'user' }]);

    const response = await assistantRef.current!.getResponse(text);

    setMessages((prev) => [...prev, { text: response, sender: 'ai' }]);

    sendEvent({
      event_type: 'avatar.speak_text',
      text: response,
    });

    setText('');
  }

  async function endSession() {
    await cleanupSession();
  }

  function handleVoiceIconClick() {
    const nextMode = !isVoiceMode;
    setIsVoiceMode(nextMode);

    if (nextMode) {
      setDebug('Voice mode enabled');
      sendEvent({ event_type: 'avatar.start_listening' });
    } else {
      setDebug('Voice mode paused');
      sendEvent({ event_type: 'avatar.stop_listening' });
    }
  }

  return {
    messages,
    text,
    setText,
    handleSpeak,
    startSession,
    endSession,
    stream,
    debug,
    loading,
    isSessionActive,

    // ✅ prevent UI crashes
    handleInterrupt: () => {},
    handleVoiceIconClick,
    isVoiceMode,
    mediaStream: stream,
    chatMode: 'voice_mode',
    handleChangeChatMode: () => {},
    endSessionPage: false,
    subtitles: '',
    additionalContext: [],
    messagesEndRef: { current: null },
    setEndSessionPage: () => {},
    startLoading: loading,
    setMessages,
    isTyping: false,
    setIsSessionActive,
  };
}
