/**
 * Comprehensive Tests for FavoriteStore.init() method
 * Validates that init() properly sets userId and triggers load()
 */

import { favoriteStore } from './favorite.store.js';

/**
 * Test Suite: init() method behavior
 */
async function testInitBehavior() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║        FavoriteStore init() Method Tests              ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  let testsPassed = 0;
  let testsFailed = 0;
  
  // Save original state
  const originalUserId = favoriteStore.userId;
  const originalFavorites = [...favoriteStore.favorites];
  const originalLoad = favoriteStore.load;
  
  try {
    // Test 1: init() sets userId correctly
    console.log('Test 1: init() sets userId correctly');
    favoriteStore.clear();
    
    // Mock load to prevent API calls
    let loadCallCount = 0;
    favoriteStore.load = async function() {
      loadCallCount++;
      console.log(`  → load() called (count: ${loadCallCount})`);
    };
    
    favoriteStore.init(12345);
    
    if (favoriteStore.userId === '12345') {
      console.log('  ✅ PASS: userId set to "12345"\n');
      testsPassed++;
    } else {
      console.error(`  ❌ FAIL: Expected userId "12345", got "${favoriteStore.userId}"\n`);
      testsFailed++;
    }
    
    // Test 2: init() converts number to string
    console.log('Test 2: init() converts number userId to string');
    favoriteStore.clear();
    loadCallCount = 0;
    
    favoriteStore.init(8968);
    
    if (favoriteStore.userId === '8968' && typeof favoriteStore.userId === 'string') {
      console.log('  ✅ PASS: userId "8968" is a string\n');
      testsPassed++;
    } else {
      console.error(`  ❌ FAIL: userId should be string "8968", got ${typeof favoriteStore.userId} "${favoriteStore.userId}"\n`);
      testsFailed++;
    }
    
    // Test 3: init() calls load() exactly once
    console.log('Test 3: init() triggers load() method');
    favoriteStore.clear();
    loadCallCount = 0;
    
    favoriteStore.init(9999);
    
    if (loadCallCount === 1) {
      console.log('  ✅ PASS: load() was called exactly once\n');
      testsPassed++;
    } else {
      console.error(`  ❌ FAIL: load() should be called once, was called ${loadCallCount} times\n`);
      testsFailed++;
    }
    
    // Test 4: init() handles string userId
    console.log('Test 4: init() handles string userId');
    favoriteStore.clear();
    loadCallCount = 0;
    
    favoriteStore.init('user_abc_123');
    
    if (favoriteStore.userId === 'user_abc_123') {
      console.log('  ✅ PASS: String userId preserved correctly\n');
      testsPassed++;
    } else {
      console.error(`  ❌ FAIL: Expected "user_abc_123", got "${favoriteStore.userId}"\n`);
      testsFailed++;
    }
    
    // Test 5: init() rejects null userId
    console.log('Test 5: init() rejects null userId');
    favoriteStore.clear();
    const prevUserId = favoriteStore.userId;
    loadCallCount = 0;
    
    favoriteStore.init(null);
    
    if (favoriteStore.userId === null && loadCallCount === 0) {
      console.log('  ✅ PASS: null userId rejected, load() not called\n');
      testsPassed++;
    } else {
      console.error(`  ❌ FAIL: null userId should be rejected\n`);
      testsFailed++;
    }
    
    // Test 6: init() rejects undefined userId
    console.log('Test 6: init() rejects undefined userId');
    favoriteStore.clear();
    loadCallCount = 0;
    
    favoriteStore.init(undefined);
    
    if (favoriteStore.userId === null && loadCallCount === 0) {
      console.log('  ✅ PASS: undefined userId rejected, load() not called\n');
      testsPassed++;
    } else {
      console.error(`  ❌ FAIL: undefined userId should be rejected\n`);
      testsFailed++;
    }
    
    // Test 7: init() rejects empty string
    console.log('Test 7: init() rejects empty string userId');
    favoriteStore.clear();
    loadCallCount = 0;
    
    favoriteStore.init('');
    
    if (favoriteStore.userId === null && loadCallCount === 0) {
      console.log('  ✅ PASS: empty string rejected, load() not called\n');
      testsPassed++;
    } else {
      console.error(`  ❌ FAIL: empty string should be rejected\n`);
      testsFailed++;
    }
    
    // Test 8: Multiple init() calls update userId
    console.log('Test 8: Multiple init() calls update userId');
    favoriteStore.clear();
    loadCallCount = 0;
    
    favoriteStore.init(1111);
    const firstCallCount = loadCallCount;
    
    favoriteStore.init(2222);
    const secondCallCount = loadCallCount;
    
    if (favoriteStore.userId === '2222' && secondCallCount === 2) {
      console.log('  ✅ PASS: userId updated to "2222", load() called twice\n');
      testsPassed++;
    } else {
      console.error(`  ❌ FAIL: Expected userId "2222" and 2 load calls, got "${favoriteStore.userId}" and ${secondCallCount} calls\n`);
      testsFailed++;
    }
    
    // Test 9: init() with zero userId
    console.log('Test 9: init() handles zero as valid userId');
    favoriteStore.clear();
    loadCallCount = 0;
    
    favoriteStore.init(0);
    
    // Zero is falsy but should be treated as invalid
    if (favoriteStore.userId === null && loadCallCount === 0) {
      console.log('  ✅ PASS: Zero userId rejected (falsy value)\n');
      testsPassed++;
    } else {
      console.error(`  ❌ FAIL: Zero should be rejected as invalid userId\n`);
      testsFailed++;
    }
    
    // Test 10: init() logs correctly
    console.log('Test 10: init() provides proper logging');
    favoriteStore.clear();
    
    // Capture console output
    const originalLog = console.log;
    const originalError = console.error;
    let logMessages = [];
    let errorMessages = [];
    
    console.log = (...args) => {
      logMessages.push(args.join(' '));
      originalLog(...args);
    };
    
    console.error = (...args) => {
      errorMessages.push(args.join(' '));
      originalError(...args);
    };
    
    favoriteStore.init(5555);
    
    console.log = originalLog;
    console.error = originalError;
    
    const hasInitLog = logMessages.some(msg => msg.includes('FavoriteStore.init') && msg.includes('5555'));
    
    if (hasInitLog) {
      console.log('  ✅ PASS: Proper logging present\n');
      testsPassed++;
    } else {
      console.error('  ❌ FAIL: Expected init log message not found\n');
      testsFailed++;
    }
    
  } catch (error) {
    console.error('❌ Test suite failed with error:', error);
    testsFailed++;
  } finally {
    // Restore original state
    favoriteStore.load = originalLoad;
    favoriteStore.userId = originalUserId;
    favoriteStore.favorites = originalFavorites;
  }
  
  // Summary
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                    Test Summary                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`  ✅ Passed: ${testsPassed}`);
  console.log(`  ❌ Failed: ${testsFailed}`);
  console.log(`  📊 Total:  ${testsPassed + testsFailed}`);
  console.log(`  🎯 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%\n`);
  
  return testsFailed === 0;
}

