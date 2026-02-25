# Frontend Development Prompt - Resume Builder SaaS

**IMPORTANT:** Read the file `.claude/prompts/frontend-instructions.md` and implement the COMPLETE frontend application following all specifications.

## Project Overview

Build a modern, responsive frontend for an AI-powered ATS-optimized resume builder SaaS platform for Indian job seekers. The application features resume creation, AI-powered optimization, ATS analysis, and Razorpay payment integration.

## Technology Stack

- **Framework:** Next.js 14+ (App Router) with TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context API / Zustand
- **Forms:** React Hook Form with Zod validation
- **API Client:** Axios / Fetch API
- **Payment:** Razorpay Web SDK
- **UI Components:** shadcn/ui or custom components
- **Authentication:** JWT-based auth with HTTP-only cookies (recommended) or localStorage

## Backend API Base URL

- **Production:** `https://resume-builder-backend-production-f9db.up.railway.app`
- **Local Development:** `http://localhost:8000`

---

## Complete API Documentation

### 1. Authentication APIs (`/api/auth`)

#### POST `/api/auth/signup`
Register a new user account.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string (min 8 chars)"
}
```

**Response (201):**
```json
{
  "id": "number",
  "email": "string",
  "name": "string",
  "subscription_type": "free",
  "subscription_expiry": "datetime | null",
  "resume_count": 0,
  "ats_analysis_count": 0,
  "created_at": "datetime"
}
```

**Triggers:** Welcome email to user

---

#### POST `/api/auth/login`
Login to existing account.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "access_token": "string",
  "token_type": "bearer",
  "user": {
    "id": "number",
    "email": "string",
    "name": "string",
    "subscription_type": "free|starter|pro"
  }
}
```

---

#### GET `/api/auth/me`
Get current user profile.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "id": "number",
  "email": "string",
  "name": "string",
  "subscription_type": "string",
  "subscription_expiry": "datetime | null",
  "resume_count": "number",
  "ats_analysis_count": "number",
  "created_at": "datetime"
}
```

---

#### GET `/api/auth/subscription`
Get current user's subscription details.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "subscription_type": "free|starter|pro",
  "expiry_date": "datetime | null",
  "is_active": "boolean",
  "limits": {
    "resume_limit": "number",
    "ats_analysis_limit": "number",
    "ai_assist_limit": "number"
  },
  "usage": {
    "resumes_created": "number",
    "ats_analyses_used": "number",
    "ai_assists_used": "number"
  }
}
```

---

#### PUT `/api/auth/profile`
Update user profile.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "name": "string (optional)",
  "email": "string (optional)"
}
```

**Response (200):** Updated user object

---

#### PUT `/api/auth/change-password`
Change user password.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "current_password": "string",
  "new_password": "string (min 8 chars)"
}
```

**Response (200):**
```json
{
  "message": "Password updated successfully"
}
```

---

### 2. Resume APIs (`/api/resume`)

#### POST `/api/resume/`
Create a new resume.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "title": "string",
  "content": {
    "personalInfo": {
      "name": "string",
      "email": "string",
      "phone": "string",
      "location": "string (optional)",
      "linkedin": "string (optional)",
      "portfolio": "string (optional)"
    },
    "summary": "string",
    "experience": [
      {
        "title": "string",
        "company": "string",
        "location": "string",
        "startDate": "YYYY-MM",
        "endDate": "YYYY-MM | Present",
        "description": "string",
        "achievements": ["string"]
      }
    ],
    "education": [
      {
        "degree": "string",
        "institution": "string",
        "location": "string",
        "graduationDate": "YYYY-MM",
        "gpa": "string (optional)",
        "achievements": ["string (optional)"]
      }
    ],
    "skills": {
      "technical": ["string"],
      "soft": ["string (optional)"],
      "languages": ["string (optional)"]
    },
    "projects": [
      {
        "title": "string",
        "description": "string",
        "technologies": ["string"],
        "link": "string (optional)"
      }
    ],
    "certifications": [
      {
        "name": "string",
        "issuer": "string",
        "date": "YYYY-MM",
        "link": "string (optional)"
      }
    ]
  }
}
```

**Response (201):** Resume object with ID

**Limit:** Based on subscription (FREE: 1, STARTER: 5, PRO: 999)

---

#### GET `/api/resume/`
Get all resumes for current user.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `sort_by`: "created_at" | "updated_at" | "title" (default: "updated_at")
- `order`: "asc" | "desc" (default: "desc")

**Response (200):**
```json
{
  "resumes": [
    {
      "id": "number",
      "title": "string",
      "created_at": "datetime",
      "updated_at": "datetime",
      "ats_score": "number | null"
    }
  ],
  "total": "number",
  "page": "number",
  "total_pages": "number"
}
```

---

#### GET `/api/resume/{resume_id}`
Get specific resume by ID.

**Headers:** `Authorization: Bearer {token}`

**Response (200):** Full resume object with content

---

#### PUT `/api/resume/{resume_id}`
Update existing resume.

**Headers:** `Authorization: Bearer {token}`

**Request Body:** Same as create resume

**Response (200):** Updated resume object

---

#### DELETE `/api/resume/{resume_id}`
Delete a resume.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "message": "Resume deleted successfully"
}
```

