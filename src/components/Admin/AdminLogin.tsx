'use client';
import React from 'react';
import { TopLeftShine } from '../ui/Shine';
import AdminLoginButtons from './AdminLoginButtons';
import Image from 'next/image';

export default function AdminLogin() {
  return (
    <div className="flex min-h-screen bg-black md:grid md:grid-cols-5 md:px-0 overflow-hidden">
      <div className="md:col-span-2 flex flex-col justify-center p-6 md:p-12 mx-auto bg-black  ">
        <div className="absolute top-0 left-0 flex justify-start w-screen overflow-hidden pointer-events-none">
          <TopLeftShine />
        </div>

        <div className="flex flex-col items-center text-start space-y-2 m-2">
          <h1 className="text-2xl font-semibold text-[#807F7F] dark:text-white">
            Sign To Admin Dashboard
          </h1>
          <p className="text-sm text-[#8F8F8F]">
            Enter your email and password to Sign In
          </p>
        </div>

        <div className="space-y-6 bg-black">
          <div className="space-y-4">
            <AdminLoginButtons />
          </div>
        </div>
      </div>

      {/* Right Side - Background Image and Quote (60% width) */}
      <div className="relative hidden md:inline h-full bg-muted text-white lg:flex flex-col p-10 md:col-span-3 border-l border-[#323232]">
        <div className="absolute inset-0 bg-black opacity-60" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <div className="mr-2 h-6 w-6" />
          VI Mock Interview Agent
        </div>
        <div className="relative z-20 mt-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              VI Mock Interview Agent
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              &ldquo;Our AI-powered video chatbot is revolutionizing interview preparation by providing instant, personalized feedback. With real-time responses, we empower candidates to practice and improve their interview skills for technical and behavioral scenarios.&rdquo;
            </p>
          </div>
        </div>


        <div className="absolute bottom-40 left-52 w-full h-1/2 overflow-hidden z-10 shadow-lg">
          <Image
            src="/admindashboard.jpg"
            alt="Admin Dashboard"
            layout="fill"
            objectFit="cover" // Ensures the image scales and crops correctly
            className="opacity-80"
          />
        </div>
      </div>
    </div>
  );
}
