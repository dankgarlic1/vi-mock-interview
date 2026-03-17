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

  const roomRef = useRef<Room | null>(null);
  const assistantRef = useRef<OpenAIAssistant | null>(null);

  const userId = user.id;

  // 🔥 SEND EVENT
  function sendEvent(payload: any) {
    roomRef.current?.localParticipant.publishData(
      new TextEncoder().encode(JSON.stringify(payload)),
      { topic: 'agent-control' }
    );
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

    return data.token;
  }

  // 🔥 START SESSION
  async function startSession() {
    try {
      setLoading(true);

      console.log('STEP 1: requesting mic...');
      await navigator.mediaDevices.getUserMedia({ audio: true });

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
        throw new Error(data?.message || 'Session failed');
      }

      const { livekit_url, livekit_client_token } = data.data;

      console.log('STEP 4: connecting LiveKit...');
      console.log('URL:', livekit_url);

      const room = new Room();
      roomRef.current = room;

      await room.connect(livekit_url, livekit_client_token);
      console.log('✅ LIVEKIT CONNECTED');

      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const audioTrack = micStream.getAudioTracks()[0];
      await room.localParticipant.publishTrack(audioTrack);
      console.log('🎤 MIC PUBLISHED');

      setIsSessionActive(true); // 🔥 CRITICAL FIX

      // 🎥 VIDEO TRACK
      room.on('trackSubscribed', (track) => {
        console.log('🔥 TRACK RECEIVED:', track.kind);

        if (track.kind === 'video') {
          const mediaStream = new MediaStream([track.mediaStreamTrack]);
          setStream(mediaStream);

          console.log('✅ VIDEO STREAM SET');
        }
        if (track.kind === 'audio') {
          const audioEl = document.createElement('audio');
          audioEl.srcObject = new MediaStream([track.mediaStreamTrack]);
          audioEl.autoplay = true;

          // iOS / Chrome autoplay fix
          audioEl.muted = false;

          document.body.appendChild(audioEl);

          console.log('🔊 AUDIO ATTACHED');
        }
      });

      // 🤖 INIT AI
      assistantRef.current = new OpenAIAssistant(userId);
      await assistantRef.current.initialize();

      console.log('✅ AI INITIALIZED');

      // 📡 EVENTS
      room.on('dataReceived', async (payload, _, __, topic) => {
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
              const userText = msg.text;
              console.log('USER:', userText);

              setMessages((prev) => [
                ...prev,
                { text: userText, sender: 'user' },
              ]);

              const response =
                await assistantRef.current!.getResponse(userText);

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
            }
          }
        } catch (e) {
          console.error('EVENT ERROR:', e);
        }
      });

      // 🔥 START LISTENING
      setTimeout(() => {
        console.log('👉 START LISTENING');
        sendEvent({ event_type: 'avatar.start_listening' });
      }, 1000);

      // 🔥 FIRST QUESTION
      setTimeout(async () => {
        const first = await assistantRef.current!.getInitialQuestion();

        console.log('FIRST QUESTION:', first);

        setMessages([{ text: first, sender: 'ai' }]);

        sendEvent({
          event_type: 'avatar.speak_text',
          text: first,
        });
      }, 2000);
    } catch (err: any) {
      console.error('❌ ERROR:', err);
      setDebug(err.message);
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
    await roomRef.current?.disconnect();
    setStream(undefined);
    setIsSessionActive(false);
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
    handleVoiceIconClick: () => {},
    isVoiceMode: true,
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
