'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { GithubIcon, GoogleIcon } from '@/icons/icons';
import Link from 'next/link';
import { toastStyles } from '@/lib/utils';
// import { GitHubIcon, GoogleIcon } from '@/components/ui/icons'; // Icons component for GitHub & Google

const EmailSignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        name,
        isSignUp: true,
      });

      setLoading(false);

      if (result?.error) {
        setError(result.error);
        console.log('Error during sign in:', result.error);
        toast.error(result.error, toastStyles.error);
      } else {
        toast.success('Account created successfully! Redirecting...', toastStyles.success);
        
        // Add a small delay to show the success toast before navigation
        setTimeout(() => {
          router.push('/student/student-info'); // Redirect to student form
        }, 1000);
      }
    } catch (err) {
      setLoading(false);
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred', toastStyles.error);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 text-gray-600 font-sans"
      >
        {/* Name Input */}
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Enter your name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white/90 placeholder:text-gray-400 text-[#1F221F] px-4 py-5 text-base w-full focus:border-[#578CFF] focus:ring-2 focus:ring-[#578CFF]/20 transition-all duration-300"
        />

        {/* Email Input */}
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white/90 placeholder:text-gray-400 text-[#1F221F] px-4 py-5 text-base w-full focus:border-[#578CFF] focus:ring-2 focus:ring-[#578CFF]/20 transition-all duration-300"
        />

        {/* Password Input */}
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white/90 placeholder:text-gray-400 text-[#1F221F] px-4 py-5 text-base w-full focus:border-[#578CFF] focus:ring-2 focus:ring-[#578CFF]/20 transition-all duration-300"
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className="flex items-center font-semibold justify-center bg-[#578CFF] text-white hover:bg-[#4A7AFF] transition-all duration-300 rounded-xl h-[2.5rem] shadow-lg hover:shadow-xl hover:shadow-[#578CFF]/25 transform hover:scale-105"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Creating Account...</span>
            </div>
          ) : (
            'Sign Up'
          )}
        </Button>

        {/* <p className="mt-2 text-center text-sm text-gray-600">
          Already have an Account?{" "} <Link href="/auth/signin" className="underline"> SignIn</Link> here
          </p> */}

        <p className="mt-4 text-center text-sm text-gray-500">
          By clicking continue, you agree to our{' '}
          <a href="/terms" className="text-[#578CFF] hover:text-[#4A7AFF] underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-[#578CFF] hover:text-[#4A7AFF] underline">
            Privacy Policy
          </a>
          .
        </p>

        <Toaster />
      </form>
    </>
  );
};

export default EmailSignUp;
