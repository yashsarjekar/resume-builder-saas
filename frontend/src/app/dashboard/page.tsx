'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Resume } from '@/types/resume';
import { formatDate, getSubscriptionColor, getATSScoreColor } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [resumeStats, setResumeStats] = useState<any>(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setAuthChecked(true);
    };
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount, don't depend on checkAuth

  useEffect(() => {
    if (!authChecked) return; // Wait for auth check to complete

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchResumes();
  }, [authChecked, isAuthenticated, router]);

  const fetchResumes = async () => {
    try {
      const response = await api.get('/api/resume');
      // Ensure we always set an array
      if (Array.isArray(response.data)) {
        setResumes(response.data);
      } else if (response.data && Array.isArray(response.data.resumes)) {
        setResumes(response.data.resumes);
      } else {
        console.warn('[Dashboard] Unexpected resume data format:', response.data);
        setResumes([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch resumes:', error);
      setResumes([]); // Set empty array on error
      // Only redirect on 401 (truly unauthorized)
      // 403 might be rate limiting or temporary issue - don't clear token
      if (error.response?.status === 401) {
        console.error('[Dashboard] 401 error, clearing auth');
        localStorage.removeItem('token');
        router.push('/login');
      } else if (error.response?.status === 403) {
        console.warn('[Dashboard] 403 error (rate limit?), keeping user logged in');
        // Keep user logged in, just show empty state
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      await api.delete(`/api/resume/${id}`);
      setResumes(resumes.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to delete resume:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/api/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('Resume uploaded successfully:', response.data);
      alert('Resume uploaded successfully! Redirecting to builder...');

      // Redirect to builder with new resume
      router.push(`/builder?id=${response.data.id}`);
    } catch (error: any) {
      console.error('Failed to upload resume:', error);
      if (error.response?.status === 429) {
        alert(error.response.data.detail || 'Resume limit reached for your plan');
      } else {
        alert('Failed to upload resume. Please try again.');
      }
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await api.get('/api/payment/history');
      setPaymentHistory(response.data.payments || []);
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      setPaymentHistory([]);
    }
  };

  const fetchResumeStats = async () => {
    try {
      const response = await api.get('/api/resume/stats/summary');
      setResumeStats(response.data);
    } catch (error) {
      console.error('Failed to fetch resume stats:', error);
      setResumeStats(null);
    }
  };

  // Show loading state while checking authentication
  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getResumeLimit = () => {
    const isInternational = user.region === 'INTL';
    const billingDuration = user.billing_duration || 1;

    let baseLimit: number;
    switch (user.subscription_type) {
      case 'pro': return 'Unlimited';
      case 'starter':
        baseLimit = isInternational ? 15 : 5;
        break;
      default:
        baseLimit = isInternational ? 5 : 1;
    }
    // Scale limit by billing duration (quarterly = 3x, half-yearly = 6x, yearly = 12x)
    return baseLimit * billingDuration;
  };

  const getATSLimit = () => {
    const isInternational = user.region === 'INTL';
    const billingDuration = user.billing_duration || 1;

    let baseLimit: number;
    switch (user.subscription_type) {
      case 'pro': return 'Unlimited';
      case 'starter':
        baseLimit = isInternational ? 15 : 10;
        break;
      default:
        baseLimit = isInternational ? 5 : 2;
    }
    // Scale limit by billing duration (quarterly = 3x, half-yearly = 6x, yearly = 12x)
    return baseLimit * billingDuration;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user.name}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Subscription</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubscriptionColor(user.subscription_type)}`}>
                {user.subscription_type.toUpperCase()}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{user.subscription_type}</p>
            {user.subscription_type === 'free' && (
              <Link href="/pricing" className="text-sm text-blue-600 hover:text-blue-500 mt-2 inline-block">
                Upgrade now →
              </Link>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Resumes Created</h3>
            <p className="text-2xl font-bold text-gray-900">
              {user.resume_count} / {getResumeLimit()}
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${typeof getResumeLimit() === 'number' ? Math.min((user.resume_count / (getResumeLimit() as number)) * 100, 100) : 0}%`
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">ATS Analyses</h3>
            <p className="text-2xl font-bold text-gray-900">
              {user.ats_analysis_count} / {getATSLimit()}
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${typeof getATSLimit() === 'number' ? Math.min((user.ats_analysis_count / (getATSLimit() as number)) * 100, 100) : 0}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* AI Tools Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Tools</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/tools/keywords"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Keyword Extractor</h3>
              <p className="text-sm text-gray-600">Extract key skills from job postings</p>
            </Link>

            <Link
              href="/tools/cover-letter"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition"
            >
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Cover Letter Generator</h3>
              <p className="text-sm text-gray-600">Create personalized cover letters</p>
            </Link>

            <Link
              href="/tools/linkedin"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition"
            >
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">LinkedIn Optimizer</h3>
              <p className="text-sm text-gray-600">Optimize your LinkedIn profile</p>
            </Link>
          </div>
        </div>

        {/* Resume Statistics Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Resume Analytics</h2>
            <button
              onClick={() => {
                setShowStats(!showStats);
                if (!showStats && !resumeStats) {
                  fetchResumeStats();
                }
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showStats ? 'Hide' : 'Show'} Detailed Stats
            </button>
          </div>

          {showStats && resumeStats && (
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg bg-blue-50">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Total Resumes</h3>
                <p className="text-3xl font-bold text-blue-600">{resumeStats.total_resumes || 0}</p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg bg-green-50">
                <h3 className="text-sm font-medium text-gray-600 mb-1">ATS Optimized</h3>
                <p className="text-3xl font-bold text-green-600">{resumeStats.optimized_count || 0}</p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg bg-purple-50">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Avg ATS Score</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {resumeStats.average_ats_score ? `${Math.round(resumeStats.average_ats_score)}%` : 'N/A'}
                </p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg bg-yellow-50">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Templates Used</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {resumeStats.templates_used ? Object.keys(resumeStats.templates_used).length : 0}
                </p>
              </div>

              {resumeStats.most_used_template && (
                <div className="col-span-full p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Most Used Template</h3>
                  <p className="text-lg font-semibold text-gray-900 capitalize">{resumeStats.most_used_template}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Payment History Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Subscription & Payments</h2>
            <button
              onClick={() => {
                setShowPaymentHistory(!showPaymentHistory);
                if (!showPaymentHistory && paymentHistory.length === 0) {
                  fetchPaymentHistory();
                }
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showPaymentHistory ? 'Hide' : 'Show'} Payment History
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Current Plan</h3>
              <p className="text-xl font-bold text-gray-900 capitalize">{user.subscription_type}</p>
              {user.subscription_expiry && (
                <p className="text-xs text-gray-500 mt-1">
                  Expires: {formatDate(user.subscription_expiry)}
                </p>
              )}
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                Usage This {user.billing_duration === 1 ? 'Month' : user.billing_duration === 3 ? 'Quarter' : user.billing_duration === 6 ? 'Half-Year' : 'Year'}
              </h3>
              <div className="text-sm text-gray-700">
                <p>Resumes: {user.resume_count} / {getResumeLimit()}</p>
                <p>ATS Analyses: {user.ats_analysis_count} / {getATSLimit()}</p>
              </div>
            </div>
          </div>

          {showPaymentHistory && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment History</h3>
              {paymentHistory.length === 0 ? (
                <p className="text-sm text-gray-500">No payment history found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Plan</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Amount</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paymentHistory.map((payment: any) => (
                        <tr key={payment.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {formatDate(payment.created_at)}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 capitalize">
                            {payment.plan}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            ₹{(Number(payment.amount) / 100).toFixed(0)}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Resumes Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Resumes</h2>
            <div className="flex gap-3">
              <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer">
                {uploading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⟳</span>
                    Uploading...
                  </>
                ) : (
                  <>
                    📤 Upload Resume
                  </>
                )}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <Link
                href="/builder"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                + Create Resume
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading resumes...</p>
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No resumes yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first resume.</p>
              <div className="mt-6">
                <Link
                  href="/builder"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create Resume
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <div key={resume.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{resume.title}</h3>
                    {resume.ats_score && (
                      <span className={`text-sm font-medium ${getATSScoreColor(resume.ats_score)}`}>
                        {resume.ats_score}%
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {resume.job_description?.substring(0, 100) || 'No description'}...
                  </p>

                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <span>{resume.updated_at ? formatDate(resume.updated_at) : 'Recently'}</span>
                    <span className="mx-2">•</span>
                    <span>{resume.template_name || 'modern'}</span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/builder?id=${resume.id}`}
                      className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 text-center"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(resume.id)}
                      className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
