/**
 * Manual test of authentication flow
 */

const axios = require('axios');

const API_URL = 'https://resume-builder-backend-production-f9db.up.railway.app';

async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow\n');

  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'Test123456';
  const testName = 'Test User';

  try {
    // Step 1: Signup
    console.log('1️⃣  Testing Signup...');
    const signupResponse = await axios.post(`${API_URL}/api/auth/signup`, {
      email: testEmail,
      name: testName,
      password: testPassword,
    });
    console.log('✅ Signup successful');
    console.log('   User ID:', signupResponse.data.id);
    console.log('   Response includes token?', !!signupResponse.data.access_token);
    console.log('');

    // Step 2: Login
    console.log('2️⃣  Testing Login...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: testEmail,
      password: testPassword,
    });
    console.log('✅ Login successful');
    console.log('   Token received:', loginResponse.data.access_token.substring(0, 30) + '...');
    console.log('');

    const token = loginResponse.data.access_token;

    // Step 3: Get User Data
    console.log('3️⃣  Testing /me endpoint...');
    const meResponse = await axios.get(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('✅ /me endpoint successful');
    console.log('   User name:', meResponse.data.name);
    console.log('   User email:', meResponse.data.email);
    console.log('   Subscription:', meResponse.data.subscription_type);
    console.log('');

    console.log('🎉 All authentication steps passed!\n');
    console.log('Summary:');
    console.log('  - Signup creates user (no token returned)');
    console.log('  - Login returns JWT token');
    console.log('  - /me endpoint works with Bearer token');
    console.log('  - Frontend needs to auto-login after signup ✅\n');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   URL:', error.config.url);
    }
  }
}

testAuthFlow();
