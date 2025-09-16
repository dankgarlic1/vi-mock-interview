'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@radix-ui/react-label';
import {
  InputDemo,
  NationalitySelect,
  PhoneInput,
  PhoneInputComponent,
  SelectDemo,
  TextArea,
} from '@/components/ui/origin';
import { SkillsInput } from '@/components/ui/SkillsInput';
import { toast, Toaster } from 'sonner';
import { uploadCandidateInfo } from '@/actions/onStudentInfo';
import { redirect } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { toastStyles } from '@/lib/utils';
import {
  LogOut,
  Brain,
  Sparkles,
  GraduationCap,
  Globe,
  Briefcase,
  User,
  Star,
  Zap,
  Rocket,
  Award,
  Target,
  ChevronRight,
  Code,
  Heart,
  Settings,
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

interface CandidateData {
  name: string;
  phone: string;
  age: number;
  nationality: string;
  currentRole: string;
  yearsOfExperience: number;
  targetRole: string;
  skills: string[];
  preferredCompanies: string;
  careerGoals: string;
  interviewPreferences?: string;
}

const FloatingParticle = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 100 }}
    animate={{ 
      opacity: [0, 1, 0],
      y: [-100, -200],
      x: [0, Math.random() * 50 - 25]
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "easeOut"
    }}
    className="absolute w-1 h-1 bg-[#578CFF] rounded-full"
    style={{
      left: `${Math.random() * 100}%`,
      bottom: '-10px'
    }}
  />
);

const AnimatedIcon = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ 
      type: "spring", 
      stiffness: 200, 
      damping: 15,
      delay 
    }}
    whileHover={{ 
      scale: 1.1, 
      rotate: 5,
      transition: { duration: 0.2 }
    }}
    className="relative"
  >
    {children}
    <motion.div
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.5, 0, 0.5]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="absolute inset-0 bg-[#578CFF] rounded-full blur-md opacity-30"
    />
  </motion.div>
);

const StudentDataForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 100]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  
  const [formData, setFormData] = useState<CandidateData>({
    name: '',
    phone: '',
    age: 0,
    nationality: '',
    currentRole: '',
    yearsOfExperience: 0,
    targetRole: '',
    skills: [],
    preferredCompanies: '',
    careerGoals: '',
    interviewPreferences: '',
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' || name === 'yearsOfExperience' ? Number(value) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSkillsChange = (skills: { id: string; text: string }[]) => {
    const updatedSkills = skills.map((skill) => skill.text);
    setFormData((prevState) => ({
      ...prevState,
      skills: updatedSkills,
    }));
  };

  const validateStep = (stepNumber: number) => {
    const errors: string[] = [];
    
    if (stepNumber === 1) {
      // Step 1 validation
      if (!formData.name.trim()) errors.push('Name is required');
      if (!formData.phone.trim()) errors.push('Phone is required');
      
      // Phone number validation - must be exactly 10 digits
      if (formData.phone.trim()) {
        const phoneDigits = formData.phone.replace(/\D/g, ''); // Remove all non-digit characters
        if (phoneDigits.length !== 10) {
          errors.push('Phone number must contain exactly 10 digits');
        }
      }
      
      if (formData.age < 18) errors.push('Age must be at least 18');
      if (!formData.nationality.trim()) errors.push('Nationality is required');
    } else if (stepNumber === 2) {
      // Step 2 validation
      if (!formData.currentRole.trim()) errors.push('Current role is required');
      if (formData.yearsOfExperience < 0) errors.push('Years of experience must be at least 0');
      if (!formData.targetRole.trim()) errors.push('Target role is required');
      if (formData.skills.length === 0) errors.push('At least one skill is required');
    } else if (stepNumber === 3) {
      // Step 3 validation
      if (!formData.preferredCompanies.trim()) errors.push('Preferred companies are required');
      if (!formData.careerGoals.trim()) errors.push('Career goals are required');
    }
    
    return errors;
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    // Validate all steps for final submission
    const step1Errors = validateStep(1);
    const step2Errors = validateStep(2);
    const step3Errors = validateStep(3);
    
    errors.push(...step1Errors, ...step2Errors, ...step3Errors);
    
    return errors;
  };

  async function handleFormAction(formdata: FormData) {
    setLoading(true);
    
    // Validate form before submission
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setLoading(false);
      toast.error(`Please fix the following errors: ${validationErrors.join(', ')}`, toastStyles.error);
      return;
    }
    
    // Use the React state directly instead of trying to extract from FormData
    // since some values (nationality, targetRole, skills) are controlled by React state
    const data = {
      name: formData.name,
      phone: formData.phone,
      age: formData.age,
      nationality: formData.nationality,
      currentRole: formData.currentRole,
      yearsOfExperience: formData.yearsOfExperience,
      targetRole: formData.targetRole,
      skills: formData.skills.join(', '), // Convert array to comma-separated string for database
      preferredCompanies: formData.preferredCompanies,
      careerGoals: formData.careerGoals,
      interviewPreferences: formData.interviewPreferences || '',
    };

    console.log('Form Data:', data);

    try {
      const response = await uploadCandidateInfo(data);
      console.log('Response:', response);
      if (response) {
        setLoading(false);
        toast.success('Information saved successfully! Redirecting to dashboard...', toastStyles.success);
        // Add delay to show toast before redirect
        setTimeout(() => {
          redirect('/dashboard');
        }, 1000);
      }
    } catch (error) {
      setLoading(false);
      console.error('Error submitting form:', error);
      toast.error('Error uploading candidate information. Please check all fields.', toastStyles.error);
    }
  }

  const nextStep = () => {
    // Validate current step before moving to next
    const currentStepErrors = validateStep(step);
    if (currentStepErrors.length > 0) {
      toast.error(`Please fix the following errors: ${currentStepErrors.join(', ')}`, toastStyles.error);
      return;
    }
    
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const getStepProgress = () => (step / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 text-gray-900 overflow-hidden relative">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          style={{ x: y1, y: y2 }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-[#578CFF]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"
        />
        <motion.div 
          style={{ x: y2, y: y1 }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse animation-delay-2000"
        />
        <motion.div 
          style={{ x: y1 }}
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-300/15 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-4000"
        />
        
        {/* Interactive cursor glow */}
        <div 
          className="absolute pointer-events-none w-96 h-96 bg-gradient-radial from-[#578CFF]/20 to-transparent rounded-full filter blur-3xl transition-all duration-300"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />

        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.3} />
        ))}
      </div>

      {/* Header with magical elements */}
      <header className="container mx-auto px-8 md:px-16 lg:px-24 py-8 flex justify-between items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-3 ml-8 md:ml-12 lg:ml-16"
        >
          <AnimatedIcon>
            <div className="p-3 bg-gradient-to-br from-[#578CFF] to-[#4A7AFF] rounded-2xl shadow-2xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </AnimatedIcon>
          <div>
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-[#1F221F]"
            >
              VI Mock Interview Agent
            </motion.span>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-gray-600 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Candidate Information Setup
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mr-8 md:mr-12 lg:mr-16"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut()}
            className="text-gray-600 hover:text-[#1F221F] hover:bg-gray-100 transition-all duration-300 rounded-xl"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </motion.div>
      </header>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 mb-8 relative z-10"
      >
        <div className="bg-gray-200/50 backdrop-blur-sm rounded-xl p-1 border border-gray-200">
          <motion.div
            className="h-2 bg-gradient-to-r from-[#578CFF] via-[#4A7AFF] to-[#578CFF] rounded-xl relative overflow-hidden"
            style={{ width: `${getStepProgress()}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute inset-0 bg-white/30"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>
        <div className="flex justify-between mt-2 text-sm">
          {['Personal Info', 'Professional Details', 'Preferences'].map((label, index) => (
            <motion.span
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-1 ${
                step > index + 1 ? 'text-green-500' : step === index + 1 ? 'text-[#578CFF]' : 'text-gray-500'
              }`}
            >
              {step > index + 1 && <Star className="w-3 h-3 fill-current" />}
              {label}
            </motion.span>
          ))}
        </div>
      </motion.div>

      <div className="container max-w-5xl mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          {/* Main form card with glass morphism */}
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-100 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#578CFF] via-[#4A7AFF] to-[#578CFF]" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#578CFF]/10 to-transparent rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-300/10 to-transparent rounded-full blur-3xl" />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-10"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-4"
              >
                <div className="p-4 bg-gradient-to-br from-[#578CFF] to-[#4A7AFF] rounded-2xl shadow-2xl">
                  {step === 1 && <User className="h-8 w-8 text-white" />}
                  {step === 2 && <Briefcase className="h-8 w-8 text-white" />}
                  {step === 3 && <Target className="h-8 w-8 text-white" />}
                </div>
              </motion.div>
              
              <h1 className="text-4xl font-bold mb-2 text-[#1F221F]">
                {step === 1 && "Tell Us About Yourself"}
                {step === 2 && "Your Professional Journey"}
                {step === 3 && "Your Goals & Preferences"}
              </h1>
              <p className="text-gray-600 text-lg">
                {step === 1 && "Let's start with your basic information"}
                {step === 2 && "Share your professional background with us"}
                {step === 3 && "Help us personalize your interview experience"}
              </p>
            </motion.div>

            <form className="space-y-8" onSubmit={(e) => {
              e.preventDefault();
              if (step === 3) {
                handleFormAction(new FormData(e.target as HTMLFormElement));
              }
            }}>
              <AnimatePresence mode="wait">
                {/* Step 1: Personal Information */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        { id: 'name', label: 'Full Name', placeholder: 'John Doe', icon: User },
                        { id: 'phone', label: 'Phone Number', placeholder: '+1 234 567 8900', icon: Globe },
                        { id: 'age', label: 'Age', placeholder: '25', icon: User }
                      ].map((field, index) => (
                        <motion.div
                          key={field.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group"
                        >
                          <div className="relative bg-gray-50/80 border border-gray-200 focus-within:border-[#578CFF]/50 rounded-2xl p-1 transition-all duration-300 hover:shadow-lg hover:shadow-[#578CFF]/10">
                            <div className="flex items-center gap-3 p-3">
                              <div className="p-2 bg-gradient-to-br from-[#578CFF] to-[#4A7AFF] rounded-xl">
                                <field.icon className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <InputDemo
                                  id={field.id}
                                  label={field.label}
                                  placeholder={field.placeholder}
                                  name={field.id}
                                  value={(formData[field.id as keyof CandidateData] || '').toString()}
                                  onChange={handleChange}
                                  className="border-0 bg-transparent"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-gray-50/80 border border-gray-200 focus-within:border-[#578CFF]/50 rounded-2xl p-4"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gradient-to-br from-[#578CFF] to-[#4A7AFF] rounded-xl">
                          <Globe className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[#1F221F] font-semibold">Nationality</span>
                      </div>
                      <NationalitySelect
                        id="nationality"
                        name="nationality"
                        value={formData.nationality}
                        onChange={(value) => handleSelectChange('nationality', value)}
                      />
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 2: Professional Background */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        { id: 'currentRole', label: 'Current Role', placeholder: 'Software Engineer', icon: Briefcase },
                        { id: 'yearsOfExperience', label: 'Years of Experience', placeholder: '3', icon: Award }
                      ].map((field, index) => (
                        <motion.div
                          key={field.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group"
                        >
                          <div className="relative bg-gray-50/80 border border-gray-200 focus-within:border-[#578CFF]/50 rounded-2xl p-1 transition-all duration-300 hover:shadow-lg hover:shadow-[#578CFF]/10">
                            <div className="flex items-center gap-3 p-3">
                              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                                <field.icon className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <InputDemo
                                  id={field.id}
                                  label={field.label}
                                  placeholder={field.placeholder}
                                  name={field.id}
                                  value={(formData[field.id as keyof CandidateData] || '').toString()}
                                  onChange={handleChange}
                                  className="border-0 bg-transparent"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gray-50/80 border border-gray-200 focus-within:border-[#578CFF]/50 rounded-2xl p-4"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                          <Target className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[#1F221F] font-semibold">Target Role</span>
                      </div>
                      <SelectDemo
                        id="targetRole"
                        name="targetRole"
                        label=""
                        options={['Backend Engineer', 'Frontend Engineer', 'DevOps']}
                        value={formData.targetRole}
                        onChange={(value) => handleSelectChange('targetRole', value)}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gray-50/80 border border-gray-200 focus-within:border-[#578CFF]/50 rounded-2xl p-4"
                    >
                      <SkillsInput
                        id="skills"
                        name="skills"
                        label="Technical Skills"
                        value={formData.skills}
                        onChange={handleSkillsChange}
                        maxSkills={15}
                      />
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 3: Goals & Preferences */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    {[
                      { id: 'careerGoals', label: 'Career Goals', placeholder: 'Describe your career aspirations...', icon: Rocket },
                      { id: 'preferredCompanies', label: 'Preferred Companies', placeholder: 'Google, Microsoft, Amazon...', icon: Heart },
                      { id: 'interviewPreferences', label: 'Interview Preferences', placeholder: 'Any specific preferences or requirements...', icon: Settings }
                    ].map((field, index) => (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-50/80 border border-gray-200 focus-within:border-[#578CFF]/50 rounded-2xl p-4"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl">
                            <field.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-[#1F221F] font-semibold">{field.label}</span>
                        </div>
                        <TextArea
                          label=""
                          id={field.id}
                          name={field.id}
                          value={formData[field.id as keyof CandidateData] as string}
                          onChange={handleChange}
                          placeholder={field.placeholder}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex justify-between items-center mt-10"
              >
                <Button
                  type="button"
                  onClick={prevStep}
                  disabled={step === 1}
                  variant="outline"
                  className="px-8 py-3 bg-transparent border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-[#1F221F] transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </Button>

                <div className="flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        i === step 
                          ? 'bg-gradient-to-r from-[#578CFF] to-[#4A7AFF] scale-125' 
                          : i < step 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="px-8 py-3 bg-gradient-to-r from-[#578CFF] to-[#4A7AFF] text-white hover:from-[#4A7AFF] hover:to-[#578CFF] transition-all duration-300 rounded-xl group"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => handleFormAction(new FormData())}
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all duration-300 rounded-xl relative overflow-hidden group"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>Complete Setup</span>
                        <Zap className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    )}
                    
                    {!loading && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                    )}
                  </Button>
                )}
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>
      
      <Toaster />
    </div>
  );
};

export default StudentDataForm;
