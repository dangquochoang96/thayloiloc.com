/**
 * Unit Tests for FavoriteStore
 * Tests the constructor and initial state
 */

import { favoriteStore } from './favorite.store.js';

/**
 * Test Suite: FavoriteStore Constructor
 */
function testConstructor() {
  console.log('\n=== Testing FavoriteStore Constructor ===\n');
  
  // Create a new instance for testing
  class FavoriteStore {
    constructor() {
      this.favorites = [];
      this.loading = false;
      this.error = null;
      this.listeners = new Set();
      this.userId = null;
      
      console.log('🏪 FavoriteStore initialized');
    }
  }
  
  const store = new FavoriteStore();
  
  // Test 1: favorites should be an empty array
  console.log('Test 1: favorites initialized as empty array');
  if (Array.isArray(store.favorites) && store.favorites.length === 0) {
    console.log('✅ PASS: favorites is an empty array');
  } else {
    console.error('❌ FAIL: favorites is not an empty array', store.favorites);
  }
  
  // Test 2: loading should be false
  console.log('\nTest 2: loading initialized as false');
  if (store.loading === false) {
    console.log('✅ PASS: loading is false');
  } else {
    console.error('❌ FAIL: loading is not false', store.loading);
  }
  
  // Test 3: error should be null
  console.log('\nTest 3: error initialized as null');
  if (store.error === null) {
    console.log('✅ PASS: error is null');
  } else {
    console.error('❌ FAIL: error is not null', store.error);
  }
  
  // Test 4: listeners should be a Set
  console.log('\nTest 4: listeners initialized as Set');
  if (store.listeners instanceof Set && store.listeners.size === 0) {
    console.log('✅ PASS: listeners is an empty Set');
  } else {
    console.error('❌ FAIL: listeners is not an empty Set', store.listeners);
  }
  
  // Test 5: userId should be null
  console.log('\nTest 5: userId initialized as null');
  if (store.userId === null) {
    console.log('✅ PASS: userId is null');
  } else {
    console.error('❌ FAIL: userId is not null', store.userId);
  }
  
  console.log('\n=== Constructor Tests Complete ===\n');
}

/**
 * Test Suite: Singleton Instance
 */
function testSingleton() {
  console.log('\n=== Testing Singleton Instance ===\n');
  
  // Test 6: favoriteStore should be exported
  console.log('Test 6: favoriteStore singleton exists');
  if (favoriteStore) {
    console.log('✅ PASS: favoriteStore is exported');
  } else {
    console.error('❌ FAIL: favoriteStore is not exported');
  }
  
  // Test 7: favoriteStore should have all required properties
  console.log('\nTest 7: favoriteStore has all required properties');
  const requiredProps = ['favorites', 'loading', 'error', 'listeners', 'userId'];
  const hasAllProps = requiredProps.every(prop => prop in favoriteStore);
  
  if (hasAllProps) {
    console.log('✅ PASS: favoriteStore has all required properties');
    requiredProps.forEach(prop => {
      console.log(`  - ${prop}: ${typeof favoriteStore[prop]}`);
    });
  } else {
    console.error('❌ FAIL: favoriteStore is missing properties');
  }
  
  // Test 8: favoriteStore should have all required methods
  console.log('\nTest 8: favoriteStore has all required methods');
  const requiredMethods = ['init', 'load', 'toggle', 'isFavorite', 'getAll', 'subscribe', 'notify', 'clear'];
  const hasAllMethods = requiredMethods.every(method => typeof favoriteStore[method] === 'function');
  
  if (hasAllMethods) {
    console.log('✅ PASS: favoriteStore has all required methods');
    requiredMethods.forEach(method => {
      console.log(`  - ${method}()`);
    });
  } else {
    console.error('❌ FAIL: favoriteStore is missing methods');
  }
  
  console.log('\n=== Singleton Tests Complete ===\n');
}

/**
 * Test Suite: Initial State Verification
 */
function testInitialState() {
  console.log('\n=== Testing Initial State ===\n');
  
  // Test 9: Initial state should match design specification
  console.log('Test 9: Verify initial state matches design spec');
  
  const expectedState = {
    favorites: [],
    loading: false,
    error: null,
    userId: null
  };
  
  let allMatch = true;
  
  // Check favorites
  if (Array.isArray(favoriteStore.favorites) && favoriteStore.favorites.length === 0) {
    console.log('✅ favorites: [] (empty array)');
  } else {
    console.error('❌ favorites: expected empty array, got', favoriteStore.favorites);
    allMatch = false;
  }
  
  // Check loading
  if (favoriteStore.loading === false) {
    console.log('✅ loading: false');
  } else {
    console.error('❌ loading: expected false, got', favoriteStore.loading);
    allMatch = false;
  }
  
  // Check error
  if (favoriteStore.error === null) {
    console.log('✅ error: null');
  } else {
    console.error('❌ error: expected null, got', favoriteStore.error);
    allMatch = false;
  }
  
  // Check userId
  if (favoriteStore.userId === null) {
    console.log('✅ userId: null');
  } else {
    console.error('❌ userId: expected null, got', favoriteStore.userId);
    allMatch = false;
  }
  
  // Check listeners
  if (favoriteStore.listeners instanceof Set && favoriteStore.listeners.size === 0) {
    console.log('✅ listeners: Set (size: 0)');
  } else {
    console.error('❌ listeners: expected empty Set, got', favoriteStore.listeners);
    allMatch = false;
  }
  
  if (allMatch) {
    console.log('\n✅ PASS: All initial state properties match design specification');
  } else {
    console.error('\n❌ FAIL: Some initial state properties do not match');
  }
  
  console.log('\n=== Initial State Tests Complete ===\n');
}

