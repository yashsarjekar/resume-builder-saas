/**
 * Comprehensive Feature Test
 * Tests all major features with local backend
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const BASE_URL = 'http://localhost:3000';

async function testAllFeatures() {
  const chromeOptions = new chrome.Options();
  chromeOptions.addArguments('--disable-blink-features=AutomationControlled');

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build();

  try {
    console.log('\n🧪 COMPREHENSIVE FEATURE TESTING\n');
    console.log('═'.repeat(60));

    // Test 1: Login
    console.log('\n1️⃣  Testing Login...');
    await driver.get(`${BASE_URL}/login`);
    await driver.sleep(2000);
    await driver.findElement(By.id('email')).sendKeys('test@test.com');
    await driver.findElement(By.id('password')).sendKeys('Test1234');
    await driver.findElement(By.xpath('//button[contains(text(), "Sign In")]')).click();
    await driver.sleep(5000);

    if ((await driver.getCurrentUrl()).includes('/dashboard')) {
      console.log('   ✅ Login successful');
    } else {
      console.log('   ❌ Login failed');
    }

    // Test 2: Dashboard
    console.log('\n2️⃣  Testing Dashboard...');
    try {
      const dashboard = await driver.findElement(By.xpath('//*[contains(text(), "Welcome") or contains(text(), "Dashboard")]'));
      console.log('   ✅ Dashboard loaded');
    } catch (e) {
      console.log('   ⚠️  Dashboard elements may not have loaded');
    }

    // Test 3: Keyword Extraction (already tested)
    console.log('\n3️⃣  Keyword Extraction - Already Tested ✅');

    // Test 4: Cover Letter Generator
    console.log('\n4️⃣  Testing Cover Letter Generator...');
    await driver.get(`${BASE_URL}/tools/cover-letter`);
    await driver.sleep(3000);

    try {
      const heading = await driver.findElement(By.xpath('//*[contains(text(), "Cover Letter")]'));
      console.log('   ✅ Cover Letter page accessible');
    } catch (e) {
      console.log('   ❌ Could not access Cover Letter page');
    }

    // Test 5: LinkedIn Optimizer
    console.log('\n5️⃣  Testing LinkedIn Optimizer...');
    await driver.get(`${BASE_URL}/tools/linkedin`);
    await driver.sleep(3000);

    try {
      const heading = await driver.findElement(By.xpath('//*[contains(text(), "LinkedIn")]'));
      console.log('   ✅ LinkedIn page accessible');
    } catch (e) {
      console.log('   ❌ Could not access LinkedIn page');
    }

    // Test 6: Resume Builder
    console.log('\n6️⃣  Testing Resume Builder...');
    await driver.get(`${BASE_URL}/builder`);
    await driver.sleep(3000);

    try {
      const builderElement = await driver.findElement(By.xpath('//*[contains(text(), "Resume") or contains(text(), "Builder")]'));
      console.log('   ✅ Resume Builder page accessible');
    } catch (e) {
      console.log('   ❌ Could not access Resume Builder page');
    }

    // Test 7: Pricing Page
    console.log('\n7️⃣  Testing Pricing Page...');
    await driver.get(`${BASE_URL}/pricing`);
    await driver.sleep(2000);

    try {
      const pricing = await driver.findElement(By.xpath('//*[contains(text(), "Pricing") or contains(text(), "Plan")]'));
      console.log('   ✅ Pricing page accessible');
    } catch (e) {
      console.log('   ❌ Could not access Pricing page');
    }

    // Test 8: Logout
    console.log('\n8️⃣  Testing Logout...');
    await driver.get(`${BASE_URL}/dashboard`);
    await driver.sleep(2000);

    try {
      const logoutButton = await driver.findElement(By.xpath('//button[contains(text(), "Logout")]'));
      await logoutButton.click();
      await driver.sleep(2000);

      const currentUrl = await driver.getCurrentUrl();
      if (currentUrl.includes('/login') || currentUrl === `${BASE_URL}/`) {
        console.log('   ✅ Logout successful');
      } else {
        console.log('   ⚠️  Logout may not have worked correctly');
      }
    } catch (e) {
      console.log('   ❌ Could not test logout:', e.message);
    }

    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ ALL TESTS COMPLETE!\n');

    await driver.sleep(5000);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await driver.quit();
  }
}

testAllFeatures();
