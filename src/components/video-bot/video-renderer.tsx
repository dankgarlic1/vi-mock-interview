import React, { useEffect, useRef, useState } from "react";

interface VideoConferenceRendererProps {
  stream: MediaStream | undefined;
  isAISpeaking?: boolean;
}

export default function VideoConferenceRenderer({ stream, isAISpeaking }: VideoConferenceRendererProps) {
  const avatarVideoRef = useRef<HTMLVideoElement>(null);
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const [isTestPlaying, setIsTestPlaying] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [userStream, setUserStream] = useState<MediaStream | null>(null);
  const [userCameraEnabled, setUserCameraEnabled] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);

  // Set up HeyGen avatar stream
  useEffect(() => {
    if (stream && avatarVideoRef.current) {
      console.log("[VideoRenderer] Setting up HeyGen avatar stream");
      console.log("[VideoRenderer] Stream tracks:", stream.getTracks());
      
      const videoElement = avatarVideoRef.current;
      videoElement.srcObject = stream;
      
      // Ensure audio is enabled
      videoElement.muted = false;
      videoElement.volume = 1.0;
      
      videoElement.onloadedmetadata = async () => {
        console.log("[VideoRenderer] Avatar video ready, playing...");
        try {
          // Explicitly unmute and set volume
          videoElement.muted = false;
          videoElement.volume = 1.0;
          
          await videoElement.play();
          setAudioMuted(false);
          console.log("[VideoRenderer] Avatar video playing with audio");
        } catch (error) {
          console.error("[VideoRenderer] Failed to play avatar video:", error);
          // If autoplay with audio fails, try playing muted first, then unmute
          try {
            videoElement.muted = true;
            await videoElement.play();
            // Small delay then unmute
            setTimeout(() => {
              videoElement.muted = false;
              videoElement.volume = 1.0;
              console.log("[VideoRenderer] Video playing, audio unmuted");
            }, 100);
          } catch (mutedError) {
            console.error("[VideoRenderer] Failed to play even muted video:", mutedError);
          }
        }
        setIsVideoReady(true);
      };
      
      videoElement.onerror = (error) => {
        console.error("[VideoRenderer] Avatar video error:", error);
      };
      
      // Add volume change listener
      videoElement.onvolumechange = () => {
        console.log("[VideoRenderer] Volume changed:", videoElement.volume, "Muted:", videoElement.muted);
      };
    }
  }, [stream]);

  // Handle user camera
  const enableUserCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      setUserStream(mediaStream);
      setUserCameraEnabled(true);
      console.log("[VideoRenderer] User camera enabled");
    } catch (error) {
      console.error("[VideoRenderer] Error accessing user camera:", error);
    }
  };

  // Assign user stream to video element
  useEffect(() => {
    if (userStream && userVideoRef.current) {
      userVideoRef.current.srcObject = userStream;
      userVideoRef.current.onloadedmetadata = () => {
        userVideoRef.current?.play().catch((error) => {
          console.error("[VideoRenderer] Failed to play user video:", error);
        });
      };
    }
  }, [userStream]);

  // Cleanup user stream on unmount
  useEffect(() => {
    return () => {
      if (userStream) {
        userStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [userStream]);

  // Function to manually unmute audio (for browser autoplay policy)
  const handleUnmuteAudio = () => {
    if (avatarVideoRef.current) {
      avatarVideoRef.current.muted = false;
      avatarVideoRef.current.volume = 1.0;
      setAudioMuted(false);
      console.log("[VideoRenderer] Audio manually unmuted");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-xl -mt-2">
      {/* AI Avatar Video */}
      <div className="relative h-[750px] w-full overflow-hidden rounded-lg shadow-inner bg-gray-800">
        {stream ? (
          <video
            ref={avatarVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            style={{ backgroundColor: '#1f2937' }}
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-300">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-500">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                </svg>
              </div>
              <p className="text-lg font-medium">AI Interviewer</p>
              <p className="text-sm opacity-75">Preparing to connect...</p>
            </div>
          </div>
        )}
        
        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium">
          AI Interviewer
        </div>
        
        {isAISpeaking && (
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <div className="bg-green-500 w-3 h-3 rounded-full animate-pulse"></div>
            <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">Speaking</span>
          </div>
        )}
        
        {/* Audio controls */}
        {stream && audioMuted && (
          <div className="absolute top-3 left-3">
            <button
              onClick={handleUnmuteAudio}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors flex items-center gap-1"
            >
              🔇 Click to Enable Audio
            </button>
          </div>
        )}
        
        {/* User video overlay on mobile */}
        <div className="md:hidden absolute top-4 right-4 w-24 h-32 rounded-lg overflow-hidden shadow-lg border-2 border-white/20">
          {userCameraEnabled && userStream ? (
            <video
              ref={userVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-600 flex items-center justify-center">
              <button
                onClick={enableUserCamera}
                className="text-white text-xs p-1"
              >
                📹
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User's Video (desktop) */}
      <div className="relative h-[750px] w-full overflow-hidden rounded-lg shadow-inner bg-gray-800 hidden md:block">
        {userCameraEnabled && userStream ? (
          <video
            ref={userVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ backgroundColor: '#1f2937' }}
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-300 flex-col">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium mb-2">Your Camera</p>
            <button
              onClick={enableUserCamera}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enable Camera
            </button>
          </div>
        )}
        
        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium">
          You
        </div>
        
        {userCameraEnabled && (
          <button
            onClick={() => {
              if (userStream) {
                userStream.getTracks().forEach(track => track.stop());
                setUserStream(null);
                setUserCameraEnabled(false);
              }
            }}
            className="absolute bottom-2 right-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
          >
            Disable Camera
          </button>
        )}
      </div>
    </div>
  );
}