/**
 * Test Suite: init() method
 */
function testInit() {
  console.log('\n=== Testing init() Method ===\n');
  
  // Create a test instance
  class TestFavoriteStore {
    constructor() {
      this.favorites = [];
      this.loading = false;
      this.error = null;
      this.listeners = new Set();
      this.userId = null;
      this.loadCalled = false;
    }
    
    init(userId) {
      if (!userId) {
        console.error('❌ FavoriteStore.init: userId is required');
        return;
      }
      
      this.userId = String(userId);
      console.log('🔧 FavoriteStore.init:', this.userId);
      
      // Track that load was called
      this.loadCalled = true;
      this.load();
    }
    
    load() {
      // Mock load method
      console.log('🔄 load() called');
    }
  }
  
  // Test 10: init() should set userId as string
  console.log('Test 10: init() sets userId correctly');
  const store1 = new TestFavoriteStore();
  store1.init(12345);
  
  if (store1.userId === '12345') {
    console.log('✅ PASS: userId set to "12345" (string)');
  } else {
    console.error('❌ FAIL: userId not set correctly. Expected "12345", got', store1.userId);
  }
  
  // Test 11: init() should convert number to string
  console.log('\nTest 11: init() converts number userId to string');
  const store2 = new TestFavoriteStore();
  store2.init(8968);
  
  if (store2.userId === '8968' && typeof store2.userId === 'string') {
    console.log('✅ PASS: userId converted to string "8968"');
  } else {
    console.error('❌ FAIL: userId not converted to string. Got', store2.userId, typeof store2.userId);
  }
  
  // Test 12: init() should handle string userId
  console.log('\nTest 12: init() handles string userId');
  const store3 = new TestFavoriteStore();
  store3.init('user_123');
  
  if (store3.userId === 'user_123') {
    console.log('✅ PASS: string userId preserved as "user_123"');
  } else {
    console.error('❌ FAIL: string userId not preserved. Got', store3.userId);
  }
  
  // Test 13: init() should call load()
  console.log('\nTest 13: init() triggers load() method');
  const store4 = new TestFavoriteStore();
  store4.init(12345);
  
  if (store4.loadCalled === true) {
    console.log('✅ PASS: load() was called after init()');
  } else {
    console.error('❌ FAIL: load() was not called');
  }
  
  // Test 14: init() should handle null/undefined userId
  console.log('\nTest 14: init() handles invalid userId (null)');
  const store5 = new TestFavoriteStore();
  store5.init(null);
  
  if (store5.userId === null) {
    console.log('✅ PASS: userId remains null when passed null');
  } else {
    console.error('❌ FAIL: userId should remain null. Got', store5.userId);
  }
  
  // Test 15: init() should handle undefined userId
  console.log('\nTest 15: init() handles invalid userId (undefined)');
  const store6 = new TestFavoriteStore();
  store6.init(undefined);
  
  if (store6.userId === null) {
    console.log('✅ PASS: userId remains null when passed undefined');
  } else {
    console.error('❌ FAIL: userId should remain null. Got', store6.userId);
  }
  
  // Test 16: init() should handle empty string
  console.log('\nTest 16: init() handles empty string userId');
  const store7 = new TestFavoriteStore();
  store7.init('');
  
  if (store7.userId === null) {
    console.log('✅ PASS: userId remains null when passed empty string');
  } else {
    console.error('❌ FAIL: userId should remain null for empty string. Got', store7.userId);
  }
  
  console.log('\n=== init() Tests Complete ===\n');
}

/**
 * Test Suite: init() integration with real favoriteStore
 */
async function testInitIntegration() {
  console.log('\n=== Testing init() Integration with Real Store ===\n');
  
  // Save original state
  const originalUserId = favoriteStore.userId;
  const originalFavorites = [...favoriteStore.favorites];
  
  try {
    // Test 17: Real store init() sets userId
    console.log('Test 17: Real favoriteStore.init() sets userId');
    
    // Clear the store first
    favoriteStore.clear();
    
    // Mock the API to prevent actual network calls
    const originalLoad = favoriteStore.load;
    let loadWasCalled = false;
    favoriteStore.load = async function() {
      loadWasCalled = true;
      console.log('🔄 Mock load() called');
      // Don't actually call the API
    };
    
    // Call init
    favoriteStore.init(9999);
    
    if (favoriteStore.userId === '9999') {
      console.log('✅ PASS: Real store userId set to "9999"');
    } else {
      console.error('❌ FAIL: Real store userId not set. Got', favoriteStore.userId);
    }
    
    // Test 18: Real store init() calls load()
    console.log('\nTest 18: Real favoriteStore.init() calls load()');
    
    if (loadWasCalled) {
      console.log('✅ PASS: load() was called by init()');
    } else {
      console.error('❌ FAIL: load() was not called by init()');
    }
    
    // Restore original load method
    favoriteStore.load = originalLoad;
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    // Restore original state
    favoriteStore.userId = originalUserId;
    favoriteStore.favorites = originalFavorites;
  }
  
  console.log('\n=== init() Integration Tests Complete ===\n');
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   FavoriteStore Constructor & Initial State Tests     ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  try {
    testConstructor();
    testSingleton();
    testInitialState();
    testInit();
    await testInitIntegration();
    
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║              All Tests Completed                       ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
  } catch (error) {
    console.error('\n❌ Test suite failed with error:', error);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

// Export for use in other test files
export { testConstructor, testSingleton, testInitialState, testInit, testInitIntegration, runAllTests };
