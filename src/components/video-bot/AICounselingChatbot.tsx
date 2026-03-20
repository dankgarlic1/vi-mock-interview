'use client';
import React, { useEffect, useRef, useState } from 'react';
import InteractiveAvatarTextInput from './InteractiveAvatarTextInput';
import { Button } from '../ui/button';

import useAvtarSession from '../../hooks/useAvtarSession';
import UserSessionsTable from './UserSessions';
import {
  Brain,
  Play,
  Video,
  MessageSquare,
  Zap,
  Clock,
  Award,
} from 'lucide-react';

import VideoConferenceRenderer from './video-renderer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { toastStyles } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  targetRole?: string;
}

export default function AICounselingChatbot({ user }: { user: User }) {
  const {
    messages,
    text,
    setText,
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
    stream,
    setEndSessionPage,
    startLoading,
    setMessages,
    isTyping,
    isSessionActive,
    setIsSessionActive,
  } = useAvtarSession({ user });

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  const handleStartInterview = async () => {
    console.log('Starting interview session...');
    setRetryCount(0);
    await startSession();
  };

  const handleRetrySession = async () => {
    if (retryCount < maxRetries) {
      console.log(`Retrying session... Attempt ${retryCount + 1}`);
      setRetryCount((prev) => prev + 1);
      toast.info(
        `Retrying connection... (${retryCount + 1}/${maxRetries})`,
        toastStyles.info
      );
      await startSession();
    } else {
      toast.error(
        'Maximum retry attempts reached. Please refresh the page and try again.',
        toastStyles.error
      );
    }
  };

  const handleEndSession = async () => {
    console.log('Ending session...');
    await endSession();
    window.location.href = '/dashboard';
  };

  // Debug logs to track stream
  useEffect(() => {
    console.log('Stream status:', stream ? 'Available' : 'Not available');
    if (stream) {
      console.log('Stream tracks:', stream.getTracks());
    }
  }, [stream]);

  // Show sessions list when no active session
  if (!stream && !startLoading && !isSessionActive) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        {/* Enhanced Header Section */}
        <div className="border-b border-gray-200 bg-white/80 backdrop-blur-xl">
          <div className="p-8">
            <div className="max-w-6xl mx-auto">
              {/* Main Header */}
              <div className="flex items-center gap-6 mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#578CFF] to-[#4A7AFF] shadow-lg"
                >
                  <Brain className="h-8 w-8 text-white" />
                </motion.div>
                <div>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-[#1F221F] mb-2"
                  >
                    AI Mock Interview
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-gray-600"
                  >
                    Practice with our AI interviewer for Backend, Frontend, and
                    DevOps roles
                  </motion.p>
                </div>
              </div>

              {debug === 'NO_CREDITS' && (
                <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-sm text-center">
                  ⚠️ Live avatar is currently unavailable (API credits
                  exhausted)
                  <br />
                  <br />
                  This project originally used HeyGen’s avatar API, which has
                  since migrated to a more expensive system.
                  <br />
                  <br />
                  The core AI interview system (RAG + conversational flow) still
                  works.
                  <br />
                  <br />
                  <a
                    href="https://github.com/dankgarlic1/vi-mock-interview?tab=readme-ov-file#%EF%B8%8F-project-archived-but-still-special-to-me"
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    Read full context →
                  </a>
                </div>
              )}

              {/* Call-to-Action Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-[#578CFF]/10 to-[#4A7AFF]/10 rounded-2xl p-8 border border-[#578CFF]/20 mb-8"
              >
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#578CFF]/10 rounded-full mb-4">
                    <Zap className="w-4 h-4 text-[#578CFF]" />
                    <span className="text-sm font-medium text-[#578CFF]">
                      Ready to get started?
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-[#1F221F] mb-3">
                    Start Your Mock Interview Session
                  </h2>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Click the button below to begin a new AI-powered mock
                    interview. Our intelligent system will ask you relevant
                    questions based on your target role.
                  </p>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleStartInterview}
                      disabled={startLoading}
                      className="group relative overflow-hidden bg-gradient-to-r from-[#578CFF] to-[#4A7AFF] hover:from-[#4A7AFF] hover:to-[#3B6FFF] text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl hover:shadow-[#578CFF]/25 transition-all duration-300"
                    >
                      {startLoading ? (
                        <div className="flex items-center gap-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>Starting Interview...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                          <span>Start New Interview</span>
                        </div>
                      )}

                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </Button>
                  </motion.div>

                  <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      <span>Video & Voice</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      <span>Instant Feedback</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Interview Types Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  {
                    title: 'Backend Engineer',
                    description: 'Server-side & Database questions',
                    color: 'from-green-500 to-emerald-500',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                  },
                  {
                    title: 'Frontend Engineer',
                    description: 'UI/UX & Client-side questions',
                    color: 'from-blue-500 to-cyan-500',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                  },
                  {
                    title: 'DevOps Engineer',
                    description: 'Infrastructure & Deployment questions',
                    color: 'from-orange-500 to-red-500',
                    bgColor: 'bg-orange-50',
                    borderColor: 'border-orange-200',
                  },
                ].map((role, index) => (
                  <motion.div
                    key={role.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`${role.bgColor} ${role.borderColor} border rounded-xl p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-3 h-3 rounded-full bg-gradient-to-r ${role.color}`}
                      ></div>
                      <h3 className="font-semibold text-[#1F221F] group-hover:text-gray-900 transition-colors">
                        {role.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                      {role.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sessions Table Container */}
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-[#578CFF]" />
                  <h2 className="text-xl font-semibold text-[#1F221F]">
                    Previous Interview Sessions
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Review your past interviews and track your improvement over
                  time
                </p>
              </div>

              <UserSessionsTable
                onStartSession={handleStartInterview}
                startLoading={startLoading}
              />
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (startLoading) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-[#578CFF]/10 via-white to-blue-50/30 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 bg-white/90 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border border-gray-200"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mx-auto w-16 h-16 bg-gradient-to-r from-[#578CFF] to-[#4A7AFF] rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Brain className="h-8 w-8 text-white" />
          </motion.div>

          <div>
            <h2 className="text-2xl font-bold text-[#1F221F] mb-2">
              Preparing Your Interview...
            </h2>
            <p className="text-gray-600">
              Setting up the AI interviewer and preparing questions
            </p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <div
              className="w-2 h-2 bg-[#578CFF] rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            ></div>
            <div
              className="w-2 h-2 bg-[#578CFF] rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            ></div>
            <div
              className="w-2 h-2 bg-[#578CFF] rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            ></div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main interview interface
  return (
    <div className="h-full w-full bg-background dark:bg-[#202434]">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-[#293040] border-[#E9ECF1]">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-semibold">Mock Interview Session</h1>
              <p className="text-sm text-muted-foreground">
                {chatMode === 'voice_mode'
                  ? 'Voice Mode Active'
                  : 'Text Mode Active'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="destructive" size="sm" onClick={handleEndSession}>
              End Interview
            </Button>
          </div>
        </div>

        {/* Video Section */}
        <div className="flex-1 flex flex-col">
          {/* Video Renderer */}
          <div className="flex-1">
            <VideoConferenceRenderer stream={stream} isAISpeaking={loading} />
          </div>

          {/* Chat Messages */}
          {messages.length > 0 && (
            <div className="h-64 border-t dark:border-[#293040] border-[#E9ECF1]">
              <ScrollArea className="h-full p-4">
                <div className="space-y-3">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground">
                        AI is typing...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Input Section */}
          <div className="border-t dark:border-[#293040] border-[#E9ECF1] p-4 bg-background dark:bg-[#202434]">
            <InteractiveAvatarTextInput
              label=""
              placeholder={
                chatMode === 'voice_mode'
                  ? 'Click to speak or type your response...'
                  : 'Type your response to the interviewer...'
              }
              input={text}
              onSubmit={handleSpeak}
              setInput={setText}
              handleVoiceIconClick={handleVoiceIconClick}
              isVoiceMode={isVoiceMode}
              disabled={loading}
              loading={loading}
            />
          </div>
        </div>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && debug && (
          <div className="p-2 bg-gray-100 dark:bg-gray-800 text-xs font-mono">
            <strong>Debug:</strong> {debug}
          </div>
        )}
      </div>
    </div>
  );
}
