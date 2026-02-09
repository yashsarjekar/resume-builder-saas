export interface Resume {
  id: number;
  user_id: number;
  title: string;
  job_description: string;
  content: ResumeContent;
  optimized_content?: ResumeContent;
  ats_score?: number;
  template_name: string;
  created_at: string;
  updated_at: string;
}

export interface ResumeContent {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
  };
  summary: string;
  experience: Experience[];
  skills: string[];
  education: Education[];
}

export interface Experience {
  company: string;
  title: string;
  duration: string;
  bullets: string[];
}

export interface Education {
  institution: string;
  degree: string;
  year: string;
}

export interface CreateResumeData {
  title: string;
  job_description: string;
  content: ResumeContent;
  template_name?: string;
}

export interface UpdateResumeData {
  title?: string;
  job_description?: string;
  content?: ResumeContent;
  optimized_content?: ResumeContent;
  ats_score?: number;
  template_name?: string;
}
