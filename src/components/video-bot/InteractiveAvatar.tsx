'use client';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Spinner,
  Tabs,
  Tab,
} from '@nextui-org/react';
import { useEffect, useRef, useState } from 'react';
import { Room } from 'livekit-client';
import { OpenAIAssistant } from '@/lib/openai-assistant';

export default function InteractiveAvatar() {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState<string>();
  const mediaStream = useRef<HTMLVideoElement>(null);

  const roomRef = useRef<Room | null>(null);
  const assistantRef = useRef<OpenAIAssistant | null>(null);

  const userId = 'cm49rlgcw0000fx36ge376cid';

  // 🔥 SEND EVENT
  function sendEvent(payload: any) {
    roomRef.current?.localParticipant.publishData(
      new TextEncoder().encode(JSON.stringify(payload)),
      { topic: 'agent-control' }
    );
  }

  // 🔥 GET TOKEN
  async function fetchAccessToken() {
    const res = await fetch('/api/get-access-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();
    return data.token;
  }

  // 🔥 START SESSION
  async function startSession() {
    setIsLoadingSession(true);

    try {
      // mic permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const token = await fetchAccessToken();

      const res = await fetch('https://api.liveavatar.com/v1/sessions/start', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      const { livekit_url, livekit_client_token } = data.data;

      const room = new Room();
      roomRef.current = room;

      await room.connect(livekit_url, livekit_client_token);

      // 🎥 VIDEO
      room.on('trackSubscribed', (track) => {
        if (track.kind === 'video') {
          const mediaStream = new MediaStream([track.mediaStreamTrack]);
          setStream(mediaStream);
        }
      });

      // 🤖 INIT YOUR AI (IMPORTANT)
      assistantRef.current = new OpenAIAssistant(userId);
      await assistantRef.current.initialize();

      // 📡 LISTEN TO EVENTS
      room.on('dataReceived', async (payload, _, __, topic) => {
        try {
          const msg = JSON.parse(new TextDecoder().decode(payload));
          console.log('📡 EVENT:', topic, msg);

          if (topic === 'agent-response') {
            // 🎤 user speaking
            if (msg.event_type === 'user.speak_started') {
              setDebug('🎤 Listening...');
            }

            if (msg.event_type === 'user.speak_ended') {
              setDebug('🧠 Processing...');
            }

            // 🧠 USER TEXT
            if (msg.event_type === 'user.transcription') {
              const userText = msg.text;
              console.log('USER:', userText);

              if (!assistantRef.current) return;

              // 🔥 YOUR AI LOGIC BACK
              const response = await assistantRef.current.getResponse(userText);

              console.log('AI:', response);

              // 🔥 SEND TO AVATAR
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
          console.error(e);
        }
      });

      setDebug('Connected ✅');

      // 🔥 START LISTENING
      setTimeout(() => {
        sendEvent({
          event_type: 'avatar.start_listening',
        });
      }, 1000);

      // 🔥 FIRST QUESTION (FROM YOUR AI)
      setTimeout(async () => {
        if (!assistantRef.current) return;

        const first = await assistantRef.current.getInitialQuestion();

        sendEvent({
          event_type: 'avatar.speak_text',
          text: first,
        });
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setDebug(err.message);
    } finally {
      setIsLoadingSession(false);
    }
  }

  async function endSession() {
    await roomRef.current?.disconnect();
    setStream(undefined);
  }

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.play();
    }
  }, [stream]);

  return (
    <div className="w-full flex flex-col gap-4">
      <Card>
        <CardBody className="h-[500px] flex justify-center items-center">
          {stream ? (
            <video ref={mediaStream} autoPlay playsInline />
          ) : !isLoadingSession ? (
            <Button onClick={startSession}>Start Interview</Button>
          ) : (
            <Spinner />
          )}
        </CardBody>

        <Divider />

        <CardFooter>
          <Button onClick={endSession}>End</Button>
        </CardFooter>
      </Card>

      <p>{debug}</p>
    </div>
  );
}
