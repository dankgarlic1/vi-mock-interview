'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { toastStyles } from '@/lib/utils';

const EmailSignIn = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
        isSignUp: false,
      });

      if (result?.error) {
        toast.error(result.error, toastStyles.error);
      } else {
        toast.success('Successfully signed in! Redirecting...', toastStyles.success);
        
        // Add a small delay to show the success toast before navigation
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      toast.error('An unexpected error occurred. Please try again.', toastStyles.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 text-gray-600"
    >
      {/* Email Input */}
      <Input
        id="email"
        name="email"
        type="email"
        placeholder="Enter your email"
        required
        value={formData.email}
        onChange={handleInputChange}
        className="rounded-xl border border-gray-200 bg-white/90 placeholder:text-gray-400 text-[#1F221F] px-4 py-5 text-base w-full focus:border-[#578CFF] focus:ring-2 focus:ring-[#578CFF]/20 transition-all duration-300"
      />

      {/* Password Input */}
      <Input
        id="password"
        name="password"
        type="password"
        placeholder="Enter your password"
        required
        value={formData.password}
        onChange={handleInputChange}
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
            <span>Signing In...</span>
          </div>
        ) : (
          'Sign In'
        )}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Admin Signin?{' '}
        <Link href="/admin/login" className="text-[#578CFF] hover:text-[#4A7AFF] underline font-medium">
          SignIn
        </Link>{' '}
        here
      </p>

      <p className="mt-4 text-center text-sm text-gray-500">
        By clicking continue, you agree to our{' '}
        <a href="#" className="text-[#578CFF] hover:text-[#4A7AFF] underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="text-[#578CFF] hover:text-[#4A7AFF] underline">
          Privacy Policy
        </a>
        .
      </p>

      <Toaster />
    </form>
  );
};

export default EmailSignIn;
