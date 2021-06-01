const {
  TESTING_localStorage,
  setLastDomain,
  domainChanged,
  clearChromeStorage,
  handleUrlChange,
  cleanUsage,
  getDomainsForDay,
  getCategoryList,
  getCategoryKeys,
  addLinkToCategory,
} = require("../src/js/middleware.js");

const categories = require("../src/category.json");

// Every function in this array is a test.
// If the test passes, the function returns true.
// If the test fails, the function returns false.
const testFunctions = [
  // setLastDomain
  function test1() {
    setLastDomain("google.com");
    return (
      Object.keys(TESTING_localStorage).includes("lastDomain") &&
      TESTING_localStorage["lastDomain"].domain === "google.com" &&
      TESTING_localStorage["lastDomain"].openedTime <= Date.now()
    );
  },
  function test2() {
    setLastDomain("bing.com");
    return (
      Object.keys(TESTING_localStorage).includes("lastDomain") &&
      TESTING_localStorage["lastDomain"].domain === "bing.com" &&
      TESTING_localStorage["lastDomain"].openedTime <= Date.now()
    );
  },
  function test3() {
    setLastDomain("google.com");
    setLastDomain("bing.com");
    setLastDomain("facebook.com");
    setLastDomain("example.com");
    return (
      Object.keys(TESTING_localStorage).includes("lastDomain") &&
      TESTING_localStorage["lastDomain"].domain === "example.com" &&
      TESTING_localStorage["lastDomain"].openedTime <= Date.now()
    );
  },
  // clearChromeStorage and loadDefaultCategory
  async function test4() {
    clearChromeStorage();
    await new Promise((r) => setTimeout(r, 50));
    return (
      TESTING_localStorage.category &&
      Array.isArray(TESTING_localStorage.category.Entertainment) &&
      Array.isArray(TESTING_localStorage.category.Productivity) &&
      Array.isArray(TESTING_localStorage.category.Reading) &&
      Array.isArray(TESTING_localStorage.category.Social) &&
      Array.isArray(TESTING_localStorage.category.Uncategorized)
    );
  },
  // domainChanged
  async function test5() {
    clearChromeStorage();
    setLastDomain("google.com");
    await new Promise((r) => setTimeout(r, 500));
    domainChanged("facebook.com");
    const dateString = getDateString();
    return (
      TESTING_localStorage.hasOwnProperty(dateString) &&
      checkDomainInStorage(TESTING_localStorage, "google.com", 500, dateString)
    );
  },
  async function test6() {
    const time = 200;
    clearChromeStorage();
    setLastDomain("google.com");
    await new Promise((r) => setTimeout(r, time));
    domainChanged("example.com");
    dateString = getDateString();
    let didTestPass = TESTING_localStorage.hasOwnProperty(dateString);
    didTestPass =
      didTestPass &&
      checkDomainInStorage(
        TESTING_localStorage,
        "google.com",
        time,
        dateString
      );
    await new Promise((r) => setTimeout(r, time));
    domainChanged("facebook.com");
    didTestPass =
      didTestPass &&
      checkDomainInStorage(
        TESTING_localStorage,
        "example.com",
        time,
        dateString
      );
    await new Promise((r) => setTimeout(r, time));
    domainChanged("bing.com");
    didTestPass =
      didTestPass &&
      checkDomainInStorage(
        TESTING_localStorage,
        "facebook.com",
        time,
        dateString
      ) &&
      TESTING_localStorage["lastDomain"].domain === "bing.com";
    return didTestPass;
  },
  // handleUrlChange
  async function test7() {
    clearChromeStorage();
    handleUrlChange("");
    return Object.keys(TESTING_localStorage).length === 0;
  },
  async function test8() {
    clearChromeStorage();
    setLastDomain("google.com");
    handleUrlChange("https://www.facebook.com");
    const dateString = getDateString();
    return (
      TESTING_localStorage.hasOwnProperty(dateString) &&
      checkDomainInStorage(TESTING_localStorage, "google.com", 0, dateString)
    );
  },
  // cleanUsage
  async function test9() {
    cleanUsage();
    const ld = TESTING_localStorage.lastDomain;
    return (
      ld.domain === null &&
      ld.lastInactiveTime === 0 &&
      ld.totalInactiveTime === 0
    );
  },
  // getDomainsForDay
  async function test10() {
    clearChromeStorage();
    setLastDomain("google.com");
    handleUrlChange("https://www.twitter.com");
    handleUrlChange("https://www.example.com");
    const dateString = getDateString();
    const domains = await getDomainsForDay(dateString);
    return (
      domains["google.com"] !== undefined &&
      domains["twitter.com"] !== undefined
    );
  },
  // getCategoryList
  async function test11() {
    const categoryList = await getCategoryList();
    for (let key of Object.keys(categories)) {
      if (!Array.isArray(categoryList[key])) {
        return false;
      }
      for (let website of categories[key]) {
        if (!categoryList[key].includes(website)) {
          return false;
        }
      }
    }
    return true;
  },
  // getCategoryKeys
  async function test12() {
    const expectedKeys = [
      'Entertainment',
      'Social',
      'Reading',
      'Productivity',
      'Uncategorized'
    ];
    const actualKeys = await getCategoryKeys();
    if (!Array.isArray(actualKeys)) {
      return false;
    }
    for (let category of expectedKeys) {
      if (!actualKeys.includes(category)) {
        return false;
      }
    }
    return true;
  },
  // cleanUsage
  async function test13() {
    cleanUsage();
    return (
      TESTING_localStorage.lastDomain
      && TESTING_localStorage.lastDomain.domain === null
      && typeof TESTING_localStorage.lastDomain.openedTime === 'number'
      && TESTING_localStorage.lastDomain.lastInactiveTime === 0
      && TESTING_localStorage.lastDomain.totalInactiveTime === 0
    )
  },
  // addLinkToCategory
  async function test14() {
    clearChromeStorage();
    await new Promise((r) => setTimeout(r, 50));
    addLinkToCategory('Entertainment', 'getpocket.com');
    const categoryList = await getCategoryList();
    return categoryList.Entertainment.includes('getpocket.com');
  }
];

