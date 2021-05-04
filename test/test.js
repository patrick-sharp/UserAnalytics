const { chrome, TESTING_localStorage, setLastDomain } = require('../src/middleware.js');

// Every function in this array is a test.
// If the test passes, the function returns true.
// If the test fails, the function returns false.
const testFunctions = [
  function test1() {
    setLastDomain('google.com');
    return (
      Object.keys(TESTING_localStorage).includes('lastDomain')
      && TESTING_localStorage['lastDomain'].domain === 'google.com'
      && TESTING_localStorage['lastDomain'].openedTime <= Date.now()
    );
  },
  function test2() {
    setLastDomain('bing.com');
    return (
      Object.keys(TESTING_localStorage).includes('lastDomain')
      && TESTING_localStorage['lastDomain'].domain === 'bing.com'
      && TESTING_localStorage['lastDomain'].openedTime <= Date.now()
    );
  },
];

// Run all the tests and print a message about whether they passed or failed.
// prints one line for each test, plus a line detailing how many tests were run
// and how many passed.
// If a test fails with an exception, print the exception on a new line.
numTestsPassed = 0;
for (let i = 0; i < testFunctions.length; i++) {
  let message = "";
  try {
    if (testFunctions[i]()) {
      numTestsPassed++;
      message = `Test ${i} passed`;
    } else {
      message = `Test ${i} failed`;
    }
  } catch(error) {
    message = `Test ${i} failed with exception:\n${error}`;
  }
  console.log(message);
}
console.log(`${numTestsPassed}/${testFunctions.length} tests passed`);

if (numTestsPassed < testFunctions.length) {
  throw 'One or more tests failed, see program output for more information';
}