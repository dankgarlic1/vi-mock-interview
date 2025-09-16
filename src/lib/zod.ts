import { z } from "zod";


export const candidateDataSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .max(15, "Phone number must be less than 15 characters"),
  age: z.number().min(18, "Age must be at least 18").max(100, "Age must be less than 100"),
  nationality: z.string().min(1, "Nationality is required"),
  currentRole: z.string().min(1, "Current role is required"),
  yearsOfExperience: z.number().min(0, "Years of experience must be at least 0").max(50, "Years of experience must be less than 50"),
  targetRole: z.string().min(1, "Target role is required"),
  skills: z.string().min(1, "Skills are required"),
  preferredCompanies: z.string().min(1, "Preferred companies are required"),
  careerGoals: z.string().min(1, "Career goals are required"),
  interviewPreferences: z.string().optional(),
});