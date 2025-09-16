export interface User {
    id: string; 
    name?: string | null; 
    email: string; 
    username?: string | null; 
    password?: string | null;
    emailVerified?: Date | null;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
    phone?: string | null; 
    age?: number | null;
    nationality?: string | null; 
    currentRole?: string | null;
    yearsOfExperience?: number | null;
    targetRole?: string | null;
    skills?: string | null; 
    preferredCompanies?: string | null; 
    careerGoals?: string | null; 
    interviewPreferences?: string | null; 
    filledProfile?: boolean | null;
}
  