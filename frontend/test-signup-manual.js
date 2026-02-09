/**
 * Manual signup test with console logging
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function testSignup() {
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
    const testUser = {
      name: 'Manual Test',
      email: `manualtest${Date.now()}@example.com`,
      password: 'Test123456!',
    };

    console.log('\n🧪 Testing Signup Flow');
    console.log('Test User:', testUser.email);

    // Enable browser console logging
    await driver.manage().logs();

    // Go to signup page
    await driver.get('http://localhost:3000/signup');
    console.log('📄 Loaded signup page');

    // Fill form
    await driver.findElement(By.id('name')).sendKeys(testUser.name);
    await driver.findElement(By.id('email')).sendKeys(testUser.email);
    await driver.findElement(By.id('password')).sendKeys(testUser.password);
    await driver.findElement(By.id('agreeToTerms')).click();

    console.log('✏️  Form filled');

    // Get browser logs before submit
    console.log('\n📝 Console logs BEFORE submit:');
    const logsBefore = await driver.manage().logs().get('browser');
    logsBefore.forEach(log => console.log(`   [${log.level.name}] ${log.message}`));

    // Submit
    const submitButton = await driver.findElement(By.xpath('//button[contains(text(), "Create Account")]'));
    await submitButton.click();

    console.log('\n⏳ Waiting for response (30 seconds)...');

    // Wait and monitor
    await driver.sleep(30000);

    // Get console logs after submit
    console.log('\n📝 Console logs AFTER submit:');
    const logsAfter = await driver.manage().logs().get('browser');
    logsAfter.forEach(log => console.log(`   [${log.level.name}] ${log.message}`));

    // Check current URL
    const currentUrl = await driver.getCurrentUrl();
    console.log('\n📍 Current URL:', currentUrl);

    // Check for error message
    try {
      const errorDiv = await driver.findElement(By.xpath('//*[contains(@class, "bg-red")]'));
      const errorText = await errorDiv.getText();
      console.log('❌ Error message:', errorText);
    } catch (e) {
      console.log('✅ No error message displayed');
    }

    // Take screenshot
    const screenshot = await driver.takeScreenshot();
    require('fs').writeFileSync('manual-signup-test.png', screenshot, 'base64');
    console.log('\n📸 Screenshot saved: manual-signup-test.png');

    // Keep browser open for inspection
    console.log('\n🔍 Browser will stay open for 10 seconds...');
    await driver.sleep(10000);

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
  } finally {
    await driver.quit();
  }
}

testSignup();