/**
 * Test Suite: init() integration with load()
 */
async function testInitLoadIntegration() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║      init() and load() Integration Tests              ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  let testsPassed = 0;
  let testsFailed = 0;
  
  // Save original state
  const originalUserId = favoriteStore.userId;
  const originalFavorites = [...favoriteStore.favorites];
  const originalLoad = favoriteStore.load;
  
  try {
    // Test 1: init() passes userId to load()
    console.log('Test 1: init() makes userId available to load()');
    favoriteStore.clear();
    
    let loadReceivedUserId = null;
    favoriteStore.load = async function() {
      loadReceivedUserId = this.userId;
      console.log(`  → load() sees userId: ${loadReceivedUserId}`);
    };
    
    favoriteStore.init(7777);
    
    if (loadReceivedUserId === '7777') {
      console.log('  ✅ PASS: load() received correct userId\n');
      testsPassed++;
    } else {
      console.error(`  ❌ FAIL: load() should see userId "7777", saw "${loadReceivedUserId}"\n`);
      testsFailed++;
    }
    
    // Test 2: init() is called before load()
    console.log('Test 2: userId is set before load() executes');
    favoriteStore.clear();
    
    let userIdWhenLoadCalled = null;
    favoriteStore.load = async function() {
      userIdWhenLoadCalled = this.userId;
    };
    
    favoriteStore.init(8888);
    
    if (userIdWhenLoadCalled === '8888') {
      console.log('  ✅ PASS: userId was set before load() executed\n');
      testsPassed++;
    } else {
      console.error(`  ❌ FAIL: userId should be "8888" when load() runs, was "${userIdWhenLoadCalled}"\n`);
      testsFailed++;
    }
    
    // Test 3: load() is not called if userId is invalid
    console.log('Test 3: load() not called when userId is invalid');
    favoriteStore.clear();
    
    let loadCalledWithInvalid = false;
    favoriteStore.load = async function() {
      loadCalledWithInvalid = true;
    };
    
    favoriteStore.init(null);
    favoriteStore.init(undefined);
    favoriteStore.init('');
    
    if (!loadCalledWithInvalid) {
      console.log('  ✅ PASS: load() not called for invalid userIds\n');
      testsPassed++;
    } else {
      console.error('  ❌ FAIL: load() should not be called for invalid userIds\n');
      testsFailed++;
    }
    
  } catch (error) {
    console.error('❌ Test suite failed with error:', error);
    testsFailed++;
  } finally {
    // Restore original state
    favoriteStore.load = originalLoad;
    favoriteStore.userId = originalUserId;
    favoriteStore.favorites = originalFavorites;
  }
  
  // Summary
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                    Test Summary                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`  ✅ Passed: ${testsPassed}`);
  console.log(`  ❌ Failed: ${testsFailed}`);
  console.log(`  📊 Total:  ${testsPassed + testsFailed}`);
  console.log(`  🎯 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%\n`);
  
  return testsFailed === 0;
}

/**
 * Run all init() tests
 */
async function runAllInitTests() {
  console.log('\n🚀 Starting FavoriteStore init() Comprehensive Tests\n');
  
  const behaviorTestsPass = await testInitBehavior();
  const integrationTestsPass = await testInitLoadIntegration();
  
  const allTestsPass = behaviorTestsPass && integrationTestsPass;
  
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║              Final Test Results                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`  Behavior Tests:    ${behaviorTestsPass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Integration Tests: ${integrationTestsPass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Overall:           ${allTestsPass ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}\n`);
  
  return allTestsPass;
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllInitTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { testInitBehavior, testInitLoadIntegration, runAllInitTests };
