const testFunctions = [
  // Test if chart dependencies exist
  function test1() {
    return Chart !== undefined;
  },
  // Test if main_stats exists
  function test2() {
    return document.getElementById("main_stats") !== null;
  },
  function test3() {
    return document.getElementById("display") !== null;
  },
  function test4() {
    return document.getElementById("left_container") !== null;
  },
  function test5() {
    return document.getElementById("right_container") !== null;
  },
  function test6() {
    const chart = document.getElementById("polarChart");
    return chart.tagName === "CANVAS";
  },
];

// Run all the tests and print a message about whether they passed or failed.
// prints one line for each test, plus a line detailing how many tests were run
// and how many passed.
// If a test fails with an exception, print the exception on a new line.
function runTests() {
  numTestsPassed = 0;
  for (let i = 0; i < testFunctions.length; i++) {
    let message = "";
    try {
      if (testFunctions[i]()) {
        numTestsPassed++;
        message = `Test ${i + 1} passed`;
      } else {
        message = `Test ${i + 1} failed`;
        console.log(message);
      }
    } catch (error) {
      message = `Test ${i + 1} failed with exception:\n${error}`;
    }
    console.log(message);
  }
  console.log(`${numTestsPassed}/${testFunctions.length} tests passed`);

  if (numTestsPassed < testFunctions.length) {
    alert("One or more tests did not pass. See the console for details.");
  }
}

const doRunTests = false;
if (doRunTests) {
  runTests();
}
