/**
 * Diagnostic tool to capture browser logs and see what's failing
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const logging = require('selenium-webdriver/lib/logging');

async function diagnose() {
  const chromeOptions = new chrome.Options();
  chromeOptions.addArguments('--disable-blink-features=AutomationControlled');

  // Enable browser logging
  const prefs = new logging.Preferences();
  prefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .setLoggingPrefs(prefs)
    .build();

  try {
    console.log('\n🔍 DIAGNOSTIC TEST - Capturing Browser Behavior\n');
    console.log('═'.repeat(60));

    // Step 1: Go to login page
    console.log('\n1️⃣  Loading login page...');
    await driver.get('http://localhost:3000/login');
    await driver.sleep(2000);

    // Capture initial logs
    console.log('\n📝 Browser Console (Initial):');
    let logs = await driver.manage().logs().get(logging.Type.BROWSER);
    logs.forEach(log => {
      console.log(`   [${log.level.name}] ${log.message}`);
    });

    // Step 2: Fill form
    console.log('\n2️⃣  Filling login form...');
    await driver.findElement(By.id('email')).sendKeys('testuser@example.com');
    await driver.findElement(By.id('password')).sendKeys('TestUser12345');

    // Take screenshot before submit
    let screenshot = await driver.takeScreenshot();
    require('fs').writeFileSync('diagnostic_before_login.png', screenshot, 'base64');
    console.log('   📸 Screenshot saved: diagnostic_before_login.png');

    // Step 3: Submit form
    console.log('\n3️⃣  Submitting login form...');
    await driver.findElement(By.xpath('//button[contains(text(), "Sign In")]')).click();

    // Wait and capture what happens
    console.log('\n4️⃣  Waiting 10 seconds to see what happens...');
    await driver.sleep(10000);

    // Get current URL
    const url = await driver.getCurrentUrl();
    console.log(`\n📍 Current URL: ${url}`);

    // Capture logs after submit
    console.log('\n📝 Browser Console (After Submit):');
    logs = await driver.manage().logs().get(logging.Type.BROWSER);
    logs.forEach(log => {
      console.log(`   [${log.level.name}] ${log.message}`);
    });

    // Check for error messages
    console.log('\n🔍 Checking for error messages...');
    try {
      const errorElement = await driver.findElement(By.xpath('//*[contains(@class, "bg-red") or contains(@class, "text-red")]'));
      const errorText = await errorElement.getText();
      console.log(`   ❌ Error Message: "${errorText}"`);
    } catch (e) {
      console.log('   ✅ No error message displayed');
    }

    // Check localStorage
    console.log('\n💾 Checking localStorage...');
    const token = await driver.executeScript('return localStorage.getItem("token");');
    console.log(`   Token in localStorage: ${token ? 'YES (' + token.substring(0, 30) + '...)' : 'NO'}`);

    // Take final screenshot
    screenshot = await driver.takeScreenshot();
    require('fs').writeFileSync('diagnostic_after_login.png', screenshot, 'base64');
    console.log('\n📸 Final screenshot saved: diagnostic_after_login.png');

    // Get page source for debugging
    const pageSource = await driver.getPageSource();
    require('fs').writeFileSync('diagnostic_page_source.html', pageSource);
    console.log('📄 Page source saved: diagnostic_page_source.html');

    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ Diagnostic complete! Check the files and logs above.\n');

    // Keep browser open for manual inspection
    console.log('🔍 Browser will stay open for 30 seconds for manual inspection...');
    await driver.sleep(30000);

  } catch (error) {
    console.error('\n❌ Diagnostic failed:', error.message);
    const screenshot = await driver.takeScreenshot();
    require('fs').writeFileSync('diagnostic_error.png', screenshot, 'base64');
  } finally {
    await driver.quit();
  }
}

diagnose();
