"""
Pydantic schemas package.

This module exports all Pydantic models for request/response validation.
"""

from .user import (
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
    TokenData,
    UserUpdate,
    PasswordChange,
    SubscriptionInfo,
)

from .ai import (
    ATSAnalysisRequest,
    ATSAnalysisResponse,
    ResumeOptimizationRequest,
    ResumeOptimizationResponse,
    KeywordExtractionRequest,
    KeywordExtractionResponse,
    CoverLetterRequest,
    CoverLetterResponse,
    LinkedInOptimizationRequest,
    LinkedInOptimizationResponse,
    AIUsageStats,
    AIError,
)

from .resume import (
    ResumeCreate,
    ResumeUpdate,
    ResumeResponse,
    ResumeListItem,
    ResumeListResponse,
    ResumeOptimizeRequest,
    ResumeAnalyzeRequest,
    PDFDownloadRequest,
    ResumeStats,
)

from .payment import (
    CreateOrderRequest,
    CreateOrderResponse,
    VerifyPaymentRequest,
    VerifyPaymentResponse,
    PaymentResponse,
    PaymentHistoryResponse,
    SubscriptionDetails,
    PricingPlan,
    PricingResponse,
)

__all__ = [
    # User schemas
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "Token",
    "TokenData",
    "UserUpdate",
    "PasswordChange",
    "SubscriptionInfo",
    # AI schemas
    "ATSAnalysisRequest",
    "ATSAnalysisResponse",
    "ResumeOptimizationRequest",
    "ResumeOptimizationResponse",
    "KeywordExtractionRequest",
    "KeywordExtractionResponse",
    "CoverLetterRequest",
    "CoverLetterResponse",
    "LinkedInOptimizationRequest",
    "LinkedInOptimizationResponse",
    "AIUsageStats",
    "AIError",
    # Resume schemas
    "ResumeCreate",
    "ResumeUpdate",
    "ResumeResponse",
    "ResumeListItem",
    "ResumeListResponse",
    "ResumeOptimizeRequest",
    "ResumeAnalyzeRequest",
    "PDFDownloadRequest",
    "ResumeStats",
    # Payment schemas
    "CreateOrderRequest",
    "CreateOrderResponse",
    "VerifyPaymentRequest",
    "VerifyPaymentResponse",
    "PaymentResponse",
    "PaymentHistoryResponse",
    "SubscriptionDetails",
    "PricingPlan",
    "PricingResponse",
]