---

#### GET `/api/resume/stats/summary`
Get resume statistics.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "total_resumes": "number",
  "avg_ats_score": "number",
  "resumes_by_month": {
    "YYYY-MM": "number"
  }
}
```

---

#### POST `/api/resume/{resume_id}/download`
Download resume as PDF.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "template": "modern" | "classic" | "minimal" (default: "modern")
}
```

**Response (200):** PDF file (application/pdf)

---

#### POST `/api/resume/upload`
Upload and parse existing resume.

**Headers:** `Authorization: Bearer {token}`

**Request:** Multipart form-data
- `file`: PDF or DOCX file

**Response (200):**
```json
{
  "parsed_content": {
    "personalInfo": {...},
    "summary": "string",
    "experience": [...],
    "education": [...],
    "skills": {...}
  }
}
```

---

### 3. AI Feature APIs (`/api/ai`)

#### POST `/api/ai/analyze-resume/{resume_id}`
Perform ATS analysis on a resume.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "score": "number (0-100)",
  "feedback": {
    "strengths": ["string"],
    "weaknesses": ["string"],
    "suggestions": ["string"],
    "keyword_match": "number (0-100)",
    "formatting_score": "number (0-100)",
    "content_score": "number (0-100)"
  },
  "missing_keywords": ["string"],
  "analysis_date": "datetime"
}
```

**Limit:** Based on subscription (FREE: 2, STARTER: 10, PRO: 999)

---

#### POST `/api/ai/extract-keywords`
Extract relevant keywords from job description.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "job_description": "string"
}
```

**Response (200):**
```json
{
  "keywords": {
    "technical": ["string"],
    "soft_skills": ["string"],
    "requirements": ["string"]
  }
}
```

---

#### POST `/api/ai/optimize-resume`
Get AI suggestions to optimize resume.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "resume_content": { /* resume content object */ },
  "job_description": "string"
}
```

**Response (200):**
```json
{
  "optimized_summary": "string",
  "optimized_experience": [...],
  "keyword_suggestions": ["string"],
  "overall_improvements": ["string"]
}
```

---

#### POST `/api/ai/generate-cover-letter`
Generate AI cover letter.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "resume_content": { /* resume content object */ },
  "job_description": "string",
  "company_name": "string"
}
```

**Response (200):**
```json
{
  "cover_letter": "string (formatted HTML)",
  "plain_text": "string"
}
```

---

#### POST `/api/ai/optimize-linkedin`
Get LinkedIn profile optimization suggestions.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "resume_content": { /* resume content object */ }
}
```

**Response (200):**
```json
{
  "headline": "string",
  "about": "string",
  "experience_descriptions": ["string"],
  "skills_to_add": ["string"]
}
```

---

### 4. Payment APIs (`/api/payment`)

#### GET `/api/payment/pricing`
Get pricing information.

**Response (200):**
```json
{
  "plans": {
    "FREE": {
      "name": "Free",
      "price": 0,
      "features": [
        "1 resume",
        "2 ATS analyses",
        "10 AI assists/day",
        "Basic templates"
      ],
      "resume_limit": 1,
      "ats_analysis_limit": 2,
      "ai_assist_limit": 10
    },
    "STARTER": {
      "name": "Starter",
      "price_monthly": 299,
      "price_annual": 2999,
      "features": [
        "5 resumes",
        "10 ATS analyses/month",
        "50 AI assists/day",
        "All templates",
        "Cover letter generation",
        "LinkedIn optimization"
      ],
      "resume_limit": 5,
      "ats_analysis_limit": 10,
      "ai_assist_limit": 50
    },
    "PRO": {
      "name": "Professional",
      "price_monthly": 599,
      "price_annual": 5999,
      "features": [
        "Unlimited resumes",
        "Unlimited ATS analyses",
        "Unlimited AI assists",
        "All templates",
        "Priority support",
        "Advanced AI features"
      ],
      "resume_limit": 999,
      "ats_analysis_limit": 999,
      "ai_assist_limit": 999
    }
  }
}
```

---

#### POST `/api/payment/create-order`
Create Razorpay order for subscription.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "plan": "STARTER" | "PRO",
  "billing_cycle": "monthly" | "annual"
}
```

