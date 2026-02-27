'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Resume, ResumeContent, Experience, Education } from '@/types/resume';

function BuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('id');
  const { user, isAuthenticated, checkAuth } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [title, setTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [templateName, setTemplateName] = useState('modern');
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [atsAnalysis, setAtsAnalysis] = useState<any>(null);

  const [personalInfo, setPersonalInfo] = useState<ResumeContent['personalInfo']>({
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: ''
  });

  const [summary, setSummary] = useState('');
  const [experiences, setExperiences] = useState<Experience[]>([
    { company: '', title: '', duration: '', bullets: [''] }
  ]);
  const [skills, setSkills] = useState<string[]>(['']);
  const [education, setEducation] = useState<Education[]>([
    { institution: '', degree: '', year: '' }
  ]);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setAuthChecked(true);
    };
    initAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authChecked) return; // Wait for auth check

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (resumeId) {
      loadResume();
    }
  }, [authChecked, isAuthenticated, resumeId, router]);

  const loadResume = async () => {
    try {
      const response = await api.get(`/api/resume/${resumeId}`);
      const resume: Resume = response.data;

      setTitle(resume.title || '');
      setJobDescription(resume.job_description || '');
      setTemplateName(resume.template_name || 'modern');
      setAtsScore(resume.ats_score || null);

      if (resume.content) {
        // Ensure all personalInfo fields are strings (not null)
        setPersonalInfo({
          name: resume.content.personalInfo?.name || '',
          email: resume.content.personalInfo?.email || '',
          phone: resume.content.personalInfo?.phone || '',
          location: resume.content.personalInfo?.location || '',
          linkedin: resume.content.personalInfo?.linkedin || '',
          github: resume.content.personalInfo?.github || ''
        });
        setSummary(resume.content.summary || '');
        // Ensure all experiences have bullets array initialized
        const experiencesWithBullets = (resume.content.experience || []).map(exp => ({
          ...exp,
          bullets: exp.bullets || []
        }));
        setExperiences(experiencesWithBullets);
        setSkills(resume.content.skills || []);
        // Ensure all education fields are strings (not undefined)
        const educationWithDefaults = (resume.content.education || []).map(edu => ({
          institution: edu.institution || '',
          degree: edu.degree || '',
          year: edu.year || ''
        }));
        setEducation(educationWithDefaults);
      }
    } catch (error) {
      console.error('Failed to load resume:', error);
      alert('Failed to load resume');
    }
  };

  const handleSave = async () => {
    if (!title || !jobDescription) {
      alert('Please fill in title and job description');
      return;
    }

    setLoading(true);

    const content: ResumeContent = {
      personalInfo,
      summary,
      experience: experiences.filter(exp => exp.company && exp.title),
      skills: skills.filter(s => s.trim() !== ''),
      education: education.filter(edu => edu.institution && edu.degree)
    };

    try {
      if (resumeId) {
        await api.put(`/api/resume/${resumeId}`, {
          title,
          job_description: jobDescription,
          content,
          template_name: templateName
        });
        alert('Resume updated successfully!');
      } else {
        const response = await api.post('/api/resume', {
          title,
          job_description: jobDescription,
          content,
          template_name: templateName
        });
        router.push(`/builder?id=${response.data.id}`);
        alert('Resume created successfully!');
      }
    } catch (error: any) {
      console.error('Failed to save resume:', error);
      alert(error.response?.data?.detail || 'Failed to save resume');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!resumeId) {
      alert('Please save the resume first');
      return;
    }

    if (!jobDescription || jobDescription.trim() === '') {
      alert('Please add a job description first');
      return;
    }

    setAnalyzing(true);

    try {
      // Use the analyze-resume endpoint that accepts job_description in request body
      const response = await api.post(`/api/ai/analyze-resume/${resumeId}`, {
        job_description: jobDescription
      });
      setAtsScore(response.data.ats_score);
      setAtsAnalysis(response.data); // Store full analysis

      // Scroll to ATS results section
      setTimeout(() => {
        document.getElementById('ats-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      console.error('Failed to analyze ATS:', error);
      alert(error.response?.data?.detail || 'Failed to analyze ATS');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApplyOptimizations = async () => {
    if (!resumeId) {
      alert('Please save the resume first');
      return;
    }

    if (!jobDescription || jobDescription.trim() === '') {
      alert('Please add a job description first');
      return;
    }

    const confirmed = confirm(
      '⚠️ AI OPTIMIZATION WARNING ⚠️\n\n' +
      'This will rewrite your resume using AI to optimize it for the job description.\n\n' +
      'What AI WILL do:\n' +
      '✅ Improve wording and action verbs\n' +
      '✅ Add relevant keywords from actual experience\n' +
      '✅ Quantify achievements with estimates\n' +
      '✅ Reorganize content for better ATS parsing\n\n' +
      'What AI WILL NOT do:\n' +
      '❌ Fabricate skills or experience\n' +
      '❌ Change dates, companies, or titles\n' +
      '❌ Add fake projects or certifications\n\n' +
      'Your current resume will be replaced.\n\n' +
      'Continue with optimization?'
    );

    if (!confirmed) return;

    setAnalyzing(true);

    try {
      // Call the optimize endpoint
      const response = await api.post(`/api/ai/optimize-resume/${resumeId}`, {
        job_description: jobDescription,
        optimization_level: 'moderate'
      });

      const optimizationData = response.data;

      // Check for role mismatch and show strong warning
      const matchLevel = optimizationData.role_compatibility?.match_level;
      if (matchLevel === 'MISMATCH') {
        const proceedWithMismatch = confirm(
          `⚠️ CRITICAL ROLE MISMATCH WARNING ⚠️\n\n` +
          `Job Role: ${optimizationData.role_compatibility?.job_role}\n` +
          `Your Profile: ${optimizationData.role_compatibility?.resume_role}\n\n` +
          `🚨 IMPORTANT:\n` +
          `• Your resume does NOT match this job's requirements\n` +
          `• ATS systems will likely auto-reject this application\n` +
          `• Optimization can improve formatting but NOT create missing experience\n` +
          `• Expected improvement: 0-10% (very low)\n\n` +
          `💡 RECOMMENDATION:\n` +
          `Apply to roles matching your actual experience instead.\n\n` +
          `Do you still want to proceed with optimization?\n` +
          `(Resume will be optimized for formatting/clarity only)`
        );

        if (!proceedWithMismatch) {
          setAnalyzing(false);
          return;
        }
      }

      // Build success message with details
      const improvement = optimizationData.estimated_ats_improvement;
      const warnings = optimizationData.warnings || [];
      const verification = optimizationData.authenticity_verification;

      let successMessage = `✅ Resume Optimized Successfully!\n\n`;
      successMessage += `📊 ATS Score Improvement:\n`;
      successMessage += `• Before: ${improvement.before_score}%\n`;
      successMessage += `• After: ${improvement.after_score}%\n`;
      successMessage += `• Improvement: +${improvement.improvement}% (${improvement.confidence} confidence)\n\n`;

      successMessage += `🎯 Role Compatibility:\n`;
      successMessage += `• Job: ${optimizationData.role_compatibility.job_role}\n`;
      successMessage += `• Your Profile: ${optimizationData.role_compatibility.resume_role}\n`;
      successMessage += `• Match: ${optimizationData.role_compatibility.match_level}\n\n`;

      successMessage += `📝 Changes Made:\n`;
      const changes = optimizationData.changes_made;
      const totalChanges =
        (changes.formatting_fixes?.length || 0) +
        (changes.keyword_additions?.length || 0) +
        (changes.rewording_improvements?.length || 0) +
        (changes.quantification_additions?.length || 0);
      successMessage += `• Total: ${totalChanges} improvements\n`;
      successMessage += `• Formatting: ${changes.formatting_fixes?.length || 0}\n`;
      successMessage += `• Keywords: ${changes.keyword_additions?.length || 0}\n`;
      successMessage += `• Rewording: ${changes.rewording_improvements?.length || 0}\n`;
      successMessage += `• Quantifications: ${changes.quantification_additions?.length || 0}\n\n`;

      successMessage += `✓ Authenticity Verified:\n`;
      successMessage += `• Companies unchanged: ${verification.all_companies_unchanged ? '✓' : '✗'}\n`;
      successMessage += `• Dates unchanged: ${verification.all_dates_unchanged ? '✓' : '✗'}\n`;
      successMessage += `• No fake skills: ${verification.no_fabricated_skills ? '✓' : '✗'}\n`;
      successMessage += `• No fake projects: ${verification.no_invented_projects ? '✓' : '✗'}\n`;

      if (warnings.length > 0) {
        successMessage += `\n⚠️ Warnings:\n`;
        warnings.forEach((w: string) => {
          successMessage += `• ${w}\n`;
        });
      }

      successMessage += `\n📥 Downloading optimized resume...\n\n`;
      successMessage += `ℹ️ IMPORTANT NOTE:\n`;
      successMessage += `The score shown above (${improvement.after_score}%) is for the optimized content in the builder.\n\n`;
      successMessage += `If you re-upload the PDF to analyze again, scores may vary slightly (typically ±5-10%) due to PDF text extraction limitations. This is normal and doesn't mean the optimization failed.\n\n`;
      successMessage += `For best results: continue editing in the builder rather than re-uploading PDFs.`;

      alert(successMessage);

      // Reload the resume to show optimized content
      const resumeResponse = await api.get(`/api/resume/${resumeId}`);
      const resume = resumeResponse.data;

      if (resume.content) {
        // Ensure all personalInfo fields are strings (not null)
        setPersonalInfo({
          name: resume.content.personalInfo?.name || '',
          email: resume.content.personalInfo?.email || '',
          phone: resume.content.personalInfo?.phone || '',
          location: resume.content.personalInfo?.location || '',
          linkedin: resume.content.personalInfo?.linkedin || '',
          github: resume.content.personalInfo?.github || ''
        });
        setSummary(resume.content.summary || '');

        const experiencesWithBullets = (resume.content.experience || []).map((exp: any) => ({
          ...exp,
          bullets: exp.bullets || []
        }));
        setExperiences(experiencesWithBullets);

        setSkills(resume.content.skills || []);
        // Ensure all education fields are strings (not undefined)
        const educationWithDefaults = (resume.content.education || []).map((edu: any) => ({
          institution: edu.institution || '',
          degree: edu.degree || '',
          year: edu.year || ''
        }));
        setEducation(educationWithDefaults);
      }

      setAtsScore(resume.ats_score);

      // Automatically trigger PDF download
      setTimeout(() => {
        handleDownload();
      }, 500);

    } catch (error: any) {
      console.error('Failed to optimize resume:', error);
      alert(error.response?.data?.detail || 'Failed to optimize resume. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownload = async () => {
    if (!resumeId) {
      alert('Please save the resume first');
      return;
    }

    try {
      // Always try to download optimized version if available
      // Backend will fall back to original content if optimization doesn't exist
      const response = await api.get(`/api/resume/${resumeId}/download`, {
        params: {
          use_optimized: true  // Always prefer optimized content if available
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download resume:', error);
      alert('Failed to download resume');
    }
  };

  const addExperience = () => {
    setExperiences([...experiences, { company: '', title: '', duration: '', bullets: [''] }]);
  };

  const addEducation = () => {
    setEducation([...education, { institution: '', degree: '', year: '' }]);
  };

  const addSkill = () => {
    setSkills([...skills, '']);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? 'Saving...' : 'Save Resume'}
          </button>
          <button
            onClick={handleOptimize}
            disabled={!resumeId || analyzing}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {analyzing && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {analyzing ? 'Analyzing...' : 'Optimize with AI'}
          </button>
          <button
            onClick={handleDownload}
            disabled={!resumeId}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            Download PDF
          </button>
          {atsScore !== null && (
            <div className="flex items-center px-4 py-2 bg-white rounded-lg border border-gray-200">
              <span className="text-sm text-gray-600 mr-2">ATS Score:</span>
              <span className={`text-lg font-bold ${atsScore >= 80 ? 'text-green-600' : atsScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {atsScore}%
              </span>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resume Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Software Engineer Resume"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Description *
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Paste the job description here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template
                  </label>
                  <select
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="modern">Modern</option>
                    <option value="classic">Classic</option>
                    <option value="professional">Professional</option>
                    <option value="classic-professional">Classic Professional (ATS-Optimized)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={personalInfo.name}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Full Name"
                />
                <input
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Email"
                />
                <input
                  type="text"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Phone"
                />
                <input
                  type="text"
                  value={personalInfo.location}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Location"
                />
                <input
                  type="text"
                  value={personalInfo.linkedin}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="LinkedIn URL"
                />
                <input
                  type="text"
                  value={personalInfo.github}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, github: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="GitHub URL"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Professional Summary</h2>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Write a brief professional summary..."
              />
            </div>

            {/* Experience */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Experience</h2>
                <button
                  onClick={addExperience}
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                >
                  + Add
                </button>
              </div>
              {experiences.map((exp, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded">
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => {
                      const newExp = [...experiences];
                      newExp[index].company = e.target.value;
                      setExperiences(newExp);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                    placeholder="Company"
                  />
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => {
                      const newExp = [...experiences];
                      newExp[index].title = e.target.value;
                      setExperiences(newExp);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                    placeholder="Job Title"
                  />
                  <input
                    type="text"
                    value={exp.duration}
                    onChange={(e) => {
                      const newExp = [...experiences];
                      newExp[index].duration = e.target.value;
                      setExperiences(newExp);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                    placeholder="Duration (e.g., Jan 2020 - Dec 2021)"
                  />
                  {(exp.bullets || []).map((bullet, bulletIndex) => (
                    <input
                      key={bulletIndex}
                      type="text"
                      value={bullet}
                      onChange={(e) => {
                        const newExp = [...experiences];
                        if (!newExp[index].bullets) newExp[index].bullets = [];
                        newExp[index].bullets[bulletIndex] = e.target.value;
                        setExperiences(newExp);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                      placeholder="Achievement/Responsibility"
                    />
                  ))}
                  <button
                    onClick={() => {
                      const newExp = [...experiences];
                      newExp[index].bullets.push('');
                      setExperiences(newExp);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add bullet point
                  </button>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Skills</h2>
                <button
                  onClick={addSkill}
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                >
                  + Add
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {skills.map((skill, index) => (
                  <input
                    key={index}
                    type="text"
                    value={skill}
                    onChange={(e) => {
                      const newSkills = [...skills];
                      newSkills[index] = e.target.value;
                      setSkills(newSkills);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Skill"
                  />
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Education</h2>
                <button
                  onClick={addEducation}
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                >
                  + Add
                </button>
              </div>
              {education.map((edu, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded">
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => {
                      const newEdu = [...education];
                      newEdu[index].institution = e.target.value;
                      setEducation(newEdu);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                    placeholder="Institution"
                  />
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => {
                      const newEdu = [...education];
                      newEdu[index].degree = e.target.value;
                      setEducation(newEdu);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                    placeholder="Degree"
                  />
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => {
                      const newEdu = [...education];
                      newEdu[index].year = e.target.value;
                      setEducation(newEdu);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Year (e.g., 2020)"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Preview</h2>
              <div className="prose max-w-none">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold mb-1">{personalInfo.name || 'Your Name'}</h1>
                  <p className="text-sm text-gray-600">
                    {personalInfo.email && `${personalInfo.email} | `}
                    {personalInfo.phone && `${personalInfo.phone} | `}
                    {personalInfo.location}
                  </p>
                </div>

                {summary && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold mb-2">Summary</h2>
                    <p className="text-sm text-gray-700">{summary}</p>
                  </div>
                )}

                {experiences.some(exp => exp.company) && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold mb-2">Experience</h2>
                    {experiences.filter(exp => exp.company).map((exp, index) => (
                      <div key={index} className="mb-4">
                        <h3 className="font-semibold">{exp.title}</h3>
                        <p className="text-sm text-gray-600">{exp.company} | {exp.duration}</p>
                        <ul className="list-disc list-inside text-sm mt-1">
                          {(exp.bullets || []).filter(b => b).map((bullet, i) => (
                            <li key={i}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {skills.some(s => s) && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold mb-2">Skills</h2>
                    <p className="text-sm">{skills.filter(s => s).join(', ')}</p>
                  </div>
                )}

                {education.some(edu => edu.institution) && (
                  <div>
                    <h2 className="text-lg font-bold mb-2">Education</h2>
                    {education.filter(edu => edu.institution).map((edu, index) => (
                      <div key={index} className="mb-2">
                        <h3 className="font-semibold">{edu.degree}</h3>
                        <p className="text-sm text-gray-600">{edu.institution} | {edu.year}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ATS Analysis Results */}
        {atsAnalysis && (
          <div id="ats-results" className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">ATS Analysis Results</h2>
              <button
                onClick={handleApplyOptimizations}
                disabled={analyzing}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {analyzing ? 'Optimizing...' : 'Apply AI Optimizations'}
              </button>
            </div>

            {/* Info Banner */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-purple-900 mb-1">
                    ⚡ AI Optimization Available
                  </h3>
                  <p className="text-sm text-purple-800">
                    Based on the analysis below, our AI can automatically rewrite your resume to improve your ATS score.
                    Review the suggestions, then click "Apply AI Optimizations" to let AI enhance your resume.
                  </p>
                </div>
              </div>
            </div>

            {/* Overall Score Banner */}
            <div className={`p-6 rounded-lg mb-6 ${
              (atsAnalysis.overall_ats_score || atsAnalysis.ats_score) >= 80 ? 'bg-green-50 border-2 border-green-500' :
              (atsAnalysis.overall_ats_score || atsAnalysis.ats_score) >= 60 ? 'bg-yellow-50 border-2 border-yellow-500' :
              'bg-red-50 border-2 border-red-500'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Overall ATS Score</h3>
                  <p className="text-sm text-gray-600 mt-1">{atsAnalysis.category || 'Score Analysis'}</p>
                </div>
                <div className={`text-5xl font-bold ${
                  (atsAnalysis.overall_ats_score || atsAnalysis.ats_score) >= 80 ? 'text-green-600' :
                  (atsAnalysis.overall_ats_score || atsAnalysis.ats_score) >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {atsAnalysis.overall_ats_score || atsAnalysis.ats_score}%
                </div>
              </div>
            </div>

            {/* Dimension Scores */}
            {atsAnalysis.dimension_scores && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{atsAnalysis.dimension_scores.role_alignment}%</div>
                    <div className="text-sm text-gray-600 mt-1">Role Alignment</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{atsAnalysis.dimension_scores.technical_compatibility}%</div>
                    <div className="text-sm text-gray-600 mt-1">Technical</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{atsAnalysis.dimension_scores.content_match}%</div>
                    <div className="text-sm text-gray-600 mt-1">Content Match</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{atsAnalysis.dimension_scores.experience_quality}%</div>
                    <div className="text-sm text-gray-600 mt-1">Experience</div>
                  </div>
                </div>
              </div>
            )}

            {/* Role Analysis */}
            {atsAnalysis.role_analysis && (
              <div className={`mb-6 p-4 rounded-lg border-2 ${
                atsAnalysis.role_analysis.match_level === 'DIRECT' ? 'bg-green-50 border-green-500' :
                atsAnalysis.role_analysis.match_level === 'ADJACENT' ? 'bg-yellow-50 border-yellow-500' :
                atsAnalysis.role_analysis.match_level === 'PIVOT' ? 'bg-orange-50 border-orange-500' :
                'bg-red-50 border-red-500'
              }`}>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Role Match: {atsAnalysis.role_analysis.match_level}
                </h3>
                <div className="text-sm space-y-2">
                  <div><span className="font-semibold">Job Role:</span> {atsAnalysis.role_analysis.job_role_type}</div>
                  <div><span className="font-semibold">Your Background:</span> {atsAnalysis.role_analysis.resume_role_type}</div>
                  <div className="mt-2 pt-2 border-t"><span className="font-semibold">Analysis:</span> {atsAnalysis.role_analysis.explanation}</div>
                </div>
              </div>
            )}

            {/* Technical Issues */}
            {atsAnalysis.technical_issues && atsAnalysis.technical_issues.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Technical ATS Issues
                </h3>
                <div className="space-y-3">
                  {atsAnalysis.technical_issues.map((issue: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded border border-red-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-red-900">{issue.issue}</div>
                          <div className="text-sm text-gray-700 mt-1"><strong>Fix:</strong> {issue.fix}</div>
                        </div>
                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded ${
                          issue.severity === 'HIGH' ? 'bg-red-600 text-white' :
                          issue.severity === 'MEDIUM' ? 'bg-yellow-600 text-white' :
                          'bg-blue-600 text-white'
                        }`}>
                          {issue.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keyword Analysis */}
            {atsAnalysis.keyword_analysis && (
              <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Keyword Analysis</h3>
                <div className="space-y-4">
                  {atsAnalysis.keyword_analysis.matched_keywords && atsAnalysis.keyword_analysis.matched_keywords.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-green-700 mb-2">✓ Matched Keywords ({atsAnalysis.keyword_analysis.matched_keywords.length})</div>
                      <div className="flex flex-wrap gap-2">
                        {atsAnalysis.keyword_analysis.matched_keywords.map((keyword: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">{keyword}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {atsAnalysis.keyword_analysis.missing_critical_keywords && atsAnalysis.keyword_analysis.missing_critical_keywords.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-red-700 mb-2">✗ Missing Critical Keywords</div>
                      <div className="flex flex-wrap gap-2">
                        {atsAnalysis.keyword_analysis.missing_critical_keywords.map((keyword: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">{keyword}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {atsAnalysis.keyword_analysis.missing_recommended_keywords && atsAnalysis.keyword_analysis.missing_recommended_keywords.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-orange-700 mb-2">⚠ Recommended Keywords</div>
                      <div className="flex flex-wrap gap-2">
                        {atsAnalysis.keyword_analysis.missing_recommended_keywords.map((keyword: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">{keyword}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-sm">
                    <span className="font-semibold">Keyword Density:</span>
                    <span className={`ml-2 px-3 py-1 rounded ${
                      atsAnalysis.keyword_analysis.keyword_density === 'OPTIMAL' ? 'bg-green-200 text-green-900' :
                      atsAnalysis.keyword_analysis.keyword_density === 'LOW' ? 'bg-yellow-200 text-yellow-900' :
                      'bg-red-200 text-red-900'
                    }`}>
                      {atsAnalysis.keyword_analysis.keyword_density}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Strengths */}
            {atsAnalysis.strengths && atsAnalysis.strengths.length > 0 && (
              <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Resume Strengths
                </h3>
                <div className="space-y-3">
                  {atsAnalysis.strengths.map((strength: any, index: number) => (
                    <div key={index} className="flex items-start">
                      <span className="text-green-600 mr-2 mt-1">✓</span>
                      <div>
                        {strength.category && <div className="font-semibold text-green-900">{strength.category}</div>}
                        <div className="text-gray-700">{strength.detail || strength}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weaknesses */}
            {atsAnalysis.weaknesses && atsAnalysis.weaknesses.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Areas for Improvement
                </h3>
                <div className="space-y-3">
                  {atsAnalysis.weaknesses.map((weakness: any, index: number) => (
                    <div key={index} className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <span className="text-red-600 mr-2 mt-1">✗</span>
                        <div>
                          {weakness.category && <div className="font-semibold text-red-900">{weakness.category}</div>}
                          <div className="text-gray-700">{weakness.detail || weakness}</div>
                        </div>
                      </div>
                      {weakness.priority && (
                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded ${
                          weakness.priority === 'HIGH' ? 'bg-red-600 text-white' :
                          weakness.priority === 'MEDIUM' ? 'bg-yellow-600 text-white' :
                          'bg-blue-600 text-white'
                        }`}>
                          {weakness.priority}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actionable Suggestions */}
            {atsAnalysis.actionable_suggestions && atsAnalysis.actionable_suggestions.length > 0 && (
              <div className="mb-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                  </svg>
                  Actionable Recommendations
                </h3>
                <div className="space-y-4">
                  {atsAnalysis.actionable_suggestions.map((suggestion: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded border border-purple-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-purple-900 flex-1">{suggestion.action}</div>
                        {suggestion.priority && (
                          <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded ${
                            suggestion.priority === 'HIGH' ? 'bg-red-600 text-white' :
                            suggestion.priority === 'MEDIUM' ? 'bg-yellow-600 text-white' :
                            'bg-blue-600 text-white'
                          }`}>
                            {suggestion.priority}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-700 mb-2">{suggestion.rationale}</div>
                      {suggestion.example && (
                        <div className="text-sm text-purple-700 bg-purple-100 p-2 rounded">
                          <span className="font-semibold">Example:</span> {suggestion.example}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Elements */}
            {atsAnalysis.missing_elements && (
              <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3">Missing Elements</h3>
                <div className="space-y-4">
                  {atsAnalysis.missing_elements.required_skills && atsAnalysis.missing_elements.required_skills.length > 0 && (
                    <div>
                      <div className="font-semibold text-red-700 text-sm mb-2">⚠ Required Skills</div>
                      <div className="flex flex-wrap gap-2">
                        {atsAnalysis.missing_elements.required_skills.map((skill: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {atsAnalysis.missing_elements.required_qualifications && atsAnalysis.missing_elements.required_qualifications.length > 0 && (
                    <div>
                      <div className="font-semibold text-orange-700 text-sm mb-2">📋 Required Qualifications</div>
                      <ul className="list-disc list-inside text-sm text-gray-700">
                        {atsAnalysis.missing_elements.required_qualifications.map((qual: string, index: number) => (
                          <li key={index}>{qual}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {atsAnalysis.missing_elements.recommended_additions && atsAnalysis.missing_elements.recommended_additions.length > 0 && (
                    <div>
                      <div className="font-semibold text-blue-700 text-sm mb-2">💡 Recommended Additions</div>
                      <ul className="list-disc list-inside text-sm text-gray-700">
                        {atsAnalysis.missing_elements.recommended_additions.map((item: string, index: number) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Old Format Support (fallback) */}
            {atsAnalysis.suggestions && !atsAnalysis.actionable_suggestions && (
              <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Suggestions</h3>
                <ul className="space-y-2">
                  {atsAnalysis.suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">💡</span>
                      <span className="text-gray-700">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Processing Overlay */}
      {analyzing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-2xl">
            <svg className="animate-spin h-16 w-16 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI is Optimizing Your Resume</h3>
            <p className="text-gray-600 text-center max-w-md">
              Please wait while AI analyzes your resume and job description. This may take 10-15 seconds.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-pulse">●</div>
              <span>Analyzing content...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <BuilderContent />
    </Suspense>
  );
}
