export interface ApiError {
  detail: string;
  status_code?: number;
}

export interface PricingPlan {
  name: string;
  price: number;
  features: string[];
  resume_limit: number;
  ats_analysis_limit: number;
}

export interface SubscriptionInfo {
  user: {
    subscription_type: string;
    resume_count: number;
    ats_analysis_count: number;
  };
  limits: {
    resume_limit: number;
    ats_analysis_limit: number;
  };
  upgrade_options?: PricingPlan[];
}

export interface ATSAnalysisResult {
  ats_score: number;
  optimized_content: any;
  suggestions: string[];
}

export interface PaymentOrder {
  order_id: string;
  amount: number;
  currency: string;
}

export interface KeywordExtractionResult {
  keywords: string[];
}

export interface CoverLetterResult {
  cover_letter: string;
}

export interface LinkedInOptimizationResult {
  optimized_summary: string;
  optimized_headline: string;
  skills: string[];
}