**Response (200):**
```json
{
  "order_id": "string (Razorpay order ID)",
  "amount": "number (in paise)",
  "currency": "INR",
  "razorpay_key": "string (Razorpay public key)"
}
```

---

#### POST `/api/payment/verify`
Verify Razorpay payment.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "razorpay_order_id": "string",
  "razorpay_payment_id": "string",
  "razorpay_signature": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "subscription_type": "STARTER" | "PRO",
  "expiry_date": "datetime"
}
```

**Triggers:** Payment success email to user

---

#### GET `/api/payment/history`
Get payment history.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "payments": [
    {
      "id": "number",
      "amount": "number",
      "currency": "INR",
      "status": "success" | "failed" | "pending",
      "razorpay_payment_id": "string",
      "plan": "STARTER" | "PRO",
      "billing_cycle": "monthly" | "annual",
      "created_at": "datetime"
    }
  ]
}
```

---

#### GET `/api/payment/subscription`
Get current subscription details.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "active": true,
  "plan": "STARTER" | "PRO",
  "expires_at": "datetime",
  "auto_renew": false,
  "payment_method": "Razorpay"
}
```

---

### 5. General APIs

#### GET `/health`
Health check endpoint.

**Response (200):**
```json
{
  "status": "healthy",
  "environment": "production",
  "redis": "healthy",
  "cache_enabled": true,
  "rate_limit_enabled": true
}
```

---

## Frontend Pages & Features to Implement

### 1. Landing Page (`/`)
- **Hero Section:** Compelling headline, CTA for signup
- **Features Section:** Highlight key features (AI optimization, ATS analysis, templates)
- **Pricing Section:** Display all plans with features
- **Testimonials:** Social proof
- **FAQ Section**
- **Footer:** Links, contact info

### 2. Authentication Pages
- **Signup Page (`/signup`):** Registration form with email verification
- **Login Page (`/login`):** Login form with "Forgot Password" link
- **Profile Page (`/profile`):** Edit name, email, change password

### 3. Dashboard (`/dashboard`)
- **Overview:** Resume count, ATS score average, subscription status
- **Quick Actions:** Create new resume, upload resume
- **Recent Resumes:** List of latest resumes with edit/delete actions
- **Usage Stats:** Visual representation of limits (resumes, ATS analyses)
- **Subscription Card:** Current plan, upgrade CTA

### 4. Resume Management
- **Resume List (`/resumes`):** Grid/list view of all resumes, search, filter, sort
- **Create Resume (`/resumes/new`):** Multi-step form wizard
  - Step 1: Personal Information
  - Step 2: Work Experience (add multiple)
  - Step 3: Education (add multiple)
  - Step 4: Skills (categorized)
  - Step 5: Projects & Certifications
  - Step 6: Review & Save
- **Edit Resume (`/resumes/{id}/edit`):** Same form as create, pre-filled
- **Resume Preview (`/resumes/{id}/preview`):** Live preview with template selection

### 5. AI Features
- **ATS Analysis (`/resumes/{id}/ats-analysis`):**
  - Display ATS score with visual gauge
  - Show strengths, weaknesses, suggestions
  - Keyword match percentage
  - Section-wise scores
- **Resume Optimizer (`/resumes/{id}/optimize`):**
  - Job description input
  - AI-generated optimizations
  - Side-by-side comparison
  - Apply suggestions
- **Cover Letter Generator (`/cover-letter`):**
  - Select resume
  - Input job description & company name
  - Generate and edit cover letter
  - Download as PDF
- **LinkedIn Optimizer (`/linkedin-optimizer`):**
  - Select resume
  - Get LinkedIn profile suggestions
  - Copy to clipboard

### 6. Subscription & Payments
- **Pricing Page (`/pricing`):** All plans with feature comparison
- **Checkout Page (`/checkout`):**
  - Plan selection
  - Razorpay integration
  - Payment processing
- **Payment Success (`/payment/success`):** Confirmation page
- **Payment Failed (`/payment/failed`):** Retry option
- **Subscription Management (`/subscription`):**
  - Current plan details
  - Payment history
  - Upgrade/downgrade options
  - Cancel subscription

### 7. Settings
- **Account Settings (`/settings/account`):** Profile info, email, password
- **Subscription Settings (`/settings/subscription`):** Plan details, billing
- **Preferences (`/settings/preferences`):** App preferences

---

## Key Frontend Implementation Requirements

### 1. State Management
```typescript
// User Context
interface UserContext {
  user: User | null;
  subscription: SubscriptionInfo | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UserUpdate) => Promise<void>;
}

