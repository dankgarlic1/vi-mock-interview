'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Brain,
  Video,
  Lock,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Star,
  Zap,
  Target,
  Users,
  Award,
  CheckCircle,
  Play,
  Globe,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -8, scale: 1.03 }}
      className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-100 hover:border-[#578CFF]/30 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-[#578CFF]/10"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#578CFF]/5 to-purple-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="flex justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
          <div className="p-4 bg-gradient-to-br from-[#578CFF] to-[#4A7AFF] rounded-xl shadow-lg">
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-bold mb-4 text-center text-[#1F221F]">
          {title}
        </h3>
        <p className="text-gray-600 text-center leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

// Animated Counter Hook
const useAnimatedCounter = (end: number, duration: number = 2) => {
  const [count, setCount] = useState(0);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: duration * 1000 });

  useEffect(() => {
    springValue.on('change', (latest) => {
      setCount(Math.round(latest));
    });
  }, [springValue]);

  const animate = () => {
    motionValue.set(end);
  };

  return { count, animate };
};

const StatCard: React.FC<{ number: string; label: string; delay?: number }> = ({ number, label, delay = 0 }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  
  // Extract numeric value and suffix from the number string
  const getNumericValue = (numStr: string) => {
    if (numStr.includes('K+')) return parseInt(numStr.replace('K+', '')) * 1000;
    if (numStr.includes('%')) return parseInt(numStr.replace('%', ''));
    if (numStr.includes('/')) return 24; // For "24/7"
    return parseInt(numStr.replace(/\D/g, '')) || 0;
  };

  const getSuffix = (numStr: string) => {
    if (numStr.includes('K+')) return 'K+';
    if (numStr.includes('%')) return '%';
    if (numStr.includes('/')) return '/7';
    return '';
  };

  const formatDisplayValue = (count: number, originalStr: string) => {
    if (originalStr.includes('K+')) return Math.floor(count / 1000) + 'K+';
    if (originalStr.includes('%')) return count + '%';
    if (originalStr.includes('/')) return count + '/7';
    return count.toString();
  };

  const targetValue = getNumericValue(number);
  const { count, animate } = useAnimatedCounter(targetValue, 2);

  useEffect(() => {
    if (isInView) {
      setTimeout(() => animate(), delay * 1000);
    }
  }, [isInView, animate, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, type: "spring", bounce: 0.4 }}
      className="text-center group cursor-pointer"
    >
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#578CFF] to-[#4A7AFF] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
        {isInView ? formatDisplayValue(count, number) : '0' + getSuffix(number)}
      </div>
      <div className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300 font-medium">{label}</div>
    </motion.div>
  );
};

const TestimonialCard: React.FC<{ quote: string; author: string; role: string; rating: number; delay?: number }> = ({ 
  quote, author, role, rating, delay = 0 
}) => (
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6 }}
    className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl border border-gray-100 hover:border-[#578CFF]/20 transition-all duration-300 shadow-lg hover:shadow-xl group"
  >
    <div className="flex mb-6">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
      ))}
    </div>
    <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">"{quote}"</p>
    <div>
      <div className="font-bold text-[#1F221F] text-lg">{author}</div>
      <div className="text-sm text-gray-500 font-medium">{role}</div>
    </div>
  </motion.div>
);

const LandingPage: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 100]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);

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
          className="flex items-center space-x-4 ml-8 md:ml-12 lg:ml-16"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-3 bg-gradient-to-br from-[#578CFF] to-[#4A7AFF] rounded-2xl shadow-xl"
            >
              <Brain className="h-8 w-8 text-white" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </motion.div>
          </div>
          <span className="text-2xl font-bold text-[#1F221F] ">
            VI Mock Interview Agent
          </span>
        </motion.div>
        
        <motion.nav 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center space-x-6 mr-8 md:mr-12 lg:mr-16"
        >
          <Link href="/auth/signup">
            <Button className="relative overflow-hidden bg-[#578CFF] hover:bg-[#4A7AFF] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-[#578CFF]/25 transform hover:scale-105 transition-all duration-300">
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </Link>
        </motion.nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center space-x-3 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-[#578CFF]/30  mb-8"
            >
              <Zap className="h-5 w-5 text-[#578CFF]" />
              <span className="text-[#1F221F] font-med">AI-Powered Interview Revolution</span>
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-8xl font-bold mb-8 leading-tight"
          >
            <span className="text-[#1F221F] block mb-4">
              
              Master Your <br /> Interview Skills
            </span>
           
          </motion.h1>
          
          <motion.p
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.8, duration: 0.6 }}
  className="text-xl md:text-2xl mb-16 text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium"
