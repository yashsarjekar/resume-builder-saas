/**
 * Comprehensive Dashboard Features Test
 * Tests login → dashboard redirect → all features working
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const BASE_URL = 'http://localhost:3000';
const TIMEOUT = 30000;

// Use existing test user or create credentials
const TEST_USER = {
  email: 'testuser@example.com',
  password: 'TestUser12345',
  name: 'Test User'
};

let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logResult(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`\n${status}: ${testName}`);
  if (details) console.log(`   ${details}`);

  testResults.tests.push({ testName, passed, details });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

async function takeScreenshot(driver, name) {
  try {
    const screenshot = await driver.takeScreenshot();
    const fs = require('fs');
    const filename = `dashboard_test_${name.replace(/\s/g, '_')}_${Date.now()}.png`;
    fs.writeFileSync(filename, screenshot, 'base64');
    console.log(`   📸 Screenshot: ${filename}`);
  } catch (error) {
    console.log(`   Failed to capture screenshot: ${error.message}`);
  }
}

async function waitForElement(driver, by, timeout = TIMEOUT) {
  try {
    await driver.wait(until.elementLocated(by), timeout);
    return await driver.findElement(by);
  } catch (error) {
    throw new Error(`Element not found: ${by.toString()}`);
  }
}

async function testLoginFlow(driver) {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║           DASHBOARD FEATURES COMPREHENSIVE TEST            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Step 1: Navigate to login page
    console.log('📍 Step 1: Navigating to login page...');
    await driver.get(`${BASE_URL}/login`);
    await driver.sleep(1000);
    logResult('Login Page Load', true, 'Page loaded successfully');

    // Step 2: Fill login form
    console.log('📍 Step 2: Filling login form...');
    const emailInput = await waitForElement(driver, By.id('email'));
    await emailInput.clear();
    await emailInput.sendKeys(TEST_USER.email);

    const passwordInput = await waitForElement(driver, By.id('password'));
    await passwordInput.clear();
    await passwordInput.sendKeys(TEST_USER.password);

    logResult('Login Form Fill', true, 'Credentials entered');

    // Step 3: Submit login form
    console.log('📍 Step 3: Submitting login...');
    const submitButton = await waitForElement(driver, By.xpath('//button[contains(text(), "Sign In")]'));
    await submitButton.click();

    // Wait for redirect to dashboard
    console.log('📍 Step 4: Waiting for dashboard redirect...');
    await driver.wait(
      until.urlContains('/dashboard'),
      TIMEOUT,
      'Dashboard redirect timeout'
    );

    const currentUrl = await driver.getCurrentUrl();
    logResult('Dashboard Redirect', currentUrl.includes('/dashboard'), `URL: ${currentUrl}`);

    // Step 5: Wait for dashboard to load completely
    console.log('📍 Step 5: Waiting for dashboard content to load...');
    await driver.sleep(3000); // Wait for loading state to finish

    // Take screenshot of dashboard
    await takeScreenshot(driver, 'dashboard_loaded');

    // Step 6: Check for user greeting
    console.log('📍 Step 6: Checking user greeting...');
    try {
      const greeting = await driver.findElement(By.xpath('//*[contains(text(), "Welcome back")]'));
      const greetingText = await greeting.getText();
      logResult('User Greeting Display', true, greetingText);
    } catch (error) {
      logResult('User Greeting Display', false, 'Greeting not found');
    }

    // Step 7: Check subscription card
    console.log('📍 Step 7: Verifying subscription card...');
    try {
      const subscriptionCard = await driver.findElement(By.xpath('//*[contains(text(), "Subscription")]'));
      logResult('Subscription Card', true, 'Subscription card visible');

      // Check if subscription type is displayed
      const subscriptionType = await driver.findElement(By.xpath('//*[contains(text(), "free") or contains(text(), "FREE")]'));
      logResult('Subscription Type Display', true, 'Shows subscription tier');
    } catch (error) {
      logResult('Subscription Card', false, error.message);
      await takeScreenshot(driver, 'subscription_card_missing');
    }

    // Step 8: Check resumes created card
    console.log('📍 Step 8: Verifying resumes card...');
    try {
      const resumesCard = await driver.findElement(By.xpath('//*[contains(text(), "Resumes Created")]'));
      logResult('Resumes Card', true, 'Resumes card visible');

      // Check for resume count display (e.g., "0 / 1")
      const resumeCount = await driver.findElement(By.xpath('//*[contains(text(), "/")]'));
      const countText = await resumeCount.getText();
      logResult('Resume Count Display', true, `Count: ${countText}`);
    } catch (error) {
      logResult('Resumes Card', false, error.message);
    }

    // Step 9: Check ATS analyses card
    console.log('📍 Step 9: Verifying ATS analyses card...');
    try {
      const atsCard = await driver.findElement(By.xpath('//*[contains(text(), "ATS Analyses")]'));
      logResult('ATS Analyses Card', true, 'ATS card visible');
    } catch (error) {
      logResult('ATS Analyses Card', false, error.message);
    }

    // Step 10: Check AI Tools section
    console.log('📍 Step 10: Verifying AI Tools section...');
    try {
      const aiToolsHeader = await driver.findElement(By.xpath('//*[contains(text(), "AI Tools")]'));
      logResult('AI Tools Section', true, 'AI Tools section present');

      // Check for individual AI tools
      const tools = ['Keyword Extractor', 'Cover Letter', 'LinkedIn'];
      for (const tool of tools) {
        try {
          await driver.findElement(By.xpath(`//*[contains(text(), "${tool}")]`));
          logResult(`AI Tool: ${tool}`, true, `${tool} card visible`);
        } catch (error) {
          logResult(`AI Tool: ${tool}`, false, 'Tool card not found');
        }
      }
    } catch (error) {
      logResult('AI Tools Section', false, error.message);
    }

    // Step 11: Check Create Resume button/link
    console.log('📍 Step 11: Verifying Create Resume button...');
    try {
      const createButton = await driver.findElement(
        By.xpath('//a[contains(@href, "/builder") or contains(text(), "Create Resume")] | //button[contains(text(), "Create Resume")]')
      );
      logResult('Create Resume Button', true, 'Create button found');

      // Check if button is clickable
      const isEnabled = await createButton.isEnabled();
      logResult('Create Resume Clickable', isEnabled, `Button enabled: ${isEnabled}`);
    } catch (error) {
      logResult('Create Resume Button', false, error.message);
      await takeScreenshot(driver, 'create_button_missing');
    }

    // Step 12: Test navigation to Keyword Extractor
    console.log('📍 Step 12: Testing navigation to Keyword Extractor...');
    try {
      const keywordLink = await driver.findElement(By.xpath('//a[contains(@href, "/tools/keywords")]'));
      await keywordLink.click();

      await driver.wait(until.urlContains('/tools/keywords'), 10000);
      logResult('Navigate to Keyword Extractor', true, 'Navigation successful');

      // Verify keyword extractor page loaded
      await driver.findElement(By.xpath('//*[contains(text(), "Keyword Extractor") or contains(text(), "Keywords")]'));
      logResult('Keyword Extractor Page Load', true, 'Page content loaded');

      // Go back to dashboard
      await driver.navigate().back();
      await driver.wait(until.urlContains('/dashboard'), 5000);
    } catch (error) {
      logResult('Navigate to Keyword Extractor', false, error.message);
    }

    // Step 13: Test navigation to Cover Letter tool
    console.log('📍 Step 13: Testing navigation to Cover Letter tool...');
    try {
      const coverLetterLink = await driver.findElement(By.xpath('//a[contains(@href, "/tools/cover-letter")]'));
      await coverLetterLink.click();

      await driver.wait(until.urlContains('/tools/cover-letter'), 10000);
      logResult('Navigate to Cover Letter', true, 'Navigation successful');

      await driver.findElement(By.xpath('//*[contains(text(), "Cover Letter")]'));
      logResult('Cover Letter Page Load', true, 'Page content loaded');

      await driver.navigate().back();
      await driver.wait(until.urlContains('/dashboard'), 5000);
    } catch (error) {
      logResult('Navigate to Cover Letter', false, error.message);
    }

    // Step 14: Test navigation to LinkedIn tool
    console.log('📍 Step 14: Testing navigation to LinkedIn tool...');
    try {
      const linkedinLink = await driver.findElement(By.xpath('//a[contains(@href, "/tools/linkedin")]'));
      await linkedinLink.click();

      await driver.wait(until.urlContains('/tools/linkedin'), 10000);
      logResult('Navigate to LinkedIn', true, 'Navigation successful');

      await driver.findElement(By.xpath('//*[contains(text(), "LinkedIn")]'));
      logResult('LinkedIn Page Load', true, 'Page content loaded');

      await driver.navigate().back();
      await driver.wait(until.urlContains('/dashboard'), 5000);
    } catch (error) {
      logResult('Navigate to LinkedIn', false, error.message);
    }

    // Step 15: Test header navigation
    console.log('📍 Step 15: Testing header navigation...');
    try {
      // Check if header has user menu or logout option
      const header = await driver.findElement(By.xpath('//header | //nav'));
      logResult('Header Present', true, 'Header navigation found');

      // Try to find logout or user menu
      try {
        const logoutButton = await driver.findElement(By.xpath('//*[contains(text(), "Logout") or contains(text(), "Log out")]'));
        logResult('Logout Button Visible', true, 'Logout option available');
      } catch (e) {
        logResult('Logout Button Visible', false, 'Logout button not found in header');
      }
    } catch (error) {
      logResult('Header Present', false, error.message);
    }

    // Step 16: Check pricing page access
    console.log('📍 Step 16: Testing navigation to Pricing...');
    try {
      const pricingLink = await driver.findElement(By.xpath('//a[contains(@href, "/pricing") and contains(text(), "Pricing")]'));
      await pricingLink.click();

      await driver.wait(until.urlContains('/pricing'), 10000);
      logResult('Navigate to Pricing', true, 'Pricing page accessible');

      await driver.navigate().back();
      await driver.wait(until.urlContains('/dashboard'), 5000);
    } catch (error) {
      logResult('Navigate to Pricing', false, 'Could not access pricing page');
    }

    // Final screenshot
    await takeScreenshot(driver, 'test_complete');

  } catch (error) {
    console.error('\n❌ Critical Error:', error.message);
    await takeScreenshot(driver, 'critical_error');
    throw error;
  }
}

async function runTests() {
  const chromeOptions = new chrome.Options();
  chromeOptions.addArguments('--disable-blink-features=AutomationControlled');
  chromeOptions.setUserPreferences({
    'profile.default_content_setting_values.notifications': 2,
  });

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build();

  try {
    await testLoginFlow(driver);

    // Print summary
    console.log('\n\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                     TEST SUMMARY                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log(`📊 Total Tests: ${testResults.passed + testResults.failed}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📈 Pass Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2)}%`);

    if (testResults.failed > 0) {
      console.log('\n❌ Failed Tests:');
      testResults.tests.filter(t => !t.passed).forEach(test => {
        console.log(`  • ${test.testName}: ${test.details}`);
      });
    }

    console.log('\n' + (testResults.failed === 0 ? '🎉 All tests passed!' : '⚠️  Some tests failed.'));

    // Keep browser open for 5 seconds to view final state
    console.log('\n🔍 Browser will close in 5 seconds...');
    await driver.sleep(5000);

  } catch (error) {
    console.error('\n💥 Test execution failed:', error.message);
  } finally {
    await driver.quit();
    console.log('\n✅ Browser closed.');
  }
}

// Run the tests
runTests();
