/**
 * Test Runner for init() method tests
 */

import { runAllTests } from './src/services/favorite.store.test.js';

console.log('Starting FavoriteStore init() tests...\n');

runAllTests().then(() => {
  console.log('\nTests completed!');
}).catch(error => {
  console.error('\nTests failed:', error);
  process.exit(1);
});
