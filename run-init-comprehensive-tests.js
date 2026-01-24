/**
 * Runner for comprehensive init() tests
 */

import { runAllInitTests } from './src/services/favorite.store.init.test.js';

runAllInitTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
