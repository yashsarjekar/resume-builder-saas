import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

export const resumeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  jobDescription: z.string().min(10, 'Job description must be at least 10 characters'),
  personalInfo: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
  }),
  summary: z.string().min(10, 'Summary must be at least 10 characters'),
  experience: z.array(z.object({
    company: z.string().min(1, 'Company name is required'),
    title: z.string().min(1, 'Job title is required'),
    duration: z.string().min(1, 'Duration is required'),
    bullets: z.array(z.string()).min(1, 'At least one bullet point is required'),
  })).min(1, 'At least one experience entry is required'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  education: z.array(z.object({
    institution: z.string().min(1, 'Institution name is required'),
    degree: z.string().min(1, 'Degree is required'),
    year: z.string().min(1, 'Year is required'),
  })).min(1, 'At least one education entry is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ResumeFormData = z.infer<typeof resumeSchema>;
