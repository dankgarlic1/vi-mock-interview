'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Search, Sparkles, Code, Database, Globe, Server, Cpu, Cloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Skill {
  id: string;
  text: string;
  category?: string;
}

interface SkillsInputProps {
  id: string;
  name: string;
  value: string[];
  label: string;
  onChange: (skills: Skill[]) => void;
  placeholder?: string;
  maxSkills?: number;
}

const PREDEFINED_SKILLS = [
  // Frontend
  { category: 'Frontend', text: 'React' },
  { category: 'Frontend', text: 'Next.js' },
  { category: 'Frontend', text: 'Vue.js' },
  { category: 'Frontend', text: 'Angular' },
  { category: 'Frontend', text: 'TypeScript' },
  { category: 'Frontend', text: 'JavaScript' },
  { category: 'Frontend', text: 'HTML' },
  { category: 'Frontend', text: 'CSS' },
  { category: 'Frontend', text: 'Tailwind CSS' },
  { category: 'Frontend', text: 'SASS' },
  
  // Backend
  { category: 'Backend', text: 'Node.js' },
  { category: 'Backend', text: 'Express.js' },
  { category: 'Backend', text: 'Python' },
  { category: 'Backend', text: 'Django' },
  { category: 'Backend', text: 'FastAPI' },
  { category: 'Backend', text: 'Java' },
  { category: 'Backend', text: 'Spring Boot' },
  { category: 'Backend', text: 'C#' },
  { category: 'Backend', text: '.NET' },
  { category: 'Backend', text: 'Ruby' },
  { category: 'Backend', text: 'Ruby on Rails' },
  { category: 'Backend', text: 'PHP' },
  { category: 'Backend', text: 'Laravel' },
  
  // Database
  { category: 'Database', text: 'PostgreSQL' },
  { category: 'Database', text: 'MySQL' },
  { category: 'Database', text: 'MongoDB' },
  { category: 'Database', text: 'Redis' },
  { category: 'Database', text: 'SQLite' },
  { category: 'Database', text: 'Elasticsearch' },
  
  // DevOps & Cloud
  { category: 'DevOps', text: 'Docker' },
  { category: 'DevOps', text: 'Kubernetes' },
  { category: 'DevOps', text: 'AWS' },
  { category: 'DevOps', text: 'Azure' },
  { category: 'DevOps', text: 'Google Cloud' },
  { category: 'DevOps', text: 'Jenkins' },
  { category: 'DevOps', text: 'GitLab CI' },
  { category: 'DevOps', text: 'GitHub Actions' },
  { category: 'DevOps', text: 'Terraform' },
  { category: 'DevOps', text: 'Ansible' },
  
  // Tools & Others
  { category: 'Tools', text: 'Git' },
  { category: 'Tools', text: 'Linux' },
  { category: 'Tools', text: 'REST APIs' },
  { category: 'Tools', text: 'GraphQL' },
  { category: 'Tools', text: 'Socket.io' },
  { category: 'Tools', text: 'WebRTC' },
];

const getCategoryColor = (category: string) => {
  const colors = {
    'Frontend': 'from-blue-500 to-cyan-500',
    'Backend': 'from-green-500 to-emerald-500',
    'Database': 'from-purple-500 to-violet-500',
    'DevOps': 'from-orange-500 to-red-500',
    'Tools': 'from-pink-500 to-rose-500',
  };
  return colors[category as keyof typeof colors] || 'from-gray-500 to-gray-600';
};