// Resume Context
interface ResumeContext {
  resumes: Resume[];
  currentResume: Resume | null;
  fetchResumes: () => Promise<void>;
  createResume: (data: ResumeCreate) => Promise<Resume>;
  updateResume: (id: number, data: ResumeUpdate) => Promise<void>;
  deleteResume: (id: number) => Promise<void>;
}
```

### 2. API Client
```typescript
// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (logout)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
    }
    return Promise.reject(error);
  }
);
```

### 3. Razorpay Integration
```typescript
const handlePayment = async (plan: string, billingCycle: string) => {
  // 1. Create order
  const { order_id, amount, razorpay_key } = await createOrder(plan, billingCycle);

  // 2. Initialize Razorpay
  const options = {
    key: razorpay_key,
    amount: amount,
    currency: 'INR',
    name: 'Resume Builder',
    description: `${plan} Plan - ${billingCycle}`,
    order_id: order_id,
    handler: async (response) => {
      // 3. Verify payment
      await verifyPayment(response);
      // 4. Redirect to success page
    },
    prefill: {
      name: user.name,
      email: user.email,
    },
    theme: {
      color: '#4F46E5',
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};
```

### 4. Form Validation (Zod)
```typescript
const resumeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.object({
    personalInfo: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(10),
    }),
    summary: z.string().min(50, 'Summary should be at least 50 characters'),
    experience: z.array(experienceSchema).min(1),
    education: z.array(educationSchema).min(1),
    skills: skillsSchema,
  }),
});
```

### 5. Protected Routes
```typescript
// Middleware to protect authenticated routes
export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return <LoadingSpinner />;
  return children;
}
```

### 6. Subscription Limits
```typescript
// Check if user can create resume
const canCreateResume = () => {
  const { resume_count } = user;
  const { resume_limit } = subscription.limits;
  return resume_count < resume_limit;
};

// Show upgrade modal if limit reached
if (!canCreateResume()) {
  showUpgradeModal('resume_limit');
}
```

---

## UI/UX Requirements

1. **Responsive Design:** Mobile-first, works on all devices
2. **Loading States:** Show spinners/skeletons during API calls
3. **Error Handling:** User-friendly error messages, toast notifications
4. **Success Feedback:** Confirmations for actions (create, update, delete)
5. **Accessibility:** WCAG 2.1 AA compliant, keyboard navigation
6. **Dark Mode:** Optional but recommended
7. **Performance:** Code splitting, lazy loading, optimized images
8. **SEO:** Proper meta tags, semantic HTML, sitemap

---

## Environment Variables

Create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=https://resume-builder-backend-production-f9db.up.railway.app
NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_SBnvLkUM2KLOUH
NEXT_PUBLIC_APP_NAME=Resume Builder
NEXT_PUBLIC_SUPPORT_EMAIL=resumebuilder.pulsestack@gmail.com
```

---

## Testing Requirements

1. **Unit Tests:** Components, utilities, hooks
2. **Integration Tests:** API calls, form submissions
3. **E2E Tests:** Critical user flows (signup, create resume, payment)

---

## Deployment

- **Platform:** Vercel (recommended for Next.js)
- **Environment:** Production
- **Custom Domain:** Configure after deployment
- **Analytics:** Google Analytics / Plausible

---

## Additional Notes

- **Rate Limiting:** Backend has rate limits, handle 429 errors gracefully
- **Caching:** Some endpoints are cached (pricing), consider SWR/React Query
- **Webhooks:** Payment webhooks are handled on backend, no frontend action needed
- **Email Verification:** Currently sends welcome emails, no verification required for signup
- **Password Reset:** Not implemented yet in backend, implement when backend adds endpoint

---

## Success Criteria

- All pages functional and responsive
- Complete user journey from signup to payment works
- AI features integrated and working
- Resume creation and editing smooth
- Payment integration successful
- Error handling comprehensive
- Performance optimized (Lighthouse score 90+)
- Accessible and SEO-friendly

---

## Final Reminder

**Read the file `.claude/prompts/frontend-instructions.md` and implement the COMPLETE frontend application following all specifications.**

This prompt provides all backend API documentation needed. Use it as your single source of truth for API integration.