>
  Prepare smarter with our AI-powered interviewer — practice technical and behavioral questions with 
  <span className="text-[#578CFF] font-semibold"> instant feedback</span> and 
  <span className="text-[#578CFF] font-semibold"> personalized coaching</span>.
</motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-center items-center space-y-6 sm:space-y-0 sm:space-x-8"
          >
            <Link href="/auth/signup">
              <Button className="group relative overflow-hidden bg-[#578CFF] hover:bg-[#4A7AFF] text-white px-6 py-6 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl hover:shadow-[#578CFF]/25 transform hover:scale-105 transition-all duration-300">
                <span className="relative z-10 flex items-center">
                Get Started
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </Link>
            
            <Button variant="outline" className="group bg-white/80 backdrop-blur-sm border-2 border-[#578CFF]/30 text-[#1F221F] hover:bg-[#578CFF]/5 hover:text-[#578CFF] px-6 py-6 rounded-xl text-lg font-semibold hover:border-[#578CFF]/50 transition-all duration-300 ">
              
              Watch Demo
              <Play className=" h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl p-10 border border-gray-100 shadow-2xl"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              <StatCard number="10K+" label="Interviews Completed" delay={0.1} />
              <StatCard number="95%" label="Success Rate" delay={0.2} />
              <StatCard number="500+" label="Companies" delay={0.3} />
              <StatCard number="24/7" label="Available" delay={0.4} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-[#1F221F]">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
              Experience cutting-edge AI technology designed to elevate your interview performance
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <FeatureCard
              icon={<Video className="h-8 w-8 text-white" />}
              title="Interactive Video Interviews"
              description="Engage in realistic face-to-face mock interviews with our advanced AI interviewer for authentic practice sessions."
              delay={0.1}
            />
            <FeatureCard
              icon={<Brain className="h-8 w-8 text-white" />}
              title="Advanced AI Technology"
              description="Powered by cutting-edge AI to provide accurate, contextual feedback and realistic interview scenarios."
              delay={0.2}
            />
            <FeatureCard
              icon={<Target className="h-8 w-8 text-white" />}
              title="Personalized Coaching"
              description="Get tailored feedback and improvement suggestions based on your performance and target role."
              delay={0.3}
            />
            <FeatureCard
              icon={<Award className="h-8 w-8 text-white" />}
              title="Instant Results"
              description="Receive immediate feedback and detailed analytics to track your progress and improvement."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-[#1F221F]">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
              Hear from candidates who landed their dream jobs with our platform
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <TestimonialCard
              quote="This platform transformed my interview skills completely. I went from nervous candidate to confident professional!"
              author="Sarah Chen"
              role="Software Engineer at Google"
              rating={5}
              delay={0.1}
            />
            <TestimonialCard
              quote="The AI feedback was incredibly detailed and helped me identify areas I never knew I needed to improve."
              author="Michael Rodriguez"
              role="Product Manager at Meta"
              rating={5}
              delay={0.2}
            />
            <TestimonialCard
              quote="Practicing with the AI interviewer gave me the confidence to ace my interviews at top tech companies."
              author="Emily Johnson"
              role="DevOps Engineer at Amazon"
              rating={5}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto bg-gradient-to-br from-[#578CFF]/5 to-purple-50/30 p-16 rounded-3xl border border-[#578CFF]/20 shadow-2xl backdrop-blur-sm"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-[#1F221F]">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-xl mb-12 text-gray-600 max-w-3xl mx-auto font-medium leading-relaxed">
              Join thousands of successful candidates who have transformed their careers with AI-powered interview preparation.
            </p>
            
            <div className="flex flex-col md:flex-row justify-center items-center space-y-6 md:space-y-0 md:space-x-8 mb-12">
              <div className="relative">
              <Input
                type="email"
                  placeholder="Enter your email address"
                  className="md:w-96 h-16 bg-white/90 text-gray-900 border-gray-200 focus:border-[#578CFF] rounded-full px-8 text-lg shadow-lg backdrop-blur-sm"
              />
              </div>
              <Button className="bg-[#578CFF] hover:bg-[#4A7AFF] text-white px-12 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl hover:shadow-[#578CFF]/25 transform hover:scale-105 transition-all duration-300">
                Get Started Free
              </Button>
            </div>
            
            <div className="flex justify-center items-center space-x-12 text-sm text-gray-500">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="font-medium">Free to start</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="font-medium">No credit card required</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="font-medium">Instant access</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="relative z-10 bg-gradient-to-b from-gray-50/80 to-gray-100/80 border-t border-gray-200 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-16"
          >
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-4 mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="p-3 bg-gradient-to-br from-[#578CFF] to-[#4A7AFF] rounded-2xl shadow-xl"
                >
                  <Brain className="h-8 w-8 text-white" />
                </motion.div>
                <span className="text-2xl font-bold bg-gradient-to-r from-[#578CFF] to-[#4A7AFF] bg-clip-text text-transparent">
                  VI Mock Interview Agent
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed mb-8 font-medium">
                Revolutionizing interview preparation with AI-powered coaching and personalized feedback for ambitious candidates worldwide.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-10 h-10 bg-gradient-to-br from-[#578CFF] to-[#4A7AFF] rounded-full border-2 border-white flex items-center justify-center text-sm font-bold text-white shadow-lg">
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-gray-500 font-medium">10,000+ success stories</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold text-[#1F221F] mb-8">Platform</h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/auth/signup" className="text-gray-600 hover:text-[#578CFF] transition-colors duration-300 flex items-center space-x-2 group font-medium">
                    <span>Get Started</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-gray-600 hover:text-[#578CFF] transition-colors duration-300 font-medium">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="text-gray-600 hover:text-[#578CFF] transition-colors duration-300 font-medium">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#testimonials" className="text-gray-600 hover:text-[#578CFF] transition-colors duration-300 font-medium">
                    Success Stories
                  </Link>
                </li>
              </ul>
            </div>

            {/* Interview Types */}
            <div>
              <h3 className="text-lg font-bold text-[#1F221F] mb-8">Interview Types</h3>
              <ul className="space-y-4">
                <li className="text-gray-600 flex items-center space-x-3 font-medium">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Backend Engineer</span>
                </li>
                <li className="text-gray-600 flex items-center space-x-3 font-medium">
                  <div className="w-3 h-3 rounded-full bg-[#578CFF]"></div>
                  <span>Frontend Engineer</span>
                </li>
                <li className="text-gray-600 flex items-center space-x-3 font-medium">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>DevOps Engineer</span>
                </li>
                <li className="text-gray-600 flex items-center space-x-3 font-medium">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span>Behavioral Questions</span>
                </li>
              </ul>
            </div>

            {/* Company Stats */}
            <div>
              <h3 className="text-lg font-bold text-[#1F221F] mb-8">Success Metrics</h3>
              <div className="space-y-6">
                <div className="bg-[#578CFF]/10 p-6 rounded-xl border border-[#578CFF]/20">
                  <div className="text-3xl font-bold text-[#578CFF]">95%</div>
                  <div className="text-sm text-gray-600 font-medium">Success Rate</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600">24/7</div>
                  <div className="text-sm text-gray-600 font-medium">Available</div>
                </div>
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <div className="text-3xl font-bold text-green-600">500+</div>
                  <div className="text-sm text-gray-600 font-medium">Companies</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="pt-10 border-t border-gray-200"
          >
            <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-12">
                <p className="text-gray-500 font-medium">
                  &copy; 2025 VI Mock Interview Agent. Empowering careers with AI.
                </p>
                <div className="flex items-center space-x-8 text-sm text-gray-500">
                  <Link href="#" className="hover:text-[#578CFF] transition-colors duration-300 font-medium">
                    Privacy Policy
                  </Link>
                  <Link href="#" className="hover:text-[#578CFF] transition-colors duration-300 font-medium">
                    Terms of Service
                  </Link>
                  <Link href="#" className="hover:text-[#578CFF] transition-colors duration-300 font-medium">
                    Contact
                  </Link>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3 text-sm text-gray-500 ml-8">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="font-medium">All systems operational</span>
                </div>
                <div className="h-6 w-px bg-gray-300"></div>
                <div className="text-sm text-gray-500 font-medium">
                  Made with 💜 for ambitious candidates
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Decorative bottom gradient */}
        <div className="h-1 bg-gradient-to-r from-[#578CFF] via-[#4A7AFF] to-[#578CFF] opacity-80"></div>
      </footer>
    </div>
  );
};

export default LandingPage;
