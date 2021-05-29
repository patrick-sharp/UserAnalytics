const { chrome, TESTING_localStorage, setLastDomain, domainChanged, clearChromeStorage } = require('../src/middleware.js');

// Every function in this array is a test.
// If the test passes, the function returns true.
// If the test fails, the function returns false.
const testFunctions = [
  // setLastDomain
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
  function test3() {
    setLastDomain('google.com');
    setLastDomain('bing.com');
    setLastDomain('facebook.com');
    setLastDomain('example.com');
    return (
      Object.keys(TESTING_localStorage).includes('lastDomain')
      && TESTING_localStorage['lastDomain'].domain === 'example.com'
      && TESTING_localStorage['lastDomain'].openedTime <= Date.now()
    );
  },
  // // domainChanged
  async function test4() {
    clearChromeStorage();
    setLastDomain('google.com');
    await new Promise(r => setTimeout(r, 500));
    domainChanged('facebook.com');
    const dateString = new Date(Date.now()).toLocaleDateString();
    return (
      TESTING_localStorage.hasOwnProperty(dateString)
      && checkDomainInStorage(TESTING_localStorage, 'google.com', 500, dateString)
    );
  },
  async function test5() {
    const time = 200;
    clearChromeStorage();
    setLastDomain('google.com');
    await new Promise(r => setTimeout(r, time));
    domainChanged('example.com');
    dateString = getDateString();
    let didTestPass = TESTING_localStorage.hasOwnProperty(dateString)
    didTestPass = didTestPass && checkDomainInStorage(TESTING_localStorage, 'google.com', time, dateString);
    await new Promise(r => setTimeout(r, time));
    domainChanged('facebook.com');
    didTestPass = didTestPass && checkDomainInStorage(TESTING_localStorage, 'example.com', time, dateString);
    await new Promise(r => setTimeout(r, time));
    domainChanged('bing.com');
    didTestPass = didTestPass && checkDomainInStorage(TESTING_localStorage, 'facebook.com', time, dateString)
                              && TESTING_localStorage['lastDomain'].domain === 'bing.com';
    return didTestPass;
  },
  // async function test6() {
  //   const domains = ['facebook.com', 'bing.com', 'example.com', 'reddit.com', 'youtube.com', 'skillshare.com']
  //   // const domains = ['google.com', 'facebook.com', 'bing.com', 'example.com'];
  //   let time = 40;
  //   clearChromeStorage();
  //   setLastDomain('google.com');
  //   // console.log(TESTING_localStorage);
  //   for (let domain of domains) {
  //     domainChanged(domain);
  //     time += 10;
  //     await new Promise(r => setTimeout(r, time));
  //     console.log('ITER', TESTING_localStorage)
  //   }
  //   const dateString = getDateString();
  //   console.log(TESTING_localStorage);
  //   let didTestPass = TESTING_localStorage.hasOwnProperty(dateString);
  //   time = 40;
  //   for (let domain of domains) {
  //     time += 10;
  //     didTestPass = didTestPass && checkDomainInStorage(TESTING_localStorage, domain, time, dateString);
  //   }
  //   didTestPass = didTestPass && TESTING_localStorage.lastDomain.domain === 'skillshare.com';
  //   return didTestPass;
  // }
  // handleUrlChange
  // cleanUsage
  // clearChromeStorage
  // getDomainsForDay
  // getTimeForDay
  // getTimeForWeek
  // addElement
  // removeElement
  // removeDate
  // getMap
];

function getDateString() {
  return new Date(Date.now()).toLocaleDateString();
}

// domain is a string
// time is an integer number of milliseconds.
// This checks whether or not the given domain is in storage
function checkDomainInStorage(TESTING_localStorage, domain, time, dateString) {
  return (
    typeof TESTING_localStorage[dateString] === 'object'
    && TESTING_localStorage[dateString][domain] !== undefined
    && TESTING_localStorage[dateString][domain] >= time / 1000
    && TESTING_localStorage[dateString][domain] <= (time + 300) / 1000
  )
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
        message = `Test ${i+1} passed`;
      } else {
        message = `Test ${i+1} failed`;
      }
    } catch(error) {
      message = `Test ${i+1} failed with exception:\n${error}`;
    }
    console.log(message);
  }
  const fractionOfTestsPassed = `${numTestsPassed}/${testFunctions.length} tests passed`;
  const equals = '='.repeat(fractionOfTestsPassed.length);
  console.log('\n' + equals + '\n' + fractionOfTestsPassed + '\n' + equals + '\n');

  return numTestsPassed == testFunctions.length
}

runTests().then(res => {
  if (!res) {
    throw 'One or more tests failed, see program output for more information';
  }
})


