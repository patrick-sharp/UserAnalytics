// import {
//   setLastDomain 
// }
// from '../src/middleware.js';
const { setLastDomain } = require('../src/middleware.js');

// var assert = require('assert');
// describe('Array', function() {
//   describe('#indexOf()', function() {
//     it('should return -1 when the value is not present', function() {
//       setLastDomain('test.google.com');
//       assert.equal([1, 2, 3].indexOf(4), -1);
//     });
//   });
// });

// Every function in this array is a test.
// If the test passes, the function returns true.
// If the test fails, the function returns false.
const testFunctions = [
  function test1() {
    setLastDomain('google.com');
    return false;
  }
];

// Run all the tests and print a message about whether they passed or failed.
// prints one line for each test, plus a line detailing how many tests were run
// and how many passed.
numTestsPassed = 0;
for (let i = 0; i < testFunctions.length; i++) {
  if (testFunctions[i]()) {
    numTestsPassed++;
    console.log(`Test ${i} passed`);
  } else {
    console.log(`Test ${i} failed`);
  }
}
console.log(`${numTestsPassed}/${testFunctions.length} tests passed`);