function getDateString() {
  return new Date(Date.now()).toLocaleDateString();
}

// domain is a string
// time is an integer number of milliseconds.
// This checks whether or not the given domain is in storage
function checkDomainInStorage(TESTING_localStorage, domain, time, dateString) {
  return (
    typeof TESTING_localStorage[dateString] === "object" &&
    TESTING_localStorage[dateString][domain] !== undefined &&
    TESTING_localStorage[dateString][domain] >= time / 1000 &&
    TESTING_localStorage[dateString][domain] <= (time + 300) / 1000
  );
}

// Run all the tests and print a message about whether they passed or failed.
// prints one line for each test, plus a line detailing how many tests were run
// and how many passed.
// If a test fails with an exception, print the exception on a new line.
async function runTests() {
  numTestsPassed = 0;
  for (let i = 0; i < testFunctions.length; i++) {
    let message = "";
    try {
      const testResult = await testFunctions[i]();
      if (testResult) {
        numTestsPassed++;
        message = `Test ${i + 1} passed`;
      } else {
        message = `Test ${i + 1} failed`;
      }
    } catch (error) {
      message = `Test ${i + 1} failed with exception:\n${error}`;
    }
    console.log(message);
  }
  const fractionOfTestsPassed = `${numTestsPassed}/${testFunctions.length} tests passed`;
  const equals = "=".repeat(fractionOfTestsPassed.length);
  console.log(
    "\n" + equals + "\n" + fractionOfTestsPassed + "\n" + equals + "\n"
  );

  return numTestsPassed == testFunctions.length;
}

runTests().then((res) => {
  if (!res) {
    // throw "One or more tests failed, see program output for more information";
    // console.log("One or more tests failed, see program output for more information\n");
    process.exit(1);
  }
});