export const SkillsInput: React.FC<SkillsInputProps> = ({
  id,
  name,
  value,
  label,
  onChange,
  placeholder = "Search skills or add custom ones...",
  maxSkills = 20
}) => {
  const [skills, setSkills] = useState<Skill[]>(
    value.map((text, index) => ({ 
      id: String(index), 
      text,
      category: PREDEFINED_SKILLS.find(s => s.text.toLowerCase() === text.toLowerCase())?.category || 'Custom'
    }))
  );
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter predefined skills based on search and already selected skills
  const filteredSkills = PREDEFINED_SKILLS.filter(skill => {
    const matchesSearch = skill.text.toLowerCase().includes(searchTerm.toLowerCase());
    const notAlreadySelected = !skills.some(s => s.text.toLowerCase() === skill.text.toLowerCase());
    return matchesSearch && notAlreadySelected;
  });

  // Group filtered skills by category
  const groupedSkills = filteredSkills.reduce((acc, skill) => {
    const category = skill.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, typeof PREDEFINED_SKILLS>);

  const addSkill = (skillText: string, category?: string) => {
    if (skillText.trim() && skills.length < maxSkills) {
      const newSkill: Skill = {
        id: Date.now().toString(),
        text: skillText.trim(),
        category: category || 'Custom'
      };
      const updatedSkills = [...skills, newSkill];
      setSkills(updatedSkills);
      onChange(updatedSkills);
      setInputValue('');
      setSearchTerm('');
    }
  };

  const removeSkill = (skillId: string) => {
    const updatedSkills = skills.filter(skill => skill.id !== skillId);
    setSkills(updatedSkills);
    onChange(updatedSkills);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addSkill(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && skills.length > 0) {
      removeSkill(skills[skills.length - 1].id);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchTerm(value);
    setIsOpen(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-3" ref={containerRef}>
      <label htmlFor={id} className="block text-sm font-medium text-[#1F221F] mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#578CFF]" />
          {label}
          <span className="text-xs text-gray-500">({skills.length}/{maxSkills})</span>
        </div>
      </label>

      {/* Selected Skills Display */}
      <AnimatePresence>
        {skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 p-3 bg-gray-50/80 rounded-xl border border-gray-200 backdrop-blur-sm"
          >
            {skills.map((skill, index) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "group relative flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-white",
                  "bg-gradient-to-r shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105",
                  getCategoryColor(skill.category || 'Tools')
                )}
              >
                <span>{skill.text}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill.id)}
                  className="ml-1 p-0.5 rounded-full hover:bg-white/20 transition-colors duration-200"
                >
                  <X className="w-3 h-3" />
                </button>
                
                {/* Tooltip for category */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {skill.category}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Field */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={inputRef}
            id={id}
            name={name}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            disabled={skills.length >= maxSkills}
            className={cn(
              "w-full pl-10 pr-12 py-3 bg-white border-2 border-gray-200 rounded-xl",
              "text-[#1F221F] placeholder-gray-400 font-medium",
              "focus:border-[#578CFF] focus:ring-2 focus:ring-[#578CFF]/20 focus:outline-none",
              "transition-all duration-300 backdrop-blur-sm",
              skills.length >= maxSkills && "opacity-50 cursor-not-allowed"
            )}
          />
          
          {inputValue && (
            <button
              type="button"
              onClick={() => addSkill(inputValue)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-[#578CFF] hover:bg-[#4A7AFF] transition-colors duration-200"
            >
              <Plus className="w-3 h-3 text-white" />
            </button>
          )}
        </div>

        {/* Dropdown with predefined skills */}
        <AnimatePresence>
          {isOpen && (Object.keys(groupedSkills).length > 0 || searchTerm) && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl backdrop-blur-xl max-h-64 overflow-y-auto"
            >
              {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                <div key={category} className="p-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-1">
                    {category}
                  </div>
                  {categorySkills.map((skill, index) => (
                    <motion.button
                      key={skill.text}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      type="button"
                      onClick={() => addSkill(skill.text, skill.category)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left",
                        "hover:bg-gray-100 transition-colors duration-200",
                        "text-[#1F221F] hover:text-[#578CFF]"
                      )}
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full bg-gradient-to-r",
                        getCategoryColor(skill.category || 'Tools')
                      )}></div>
                      <span>{skill.text}</span>
                    </motion.button>
                  ))}
                </div>
              ))}
              
              {/* Add custom skill option */}
              {searchTerm && !filteredSkills.some(s => s.text.toLowerCase() === searchTerm.toLowerCase()) && (
                <div className="p-2 border-t border-gray-200">
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    type="button"
                    onClick={() => addSkill(searchTerm)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left hover:bg-gray-100 transition-colors duration-200 text-gray-600 hover:text-[#1F221F]"
                  >
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-500"></div>
                    <span>Add "{searchTerm}" as custom skill</span>
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Helpful text */}
      <p className="text-xs text-gray-500 flex items-center gap-1">
        <span>💡</span>
        Type to search skills or add your own custom skills
      </p>
    </div>
  );
}; 