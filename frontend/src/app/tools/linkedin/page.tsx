'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function LinkedInOptimizerPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [result, setResult] = useState<{
    optimized_headline: string;
    optimized_summary: string;
    skill_recommendations: string[];
    keywords_to_include: string[];
    improvements: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setAuthChecked(true);
    };
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!authChecked) return;

    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [authChecked, isAuthenticated, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please upload a PDF file');
        setFile(null);
      }
    }
  };

  const handleOptimize = async () => {
    if (!file) {
      setError('Please upload your LinkedIn profile PDF');
      return;
    }

    if (!targetRole.trim()) {
      setError('Please enter your target role');
      return;
    }

    setLoading(true);
    setParsing(true);
    setError('');
    setResult(null);

    try {
      // Step 1: Parse the LinkedIn PDF
      const formData = new FormData();
      formData.append('file', file);

      const parseResponse = await api.post('/api/resume/parse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const parsedProfile = parseResponse.data.content;
      setParsing(false);

      // Step 2: Optimize with AI
      const optimizeResponse = await api.post('/api/ai/optimize-linkedin', {
        current_profile: parsedProfile,
        target_role: targetRole,
        industry: industry.trim() || null,
      });

      setResult(optimizeResponse.data);
    } catch (err: any) {
      setParsing(false);
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          const errorMessages = err.response.data.detail
            .map((e: any) => `${e.loc.join('.')}: ${e.msg}`)
            .join(', ');
          setError(errorMessages);
        } else {
          setError(err.response.data.detail);
        }
      } else {
        setError('Failed to optimize LinkedIn profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleDownloadInstructions = () => {
    const instructions = `How to Download Your LinkedIn Profile as PDF:

1. Go to your LinkedIn profile (linkedin.com/in/your-name)
2. Click "Resources" in the top section of your profile
3. Select "Save to PDF"
4. LinkedIn will generate and download your profile as a PDF file
5. Upload that PDF here for optimization!

Alternative Method:
1. Go to Settings & Privacy → Data privacy → Get a copy of your data
2. Download "Profile" data
3. LinkedIn will email you a PDF of your profile`;

    const blob = new Blob([instructions], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'linkedin-pdf-instructions.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">LinkedIn Profile Optimizer</h1>
            <p className="text-gray-600 mt-1">Upload your LinkedIn PDF and get AI-powered optimization suggestions</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Instructions Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">How to get your LinkedIn profile as PDF?</h3>
              <p className="text-sm text-blue-800">
                1. Go to your LinkedIn profile → Click "Resources" → Select "Save to PDF"<br />
                2. LinkedIn will download your complete profile as a PDF file<br />
                3. Upload it here for AI-powered optimization!
              </p>
              <button
                onClick={handleDownloadInstructions}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Download detailed instructions
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn Profile PDF *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload LinkedIn PDF</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept=".pdf"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF file (exported from LinkedIn)</p>
                  {file && (
                    <p className="text-sm text-green-600 font-medium mt-2">
                      ✓ {file.name} selected
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Target Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Role *
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Senior Software Engineer, Product Manager"
              />
            </div>

            {/* Industry (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry (Optional)
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Technology, Finance, Healthcare"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={handleOptimize}
            disabled={loading}
            className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {parsing && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {parsing ? 'Parsing PDF...' : loading ? 'Optimizing Profile...' : 'Optimize LinkedIn Profile'}
          </button>
        </div>

        {result && (
          <div className="space-y-6">
            {/* Headline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Optimized Headline</h2>
                <button
                  onClick={() => handleCopy(result.optimized_headline, 'headline')}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  {copiedSection === 'headline' ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-gray-700 leading-relaxed font-medium">{result.optimized_headline}</p>
              <p className="mt-2 text-xs text-gray-500">
                Character count: {result.optimized_headline.length}/220
              </p>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Optimized Summary</h2>
                <button
                  onClick={() => handleCopy(result.optimized_summary, 'summary')}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  {copiedSection === 'summary' ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                {result.optimized_summary}
              </pre>
              <p className="mt-2 text-xs text-gray-500">
                Character count: {result.optimized_summary.length}/2600
              </p>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Recommended Skills ({result.skill_recommendations.length})
                </h2>
                <button
                  onClick={() => handleCopy(result.skill_recommendations.join(', '), 'skills')}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  {copiedSection === 'skills' ? '✓ Copied!' : 'Copy All'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.skill_recommendations.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* SEO Keywords */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  SEO Keywords ({result.keywords_to_include.length})
                </h2>
                <button
                  onClick={() => handleCopy(result.keywords_to_include.join(', '), 'keywords')}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  {copiedSection === 'keywords' ? '✓ Copied!' : 'Copy All'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.keywords_to_include.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Tip:</strong> Include these keywords naturally in your headline, summary, and experience sections to improve your visibility in recruiter searches.
                </p>
              </div>
            </div>

            {/* Improvement Suggestions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Improvement Suggestions
              </h2>
              <ul className="space-y-3">
                {result.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <p className="text-gray-700 leading-relaxed flex-1">{improvement}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
