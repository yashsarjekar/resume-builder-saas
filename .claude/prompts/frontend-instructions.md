# Frontend Development Instructions

You are building the Resume Builder SaaS frontend using Next.js 14, TypeScript, and Tailwind CSS.

## Project Setup
```bash
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir
cd frontend
npm install axios zustand @tanstack/react-query react-hook-form zod @hookform/resolvers lucide-react sonner
npx shadcn-ui@latest init
```

## Project Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Landing page
│   │   ├── globals.css
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── builder/
│   │   │   └── page.tsx
│   │   └── pricing/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/                         # shadcn components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── resume/
│   │   │   ├── ResumeForm.tsx
│   │   │   ├── ATSScoreCard.tsx
│   │   │   ├── ResumePreview.tsx
│   │   │   └── TemplateSelector.tsx
│   │   └── dashboard/
│   │       ├── ResumeCard.tsx
│   │       └── UsageStats.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── validators.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useResume.ts
│   │   └── usePayment.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   └── resumeStore.ts
│   └── types/
│       ├── user.ts
│       ├── resume.ts
│       └── api.ts
├── public/
├── .env.local.example
└── package.json
```

## Implementation Steps

### Step 1: Environment Setup

Create `.env.local.example`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_RAZORPAY_KEY=your_razorpay_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 2: API Client

**src/lib/api.ts:**
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Step 3: Type Definitions

**src/types/user.ts:**
```typescript
export interface User {
  id: number;
  email: string;
  name: string;
  subscription_type: 'free' | 'starter' | 'pro';
  resume_count: number;
  ats_analysis_count: number;
  created_at: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}
```

**src/types/resume.ts:**
```typescript
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
```

### Step 4: Auth Store (Zustand)

**src/store/authStore.ts:**
```typescript
import { create } from 'zustand';
import { User, LoginData, SignupData } from '@/types/user';
import api from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  
  login: async (data: LoginData) => {
    set({ loading: true });
    try {
      const response = await api.post('/api/auth/login', data);
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      set({ user, token: access_token, isAuthenticated: true, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  signup: async (data: SignupData) => {
    set({ loading: true });
    try {
      const response = await api.post('/api/auth/signup', data);
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      set({ user, token: access_token, isAuthenticated: true, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await api.get('/api/auth/me');
      set({ user: response.data, token, isAuthenticated: true });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
```

### Step 5: Pages Implementation

**Landing Page (src/app/page.tsx)** - Implement:
- Hero section with clear value proposition
- Problem/Solution sections
- Features showcase
- Pricing preview
- CTA buttons
- Mobile responsive

**Login Page (src/app/(auth)/login/page.tsx)** - Implement:
- Email/password form
- Form validation with Zod
- Error handling
- Redirect after login

**Signup Page (src/app/(auth)/signup/page.tsx)** - Implement:
- Name, email, password form
- Password strength indicator
- Terms checkbox
- Form validation

**Dashboard (src/app/dashboard/page.tsx)** - Implement:
- Welcome message
- Usage stats card
- Resume list with cards
- Create new resume button
- Empty state

**Resume Builder (src/app/builder/page.tsx)** - Implement:
- Split layout (form + preview)
- Job description input
- Personal info form
- Experience/skills/education sections
- ATS score display
- Optimize button
- Download PDF button

**Pricing Page (src/app/pricing/page.tsx)** - Implement:
- 3 pricing tiers
- Feature comparison
- Payment modal
- Razorpay integration

### Step 6: Components

Implement these key components:
- **Header.tsx** - Navigation with auth buttons
- **Footer.tsx** - Links and copyright
- **LoginForm.tsx** - Reusable login form
- **SignupForm.tsx** - Reusable signup form
- **ResumeForm.tsx** - Main resume input form
- **ATSScoreCard.tsx** - Display ATS score with visual indicator
- **ResumePreview.tsx** - Live resume preview
- **ResumeCard.tsx** - Resume card for dashboard
- **UsageStats.tsx** - Show usage limits

### Step 7: Validation Schemas

**src/lib/validators.ts:**
```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to terms'),
});

export const resumeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  jobDescription: z.string().min(10, 'Job description too short'),
  personalInfo: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    location: z.string().optional(),
  }),
});
```

## Design Guidelines

- Use Tailwind utility classes
- Mobile-first responsive design
- Primary color: Blue (blue-600)
- Use shadcn/ui components for consistency
- Add hover states for interactive elements
- Show loading spinners for async operations
- Display toast notifications for success/error messages

## Implementation Order

1. Set up Next.js project with dependencies
2. Create folder structure
3. Implement type definitions
4. Set up API client
5. Implement auth store
6. Create layout components (Header, Footer)
7. Build landing page
8. Build auth pages (login, signup)
9. Build dashboard
10. Build resume builder
11. Build pricing page
12. Add payment integration
13. Polish and test

---

**Start implementing now. Create the project structure first, then build pages in order: Landing → Auth → Dashboard → Builder → Pricing.**