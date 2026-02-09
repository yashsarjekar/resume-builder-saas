/**
 * End-to-End Testing Script for Resume Builder Frontend
 * Tests all pages, features, and user flows
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const API_URL = 'https://resume-builder-backend-production-f9db.up.railway.app';

// Test results storage
const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper function to log test results
function logTest(name, passed, message = '') {
  if (passed) {
    testResults.passed.push(name);
    console.log(`✅ PASS: ${name}`);
  } else {
    testResults.failed.push({ name, message });
    console.log(`❌ FAIL: ${name} - ${message}`);
  }
}

function logWarning(name, message) {
  testResults.warnings.push({ name, message });
  console.log(`⚠️  WARN: ${name} - ${message}`);
}

// Test 1: Frontend Server Availability
async function testServerAvailability() {
  console.log('\n=== Testing Server Availability ===');
  try {
    const response = await axios.get(BASE_URL, { timeout: 5000 });
    logTest('Frontend server is running', response.status === 200);
    return true;
  } catch (error) {
    logTest('Frontend server is running', false, error.message);
    return false;
  }
}

// Test 2: Backend API Availability
async function testBackendAvailability() {
  console.log('\n=== Testing Backend API Availability ===');
  try {
    const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
    logTest('Backend API is accessible', response.status === 200);
    logTest('Backend health check returns valid data', response.data && response.data.status === 'healthy');
    return true;
  } catch (error) {
    logTest('Backend API is accessible', false, error.message);
    return false;
  }
}

// Test 3: Static Pages Load
async function testStaticPages() {
  console.log('\n=== Testing Static Pages ===');

  const pages = [
    { path: '/', name: 'Landing Page' },
    { path: '/login', name: 'Login Page' },
    { path: '/signup', name: 'Signup Page' },
    { path: '/pricing', name: 'Pricing Page' },
    { path: '/dashboard', name: 'Dashboard Page' },
    { path: '/builder', name: 'Builder Page' },
    { path: '/tools/keywords', name: 'Keywords Tool Page' },
    { path: '/tools/cover-letter', name: 'Cover Letter Tool Page' },
    { path: '/tools/linkedin', name: 'LinkedIn Tool Page' }
  ];

  for (const page of pages) {
    try {
      const response = await axios.get(`${BASE_URL}${page.path}`, {
        timeout: 10000,
        validateStatus: () => true // Accept all status codes
      });

      if (response.status === 200) {
        const html = response.data;
        const hasValidHTML = html.includes('<!DOCTYPE html>') || html.includes('<html');
        logTest(`${page.name} loads successfully`, hasValidHTML,
          hasValidHTML ? '' : 'Invalid HTML structure');
      } else {
        logTest(`${page.name} loads successfully`, false, `Status: ${response.status}`);
      }
    } catch (error) {
      logTest(`${page.name} loads successfully`, false, error.message);
    }
  }
}

// Test 4: API Endpoints
async function testAPIEndpoints() {
  console.log('\n=== Testing API Endpoints ===');

  // Test unauthenticated endpoints
  try {
    const healthResponse = await axios.get(`${API_URL}/health`);
    logTest('Health endpoint accessible', healthResponse.status === 200);
  } catch (error) {
    logTest('Health endpoint accessible', false, error.message);
  }

  // Test signup endpoint (structure test only)
  try {
    const signupResponse = await axios.post(`${API_URL}/api/auth/signup`, {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'Test123456'
    }, { validateStatus: () => true });

    const isSuccess = signupResponse.status === 200 || signupResponse.status === 201;
    const hasToken = isSuccess && signupResponse.data && signupResponse.data.access_token;

    logTest('Signup endpoint responds correctly', isSuccess);
    logTest('Signup returns JWT token', hasToken);

    if (hasToken) {
      return signupResponse.data.access_token;
    }
  } catch (error) {
    logTest('Signup endpoint responds correctly', false, error.message);
  }

  return null;
}

// Test 5: Authentication Flow
async function testAuthenticationFlow(token) {
  console.log('\n=== Testing Authentication Flow ===');

  if (!token) {
    logWarning('Authentication flow', 'No token available from signup, skipping authenticated tests');
    return null;
  }

  try {
    // Test /me endpoint
    const meResponse = await axios.get(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    logTest('Get current user endpoint works', meResponse.status === 200);
    logTest('User data contains required fields',
      meResponse.data && meResponse.data.email && meResponse.data.subscription_type);

    return meResponse.data;
  } catch (error) {
    logTest('Get current user endpoint works', false, error.message);
    return null;
  }
}

// Test 6: Resume CRUD Operations
async function testResumeCRUD(token) {
  console.log('\n=== Testing Resume CRUD Operations ===');

  if (!token) {
    logWarning('Resume CRUD', 'No token available, skipping resume tests');
    return;
  }

  let createdResumeId = null;

  try {
    // Test Create Resume
    const createResponse = await axios.post(`${API_URL}/api/resume/`, {
      title: 'Test Resume',
      job_description: 'Software Engineer position requiring JavaScript and React skills',
      content: {
        personalInfo: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890'
        },
        summary: 'Experienced software engineer',
        experience: [{
          company: 'Test Company',
          title: 'Software Engineer',
          duration: '2020-2023',
          bullets: ['Developed features', 'Fixed bugs']
        }],
        skills: ['JavaScript', 'React', 'Node.js'],
        education: [{
          institution: 'Test University',
          degree: 'Bachelor of Science',
          year: '2020'
        }]
      },
      template_name: 'modern'
    }, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true
    });

    const createSuccess = createResponse.status === 200 || createResponse.status === 201;
    logTest('Create resume endpoint works', createSuccess);

    if (createSuccess && createResponse.data && createResponse.data.id) {
      createdResumeId = createResponse.data.id;
      logTest('Created resume has ID', true);
    } else {
      logTest('Created resume has ID', false, 'No ID in response');
    }

    // Test Get All Resumes
    const listResponse = await axios.get(`${API_URL}/api/resume/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    logTest('List resumes endpoint works', listResponse.status === 200);
    logTest('List resumes returns array', Array.isArray(listResponse.data));

    if (createdResumeId) {
      // Test Get Single Resume
      const getResponse = await axios.get(`${API_URL}/api/resume/${createdResumeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logTest('Get single resume endpoint works', getResponse.status === 200);
      logTest('Resume data is complete',
        getResponse.data && getResponse.data.id === createdResumeId);

      // Test Update Resume
      const updateResponse = await axios.put(`${API_URL}/api/resume/${createdResumeId}`, {
        title: 'Updated Test Resume'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logTest('Update resume endpoint works', updateResponse.status === 200);

      // Test Delete Resume
      const deleteResponse = await axios.delete(`${API_URL}/api/resume/${createdResumeId}`, {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: () => true
      });
      const deleteSuccess = deleteResponse.status === 200 || deleteResponse.status === 204;
      logTest('Delete resume endpoint works', deleteSuccess);
    }

  } catch (error) {
    logTest('Resume CRUD operations', false, error.message);
  }
}

// Test 7: AI Features
async function testAIFeatures(token) {
  console.log('\n=== Testing AI Features ===');

  if (!token) {
    logWarning('AI Features', 'No token available, skipping AI tests');
    return;
  }

  try {
    // Test Keyword Extraction
    const keywordResponse = await axios.post(`${API_URL}/api/ai/extract-keywords`, {
      job_description: 'Looking for a Senior Software Engineer with experience in JavaScript, React, Node.js, and AWS'
    }, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true
    });

    const keywordSuccess = keywordResponse.status === 200;
    logTest('Keyword extraction endpoint works', keywordSuccess);

    if (keywordSuccess) {
      logTest('Keywords array returned',
        Array.isArray(keywordResponse.data.keywords) && keywordResponse.data.keywords.length > 0);
    }

    // Test Cover Letter Generation
    const coverLetterResponse = await axios.post(`${API_URL}/api/ai/generate-cover-letter`, {
      job_description: 'Software Engineer position',
      resume_content: 'Experienced developer with 5 years in web development'
    }, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true
    });

    const coverLetterSuccess = coverLetterResponse.status === 200;
    logTest('Cover letter generation endpoint works', coverLetterSuccess);

    if (coverLetterSuccess) {
      logTest('Cover letter content returned',
        coverLetterResponse.data && coverLetterResponse.data.cover_letter &&
        coverLetterResponse.data.cover_letter.length > 0);
    }

    // Test LinkedIn Optimization
    const linkedinResponse = await axios.post(`${API_URL}/api/ai/optimize-linkedin`, {
      resume_content: 'Software Engineer with expertise in React and Node.js',
      target_role: 'Senior Software Engineer'
    }, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true
    });

    const linkedinSuccess = linkedinResponse.status === 200;
    logTest('LinkedIn optimization endpoint works', linkedinSuccess);

    if (linkedinSuccess) {
      logTest('LinkedIn data structure is correct',
        linkedinResponse.data &&
        linkedinResponse.data.optimized_headline &&
        linkedinResponse.data.optimized_summary &&
        Array.isArray(linkedinResponse.data.skills));
    }

  } catch (error) {
    logTest('AI Features', false, error.message);
  }
}

// Test 8: Payment Endpoints
async function testPaymentEndpoints(token) {
  console.log('\n=== Testing Payment Endpoints ===');

  if (!token) {
    logWarning('Payment', 'No token available, skipping payment tests');
    return;
  }

  try {
    // Test Create Order
    const orderResponse = await axios.post(`${API_URL}/api/payment/create-order`, {
      plan: 'starter'
    }, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true
    });

    const orderSuccess = orderResponse.status === 200;
    logTest('Create payment order endpoint works', orderSuccess);

    if (orderSuccess) {
      logTest('Payment order data is valid',
        orderResponse.data && orderResponse.data.order_id && orderResponse.data.amount);
    }

    // Test Get Pricing
    const pricingResponse = await axios.get(`${API_URL}/api/payment/pricing`, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true
    });

    logTest('Get pricing endpoint works', pricingResponse.status === 200);

  } catch (error) {
    logTest('Payment endpoints', false, error.message);
  }
}

// Test 9: Environment Variables
function testEnvironmentConfig() {
  console.log('\n=== Testing Environment Configuration ===');

  const fs = require('fs');
  const path = require('path');

  try {
    const envPath = path.join(__dirname, '.env.local');
    const envExists = fs.existsSync(envPath);
    logTest('.env.local file exists', envExists);

    if (envExists) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      logTest('NEXT_PUBLIC_API_URL is set', envContent.includes('NEXT_PUBLIC_API_URL='));
      logTest('NEXT_PUBLIC_RAZORPAY_KEY is set', envContent.includes('NEXT_PUBLIC_RAZORPAY_KEY='));
      logTest('Backend URL points to production',
        envContent.includes('resume-builder-backend-production-f9db.up.railway.app'));
    }
  } catch (error) {
    logTest('Environment configuration', false, error.message);
  }
}

// Test 10: Build Configuration
function testBuildConfiguration() {
  console.log('\n=== Testing Build Configuration ===');

  const fs = require('fs');
  const path = require('path');

  try {
    const packagePath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    // Check dependencies
    const requiredDeps = [
      'next', 'react', 'react-dom', 'typescript',
      'axios', 'zustand', '@tanstack/react-query',
      'react-hook-form', 'zod', '@hookform/resolvers'
    ];

    for (const dep of requiredDeps) {
      const hasDepency = packageJson.dependencies[dep] !== undefined;
      logTest(`Dependency ${dep} is installed`, hasDepency);
    }

    // Check scripts
    logTest('Build script exists', packageJson.scripts && packageJson.scripts.build);
    logTest('Dev script exists', packageJson.scripts && packageJson.scripts.dev);

  } catch (error) {
    logTest('Build configuration', false, error.message);
  }
}

// Main test runner
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   Resume Builder Frontend - E2E Testing Suite         ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('\nStarting comprehensive testing...\n');

  // Run tests sequentially
  const serverRunning = await testServerAvailability();

  if (!serverRunning) {
    console.log('\n⚠️  Frontend server is not running. Please start it with: npm run dev');
    console.log('Continuing with other tests...\n');
  }

  const backendAvailable = await testBackendAvailability();

  if (serverRunning) {
    await testStaticPages();
  }

  testEnvironmentConfig();
  testBuildConfiguration();

  if (backendAvailable) {
    const token = await testAPIEndpoints();

    if (token) {
      const userData = await testAuthenticationFlow(token);
      await testResumeCRUD(token);
      await testAIFeatures(token);
      await testPaymentEndpoints(token);
    }
  }

  // Print summary
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUMMARY                        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  console.log(`✅ PASSED: ${testResults.passed.length} tests`);
  console.log(`❌ FAILED: ${testResults.failed.length} tests`);
  console.log(`⚠️  WARNINGS: ${testResults.warnings.length}\n`);

  if (testResults.failed.length > 0) {
    console.log('Failed Tests:');
    testResults.failed.forEach(test => {
      console.log(`  • ${test.name}: ${test.message}`);
    });
    console.log('');
  }

  if (testResults.warnings.length > 0) {
    console.log('Warnings:');
    testResults.warnings.forEach(warning => {
      console.log(`  • ${warning.name}: ${warning.message}`);
    });
    console.log('');
  }

  const totalTests = testResults.passed.length + testResults.failed.length;
  const passRate = totalTests > 0 ? ((testResults.passed.length / totalTests) * 100).toFixed(2) : 0;

  console.log(`Overall Pass Rate: ${passRate}%\n`);

  if (passRate >= 90) {
    console.log('🎉 Excellent! All critical tests are passing.');
  } else if (passRate >= 70) {
    console.log('⚠️  Good, but some tests failed. Review the failures above.');
  } else {
    console.log('❌ Multiple failures detected. Please review and fix issues.');
  }

  console.log('\n════════════════════════════════════════════════════════\n');
}

// Run the tests
runAllTests().catch(console.error);
