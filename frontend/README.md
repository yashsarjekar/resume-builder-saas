# Resume Builder Frontend

AI-powered resume builder with ATS optimization built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🚀 Next.js 14 with App Router
- 💎 TypeScript for type safety
- 🎨 Tailwind CSS for styling
- 🔐 JWT Authentication
- 💳 Razorpay Payment Integration
- 🤖 AI-powered ATS optimization
- 📱 Fully responsive design

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running (see backend README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

3. Update environment variables in `.env.local`:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_RAZORPAY_KEY=your_razorpay_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Create a production build:
```bash
npm run build
```

Run the production build:
```bash
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/              # App router pages
│   │   ├── (auth)/       # Authentication pages
│   │   ├── dashboard/    # Dashboard page
│   │   ├── builder/      # Resume builder
│   │   ├── pricing/      # Pricing page
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Landing page
│   ├── components/       # React components
│   │   ├── layout/       # Layout components
│   │   ├── ui/           # UI components
│   │   ├── auth/         # Auth components
│   │   ├── resume/       # Resume components
│   │   └── dashboard/    # Dashboard components
│   ├── lib/              # Utility functions
│   │   ├── api.ts        # API client
│   │   ├── validators.ts # Zod schemas
│   │   └── utils.ts      # Helper functions
│   ├── store/            # Zustand stores
│   │   └── authStore.ts  # Auth state
│   └── types/            # TypeScript types
│       ├── user.ts       # User types
│       ├── resume.ts     # Resume types
│       └── api.ts        # API types
├── public/               # Static files
├── .env.local.example    # Environment variables template
└── package.json          # Dependencies
```

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Payment**: Razorpay

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `NEXT_PUBLIC_RAZORPAY_KEY` | Razorpay publishable key | Yes |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | Yes |

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

## Features Documentation

### Authentication
- Email/password signup and login
- JWT token-based authentication
- Auto-redirect to login on 401 errors

### Resume Builder
- Multi-step form for resume creation
- Real-time preview
- ATS optimization with AI
- PDF export
- Multiple templates

### Payment Integration
- Razorpay integration for subscriptions
- Three pricing tiers: Free, Starter, Pro
- Automatic plan upgrade after payment

### AI Features
- ATS score analysis
- Keyword extraction
- Cover letter generation
- LinkedIn profile optimization

## Support

For issues and questions, contact support@resumebuilder.com
