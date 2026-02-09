/**
 * Test Keyword Extraction Feature
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const BASE_URL = 'http://localhost:3000';
const TIMEOUT = 60000; // 60 seconds for AI processing

const JOB_DESCRIPTION = `About the job
About Arcserve

Arcserve provides exceptional solutions to protect the priceless digital assets of organizations in need of full scale, comprehensive data protection. Established in 1983, Arcserve is the world's most experienced provider of business continuity solutions that safeguard every application and system, on every premises and every cloud.

About the role

We are looking for a Senior Software Engineer to help design and build new features for our data protection products. The ideal candidate is strong in backend/system development, has proven delivery experience, and thrives in collaborative, dynamic environments.

Responsibilities
- Design, develop, and maintain software applications for Arcserve backup and recovery products.
- Write clean, efficient, and well documented code.
- Perform code reviews, debug complex issues and propose solutions.
- Collaborate with cross functional teams in the MSP product space.
- Contribute to project planning and ensure deliverables are met.

Requirements
- 5+ years of strong development experience with Python (Mandatory).
- Experience with Windows application development.
- Solid understanding of data structures, algorithms, and component based design.
- Good software engineering practices (testing, maintainability).
- Experience with Agile development practices.
- Experience with build/configuration tools (CMAKE, MSBuild), CI/CD, and Git.
- Knowledge of Windows installation tools (MSI, WIX) is a plus.
- React JS or other frontend skills are optional/nice to have, not required.

Education
Bachelor's degree in computer science, Engineering, or related field.`;

async function testKeywordExtraction() {
  const chromeOptions = new chrome.Options();
  chromeOptions.addArguments('--disable-blink-features=AutomationControlled');

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build();

  try {
    console.log('\n🔍 TESTING KEYWORD EXTRACTION FEATURE\n');
    console.log('═'.repeat(60));

    // Step 1: Login
    console.log('\n1️⃣  Logging in...');
    await driver.get(`${BASE_URL}/login`);
    await driver.sleep(2000);

    await driver.findElement(By.id('email')).sendKeys('test@test.com');
    await driver.findElement(By.id('password')).sendKeys('Test1234');
    await driver.findElement(By.xpath('//button[contains(text(), "Sign In")]')).click();

    console.log('   ⏳ Waiting for dashboard...');
    await driver.sleep(5000); // Wait for login and redirect

    const currentUrl = await driver.getCurrentUrl();
    if (currentUrl.includes('/dashboard')) {
      console.log('   ✅ Successfully logged in and on dashboard');
    } else {
      console.log('   ⚠️  Not on dashboard, on:', currentUrl);
    }

    // Check localStorage has token
    const token = await driver.executeScript('return localStorage.getItem("token")');
    console.log('   ✅ Token in localStorage:', token ? 'YES' : 'NO');
    if (token) {
      console.log('   Token preview:', token.substring(0, 30) + '...');
    }

    // Step 2: Navigate to Keyword Extractor
    console.log('\n2️⃣  Navigating to Keyword Extractor...');
    await driver.get(`${BASE_URL}/tools/keywords`);
    await driver.sleep(5000); // Increased wait for auth check

    // Verify page loaded
    try {
      const heading = await driver.findElement(By.xpath('//*[contains(text(), "Keyword") or contains(text(), "Extract")]'));
      console.log('   ✅ Keyword Extractor page loaded');
    } catch (e) {
      console.log('   ❌ Could not find keyword extractor heading');
    }

    // Take screenshot
    let screenshot = await driver.takeScreenshot();
    require('fs').writeFileSync('keyword_extractor_page.png', screenshot, 'base64');
    console.log('   📸 Screenshot: keyword_extractor_page.png');

    // Step 3: Fill in job description
    console.log('\n3️⃣  Filling job description...');
    const textarea = await driver.findElement(By.xpath('//textarea[contains(@placeholder, "job description")]'));
    await textarea.clear();
    await textarea.sendKeys(JOB_DESCRIPTION);
    console.log('   ✅ Job description filled');

    // Step 4: Click Extract Keywords
    console.log('\n4️⃣  Clicking "Extract Keywords" button...');
    const extractButton = await driver.findElement(By.xpath('//button[contains(text(), "Extract")]'));
    await extractButton.click();
    console.log('   ✅ Button clicked');

    // Step 5: Wait for results
    console.log('\n5️⃣  Waiting for AI processing (up to 60 seconds)...');

    // Check for loading state
    try {
      const loadingText = await driver.findElement(By.xpath('//*[contains(text(), "Processing") or contains(text(), "Extracting") or contains(text(), "Loading")]'));
      console.log('   ⏳ Processing...');
    } catch (e) {
      console.log('   ℹ️  No loading indicator found (might process quickly)');
    }

    await driver.sleep(10000); // Wait 10 seconds

    // Check browser console for errors
    console.log('\n📝 Browser Console Logs:');
    const logs = await driver.manage().logs().get('browser');
    logs.slice(-10).forEach(log => {
      if (log.level.name === 'SEVERE' || log.level.name === 'WARNING') {
        console.log(`   [${log.level.name}] ${log.message.substring(0, 150)}`);
      }
    });

    // Step 6: Check for results
    console.log('\n6️⃣  Checking for results...');

    // Take screenshot of results
    screenshot = await driver.takeScreenshot();
    require('fs').writeFileSync('keyword_extraction_results.png', screenshot, 'base64');
    console.log('   📸 Screenshot: keyword_extraction_results.png');

    // Try to find extracted keywords
    try {
      // Look for keywords display area
      const resultsArea = await driver.findElement(By.xpath('//*[contains(@class, "keywords") or contains(@class, "result") or contains(@class, "bg-")]'));
      const resultText = await resultsArea.getText();

      if (resultText && resultText.length > 20) {
        console.log('   ✅ Results displayed!');
        console.log('\n📊 Extracted Keywords:');
        console.log('─'.repeat(60));
        console.log(resultText.substring(0, 500));
        if (resultText.length > 500) console.log('   ... (truncated)');
      } else {
        console.log('   ⚠️  Results area found but might be empty');
      }
    } catch (e) {
      console.log('   ❌ No results found or error displaying');
      console.log('   Error:', e.message);
    }

    // Check for error messages
    try {
      const errorDiv = await driver.findElement(By.xpath('//*[contains(@class, "bg-red") or contains(@class, "text-red")]'));
      const errorText = await errorDiv.getText();
      console.log('\n❌ Error Message:', errorText);
    } catch (e) {
      console.log('\n✅ No error messages displayed');
    }

    // Get page source for debugging
    const pageSource = await driver.getPageSource();
    if (pageSource.includes('Python') || pageSource.includes('Software Engineer')) {
      console.log('\n✅ Keywords found in page source!');

      // Try to extract some keywords from the page
      const keywords = ['Python', 'Windows', 'Agile', 'CI/CD', 'Git', 'Data structures', 'Algorithms'];
      console.log('\n🔍 Looking for expected keywords in page:');
      keywords.forEach(kw => {
        if (pageSource.includes(kw)) {
          console.log(`   ✅ Found: ${kw}`);
        }
      });
    }

    console.log('\n' + '═'.repeat(60));
    console.log('\n🔍 Browser will stay open for 30 seconds for inspection...');
    await driver.sleep(30000);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    const screenshot = await driver.takeScreenshot();
    require('fs').writeFileSync('keyword_extraction_error.png', screenshot, 'base64');
    console.log('📸 Error screenshot saved');
  } finally {
    await driver.quit();
    console.log('\n✅ Test complete');
  }
}

testKeywordExtraction();
