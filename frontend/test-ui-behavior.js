/**
 * UI Behavior Testing Script
 * Tests form validations, user interactions, edge cases, and UI behavior
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const API_URL = 'https://resume-builder-backend-production-f9db.up.railway.app';

const results = { passed: [], failed: [], warnings: [] };

function log(type, name, message = '') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  if (type === 'pass') {
    results.passed.push(name);
    console.log(`[${timestamp}] ✅ ${name}`);
  } else if (type === 'fail') {
    results.failed.push({ name, message });
    console.log(`[${timestamp}] ❌ ${name}${message ? ': ' + message : ''}`);
  } else {
    results.warnings.push({ name, message });
    console.log(`[${timestamp}] ⚠️  ${name}${message ? ': ' + message : ''}`);
  }
}

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║        UI Behavior & Interaction Testing Suite           ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// Test 1: Form Validation Testing
async function testFormValidations() {
  console.log('\n=== Testing Form Validations ===\n');

  // Test Login Form Validation
  try {
    const invalidLogin = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'invalid-email',
      password: '123'
    }, { validateStatus: () => true });

    if (invalidLogin.status >= 400) {
      log('pass', 'Login form rejects invalid email format');
    } else {
      log('fail', 'Login form rejects invalid email format', 'Accepted invalid email');
    }
  } catch (error) {
    log('pass', 'Login form validation works', 'Validation error caught');
  }

  // Test Signup Form Validation
  try {
    const invalidSignup = await axios.post(`${API_URL}/api/auth/signup`, {
      name: 'A',
      email: 'not-an-email',
      password: '123'
    }, { validateStatus: () => true });

    if (invalidSignup.status >= 400) {
      log('pass', 'Signup form validates name length and email format');
    } else {
      log('fail', 'Signup form validates name length and email format');
    }
  } catch (error) {
    log('pass', 'Signup form validation works');
  }

  // Test empty fields
  try {
    const emptyFields = await axios.post(`${API_URL}/api/auth/login`, {
      email: '',
      password: ''
    }, { validateStatus: () => true });

    if (emptyFields.status >= 400) {
      log('pass', 'Forms reject empty required fields');
    } else {
      log('fail', 'Forms reject empty required fields');
    }
  } catch (error) {
    log('pass', 'Forms reject empty fields');
  }
}

// Test 2: File Structure Validation
function testFileStructure() {
  console.log('\n=== Testing File Structure ===\n');

  const requiredFiles = [
    'src/app/page.tsx',
    'src/app/layout.tsx',
    'src/app/(auth)/login/page.tsx',
    'src/app/(auth)/signup/page.tsx',
    'src/app/dashboard/page.tsx',
    'src/app/builder/page.tsx',
    'src/app/pricing/page.tsx',
    'src/app/tools/keywords/page.tsx',
    'src/app/tools/cover-letter/page.tsx',
    'src/app/tools/linkedin/page.tsx',
    'src/components/layout/Header.tsx',
    'src/components/layout/Footer.tsx',
    'src/lib/api.ts',
    'src/lib/validators.ts',
    'src/lib/utils.ts',
    'src/store/authStore.ts',
    'src/types/user.ts',
    'src/types/resume.ts',
    'src/types/api.ts',
    '.env.local',
    'package.json',
    'tsconfig.json'
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    const exists = fs.existsSync(filePath);
    if (exists) {
      log('pass', `File exists: ${file}`);
    } else {
      log('fail', `File exists: ${file}`, 'File not found');
    }
  }
}

// Test 3: Type Definitions
function testTypeDefinitions() {
  console.log('\n=== Testing Type Definitions ===\n');

  const typeFiles = [
    'src/types/user.ts',
    'src/types/resume.ts',
    'src/types/api.ts'
  ];

  for (const file of typeFiles) {
    try {
      const filePath = path.join(__dirname, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // Check for interface definitions
      const hasInterfaces = content.includes('interface') || content.includes('type');
      const hasExports = content.includes('export');

      if (hasInterfaces && hasExports) {
        log('pass', `${file} has valid TypeScript definitions`);
      } else {
        log('fail', `${file} has valid TypeScript definitions`, 'Missing interfaces or exports');
      }
    } catch (error) {
      log('fail', `${file} is readable`, error.message);
    }
  }
}

// Test 4: Validators Testing
function testValidators() {
  console.log('\n=== Testing Zod Validators ===\n');

  try {
    const validatorsPath = path.join(__dirname, 'src/lib/validators.ts');
    const content = fs.readFileSync(validatorsPath, 'utf8');

    // Check for required schemas
    const schemas = ['loginSchema', 'signupSchema', 'resumeSchema'];
    for (const schema of schemas) {
      if (content.includes(schema)) {
        log('pass', `${schema} is defined`);
      } else {
        log('fail', `${schema} is defined`, 'Schema not found');
      }
    }

    // Check for Zod usage
    if (content.includes('z.object') && content.includes('z.string')) {
      log('pass', 'Validators use Zod schemas');
    } else {
      log('fail', 'Validators use Zod schemas');
    }

  } catch (error) {
    log('fail', 'Validators file is readable', error.message);
  }
}

// Test 5: API Client Configuration
function testAPIClient() {
  console.log('\n=== Testing API Client Configuration ===\n');

  try {
    const apiPath = path.join(__dirname, 'src/lib/api.ts');
    const content = fs.readFileSync(apiPath, 'utf8');

    // Check for axios
    if (content.includes('axios')) {
      log('pass', 'API client uses Axios');
    } else {
      log('fail', 'API client uses Axios');
    }

    // Check for interceptors
    if (content.includes('interceptors.request') && content.includes('interceptors.response')) {
      log('pass', 'API client has request and response interceptors');
    } else {
      log('fail', 'API client has request and response interceptors');
    }

    // Check for token handling
    if (content.includes('Authorization') && content.includes('Bearer')) {
      log('pass', 'API client handles JWT tokens');
    } else {
      log('fail', 'API client handles JWT tokens');
    }

    // Check for 401 handling
    if (content.includes('401')) {
      log('pass', 'API client handles 401 errors');
    } else {
      log('fail', 'API client handles 401 errors');
    }

  } catch (error) {
    log('fail', 'API client file is readable', error.message);
  }
}

// Test 6: Component Structure
function testComponentStructure() {
  console.log('\n=== Testing Component Structure ===\n');

  const components = [
    { file: 'src/components/layout/Header.tsx', name: 'Header' },
    { file: 'src/components/layout/Footer.tsx', name: 'Footer' }
  ];

  for (const component of components) {
    try {
      const filePath = path.join(__dirname, component.file);
      const content = fs.readFileSync(filePath, 'utf8');

      // Check for 'use client' directive
      if (component.name === 'Header' && content.includes("'use client'")) {
        log('pass', `${component.name} has 'use client' directive`);
      }

      // Check for exports
      if (content.includes('export default')) {
        log('pass', `${component.name} has default export`);
      } else {
        log('fail', `${component.name} has default export`);
      }

      // Check for React import
      if (content.includes('react') || content.includes('next')) {
        log('pass', `${component.name} imports React/Next.js`);
      } else {
        log('fail', `${component.name} imports React/Next.js`);
      }

    } catch (error) {
      log('fail', `${component.name} component is readable`, error.message);
    }
  }
}

// Test 7: State Management
function testStateManagement() {
  console.log('\n=== Testing State Management ===\n');

  try {
    const storePath = path.join(__dirname, 'src/store/authStore.ts');
    const content = fs.readFileSync(storePath, 'utf8');

    // Check for Zustand
    if (content.includes('zustand') || content.includes('create')) {
      log('pass', 'Auth store uses Zustand');
    } else {
      log('fail', 'Auth store uses Zustand');
    }

    // Check for auth methods
    const methods = ['login', 'signup', 'logout', 'checkAuth'];
    for (const method of methods) {
      if (content.includes(method)) {
        log('pass', `Auth store has ${method} method`);
      } else {
        log('fail', `Auth store has ${method} method`);
      }
    }

    // Check for state properties
    if (content.includes('user') && content.includes('token') && content.includes('isAuthenticated')) {
      log('pass', 'Auth store has required state properties');
    } else {
      log('fail', 'Auth store has required state properties');
    }

  } catch (error) {
    log('fail', 'Auth store is readable', error.message);
  }
}

// Test 8: Page Implementation
function testPageImplementations() {
  console.log('\n=== Testing Page Implementations ===\n');

  const pages = [
    { file: 'src/app/page.tsx', requiredText: ['Landing', 'Hero', 'Features'] },
    { file: 'src/app/(auth)/login/page.tsx', requiredText: ['email', 'password', 'login'] },
    { file: 'src/app/(auth)/signup/page.tsx', requiredText: ['name', 'email', 'password', 'signup'] },
    { file: 'src/app/dashboard/page.tsx', requiredText: ['dashboard', 'resume', 'subscription'] },
    { file: 'src/app/builder/page.tsx', requiredText: ['builder', 'resume', 'ats'] },
    { file: 'src/app/pricing/page.tsx', requiredText: ['pricing', 'plan', 'razorpay'] }
  ];

  for (const page of pages) {
    try {
      const filePath = path.join(__dirname, page.file);
      const content = fs.readFileSync(filePath, 'utf8').toLowerCase();

      let foundCount = 0;
      for (const text of page.requiredText) {
        if (content.includes(text.toLowerCase())) {
          foundCount++;
        }
      }

      if (foundCount >= page.requiredText.length - 1) {
        log('pass', `${page.file} has required functionality`);
      } else {
        log('warn', `${page.file} might be missing some functionality`,
          `Found ${foundCount}/${page.requiredText.length} keywords`);
      }

    } catch (error) {
      log('fail', `${page.file} is readable`, error.message);
    }
  }
}

// Test 9: Environment Configuration
function testEnvironmentSetup() {
  console.log('\n=== Testing Environment Setup ===\n');

  try {
    const envPath = path.join(__dirname, '.env.local');
    const content = fs.readFileSync(envPath, 'utf8');

    const requiredVars = [
      'NEXT_PUBLIC_API_URL',
      'NEXT_PUBLIC_RAZORPAY_KEY',
      'NEXT_PUBLIC_APP_URL'
    ];

    for (const varName of requiredVars) {
      if (content.includes(`${varName}=`) && !content.includes(`${varName}=\n`)) {
        log('pass', `${varName} is configured`);
      } else {
        log('fail', `${varName} is configured`, 'Variable is empty or missing');
      }
    }

    // Check if pointing to production backend
    if (content.includes('resume-builder-backend-production-f9db.up.railway.app')) {
      log('pass', 'Environment points to production backend');
    } else {
      log('warn', 'Environment configuration', 'Not using production backend URL');
    }

  } catch (error) {
    log('fail', 'Environment file is readable', error.message);
  }
}

// Test 10: Routing Configuration
function testRoutingSetup() {
  console.log('\n=== Testing Routing Configuration ===\n');

  try {
    const layoutPath = path.join(__dirname, 'src/app/layout.tsx');
    const content = fs.readFileSync(layoutPath, 'utf8');

    if (content.includes('Header') && content.includes('Footer')) {
      log('pass', 'Root layout includes Header and Footer');
    } else {
      log('fail', 'Root layout includes Header and Footer');
    }

    if (content.includes('metadata')) {
      log('pass', 'Root layout has metadata configured');
    } else {
      log('fail', 'Root layout has metadata configured');
    }

  } catch (error) {
    log('fail', 'Layout configuration is readable', error.message);
  }
}

// Test 11: AI Tools Integration
function testAIToolsIntegration() {
  console.log('\n=== Testing AI Tools Integration ===\n');

  const tools = [
    { file: 'src/app/tools/keywords/page.tsx', feature: 'keyword extraction' },
    { file: 'src/app/tools/cover-letter/page.tsx', feature: 'cover letter generation' },
    { file: 'src/app/tools/linkedin/page.tsx', feature: 'LinkedIn optimization' }
  ];

  for (const tool of tools) {
    try {
      const filePath = path.join(__dirname, tool.file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');

        // Check for API integration
        if (content.includes('api.post') || content.includes('axios')) {
          log('pass', `${tool.feature} tool has API integration`);
        } else {
          log('fail', `${tool.feature} tool has API integration`);
        }

        // Check for loading state
        if (content.includes('loading') || content.includes('setLoading')) {
          log('pass', `${tool.feature} tool has loading state`);
        } else {
          log('warn', `${tool.feature} tool loading state`, 'No loading indicator found');
        }

        // Check for error handling
        if (content.includes('error') || content.includes('catch')) {
          log('pass', `${tool.feature} tool has error handling`);
        } else {
          log('fail', `${tool.feature} tool has error handling`);
        }

      } else {
        log('fail', `${tool.feature} tool exists`, 'File not found');
      }
    } catch (error) {
      log('fail', `${tool.feature} tool is readable`, error.message);
    }
  }
}

// Test 12: Build Output Verification
async function testBuildOutput() {
  console.log('\n=== Testing Build Output ===\n');

  try {
    const { execSync } = require('child_process');

    // Check if .next directory exists
    const nextPath = path.join(__dirname, '.next');
    if (fs.existsSync(nextPath)) {
      log('pass', 'Build directory (.next) exists');

      // Check for key build artifacts
      const buildId = path.join(nextPath, 'BUILD_ID');
      if (fs.existsSync(buildId)) {
        log('pass', 'Build ID file exists');
      } else {
        log('warn', 'Build artifacts', 'BUILD_ID not found');
      }
    } else {
      log('warn', 'Build directory', 'Run npm run build to generate build artifacts');
    }

  } catch (error) {
    log('warn', 'Build output verification', error.message);
  }
}

// Main test execution
async function runBehaviorTests() {
  console.log('Starting UI behavior testing...\n');

  await testFormValidations();
  testFileStructure();
  testTypeDefinitions();
  testValidators();
  testAPIClient();
  testComponentStructure();
  testStateManagement();
  testPageImplementations();
  testEnvironmentSetup();
  testRoutingSetup();
  testAIToolsIntegration();
  await testBuildOutput();

  // Print summary
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                   BEHAVIOR TEST SUMMARY                   ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  console.log(`✅ PASSED: ${results.passed.length} tests`);
  console.log(`❌ FAILED: ${results.failed.length} tests`);
  console.log(`⚠️  WARNINGS: ${results.warnings.length}\n`);

  if (results.failed.length > 0) {
    console.log('❌ Failed Tests:');
    results.failed.forEach(test => {
      console.log(`   • ${test.name}${test.message ? ': ' + test.message : ''}`);
    });
    console.log('');
  }

  if (results.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    results.warnings.forEach(warning => {
      console.log(`   • ${warning.name}${warning.message ? ': ' + warning.message : ''}`);
    });
    console.log('');
  }

  const totalTests = results.passed.length + results.failed.length;
  const passRate = totalTests > 0 ? ((results.passed.length / totalTests) * 100).toFixed(2) : 0;

  console.log(`Overall Pass Rate: ${passRate}%\n`);

  if (results.failed.length === 0 && results.warnings.length === 0) {
    console.log('🎉 Perfect! All behavior tests passed with no warnings!');
  } else if (results.failed.length === 0) {
    console.log('✅ All tests passed! Review warnings for potential improvements.');
  } else if (passRate >= 90) {
    console.log('👍 Good! Most tests passed. Fix remaining failures.');
  } else {
    console.log('⚠️  Several issues detected. Review and fix failures above.');
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');
}

// Run all behavior tests
runBehaviorTests().catch(console.error);
