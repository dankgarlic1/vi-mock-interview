'use client';

import EmailSignUp from '@/app/auth/signup/_components/EmailSignUp';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Brain, Sparkles, ArrowLeft, Rocket, Target, Award, TrendingUp, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const BenefitCard = ({ icon, title, description, delay = 0 }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    className="flex items-start space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 hover:border-[#578CFF]/30 transition-all duration-300 shadow-lg hover:shadow-xl group"
  >
    <div className="p-3 bg-gradient-to-br from-[#578CFF] to-[#4A7AFF] rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-[#1F221F] mb-1">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

export default function SignUp() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -50]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 text-gray-900 overflow-hidden relative">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          style={{ x: y1, y: y2 }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-[#578CFF]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
        />
        <motion.div 
          style={{ x: y2, y: y1 }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"
        />
        <motion.div 
          style={{ x: y1 }}
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-300/15 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse animation-delay-4000"
        />
        
        {/* Interactive cursor glow */}
        <div 
          className="absolute pointer-events-none w-96 h-96 bg-gradient-radial from-[#578CFF]/10 to-transparent rounded-full filter blur-3xl transition-all duration-300"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920), 
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
              opacity: 0 
            }}
            animate={{ 
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080)],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute w-1 h-1 bg-[#578CFF] rounded-full"
          />
        ))}
      </div>

      {/* Header */}
      <header className="container mx-auto px-8 md:px-16 lg:px-24 py-8 flex justify-between items-center relative z-50">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center space-x-3 ml-8 md:ml-12 lg:ml-16"
        >
          <Link 
            href="/"
            className="flex items-center space-x-2 text-gray-600 hover:text-[#1F221F] transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center space-x-4 mr-8 md:mr-12 lg:mr-16"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-3 bg-gradient-to-br from-[#578CFF] to-[#4A7AFF] rounded-2xl shadow-xl"
            >
              <Brain className="h-6 w-6 text-white" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="h-3 w-3 text-yellow-500" />
            </motion.div>
          </div>
          <span className="text-xl font-bold text-[#1F221F]">
            VI Mock Interview Agent
          </span>
        </motion.div>
      </header>

      <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Benefits & Features */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="hidden lg:block space-y-8"
          >
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-[#578CFF]/30 mb-6"
              >
                <Rocket className="h-4 w-4 text-[#578CFF]" />
                <span className="text-[#1F221F] font-medium text-sm">Start Your Success Journey</span>
              </motion.div>
              
              <h2 className="text-5xl font-bold mb-6 text-[#1F221F] leading-tight">
                Join 10,000+ Successful Candidates
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Transform your interview skills with AI-powered coaching and land your dream job at top companies.
              </p>
            </div>

            <div className="grid gap-4">
              <BenefitCard
                icon={<Target className="h-5 w-5 text-white" />}
                title="Personalized AI Coaching"
                description="Get tailored feedback based on your target role and experience level"
                delay={0.3}
              />
              
              <BenefitCard
                icon={<TrendingUp className="h-5 w-5 text-white" />}
                title="Real-time Performance Analytics"
                description="Track your progress with detailed analytics and improvement insights"
                delay={0.4}
              />
              
              <BenefitCard
                icon={<Award className="h-5 w-5 text-white" />}
                title="Industry-leading Success Rate"
                description="95% of our users report improved interview performance within 2 weeks"
                delay={0.5}
              />
            </div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-lg"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-8 h-8 bg-gradient-to-br from-[#578CFF] to-[#4A7AFF] rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white">
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-[#1F221F]">10,000+</span> candidates trained
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Free to start • No credit card required • Instant access</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Sign Up Form */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-md mx-auto lg:mx-0"
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
              className="relative group"
            >
              <div className="relative bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-gray-100">
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.6, type: "spring", bounce: 0.4 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#578CFF] to-[#4A7AFF] rounded-2xl mb-6 shadow-lg"
                  >
                    <Brain className="h-8 w-8 text-white" />
                  </motion.div>
                  
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="text-3xl font-bold text-[#1F221F] mb-3"
                  >
                    Start Your Journey
                  </motion.h1>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="text-gray-600 leading-relaxed"
                  >
                    Create your account and begin mastering interviews with AI
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  <EmailSignUp />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="mt-8 text-center"
                >
                  <p className="text-sm text-gray-600 mb-4">
                    Already have an account?
                  </p>
                  <Link
                    href="/auth/signin"
                    className="group inline-flex items-center justify-center w-full px-6 py-3 text-sm font-medium text-[#578CFF] bg-[#578CFF]/10 border border-[#578CFF]/30 rounded-xl hover:bg-[#578CFF]/20 hover:border-[#578CFF]/50 transition-all duration-300 backdrop-blur-xl"
                  >
                    Sign in to your account
                    <motion.div
                      className="ml-2"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      →
                    </motion.div>
                  </Link>
                </motion.div>

                {/* Trust indicators */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="mt-8 pt-6 border-t border-gray-200"
                >
                  <div className="flex justify-center items-center space-x-6 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>Free forever</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>No spam</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>Secure</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom decorative element */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#578CFF] via-[#4A7AFF] to-[#578CFF] opacity-80" />
    </div>
  );
}
