const testFunctions = [
  // Test if chart dependencies exist
  function test1() {
    return (Chart !== undefined);
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
  alert("One or more tests did not pass. See the console for details.")
}