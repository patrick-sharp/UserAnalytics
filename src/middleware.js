/******************************************************************************
 * global variables
 ******************************************************************************/
const debugMode = true;         // print message to console (service worker)  
let defaultLastDomainObj = {    // default object if lastDomain key does not exist
  lastDomain: {
    domain: null,
    openedTime: Date.now(),
    lastInactiveTime: 0,
    totalInactiveTime: 0
  }
};

/*
  Chrome storage sync keys:

    key: lastDomain
    value: {
      domain: last visited domain,
      openedTime: time stamp of when the domain was opened,
      lastInactiveTime: timestamp of when chrome was inactive,
      totalInactiveTime: total time chrome was inactive
    }

    key: date
    value: {
      google.com: 125
      stackoverflow.com: 199
      ...
    }

    */

/******************************************************************************
 * Middleware Functions
 ******************************************************************************/
/*
 * sets the last domain key to the domain and current timestamp
 * @input: domain is a string that represents the host name in url
 */
function setLastDomain(domain) {
  chrome.storage.sync.get(['lastDomain'], function(data) {
    let lastDomainObj = { 
      lastDomain: {
        domain: domain,
        openedTime: Date.now(),
        lastInactiveTime: data['lastInactiveTime'],
        totalInactiveTime: data['totalInactiveTime'] ? data['totalInactiveTime'] : 0
      }
    };
    chrome.storage.sync.set(lastDomainObj, function() {
      if (debugMode) {
        console.log('Last domain set to: ' + domain);
      }
    });
  });
}


/* 
 * calculates the time and add to the domain spent
 * @input: domain is a string that represents the host name in url
 */ 
function domainChanged(domain) {
  chrome.storage.sync.get({['lastDomain']: defaultLastDomainObj}, function(data) {
    data = data.lastDomain;

    let lastDomain = data['domain'];
    if (domain == null || domain == lastDomain) {  // newtab or nothing changed!
      return;
    }
    if (!lastDomain) {                      // on startup (potential bug, what is default of domain when not set) 
      setLastDomain(domain);
      return;
    }

    // calculate time spent on tab
    const timeSpentOnDomain = ((Date.now() - data['openedTime'] - data['totalInactiveTime']) / 1000);
    const dateString = new Date(Date.now()).toLocaleDateString();

    // set default value to an empty object
    addElement(dateString, lastDomain, timeSpentOnDomain);

    // update the last domain
    setLastDomain(domain);
  });
}


/* 
 * called by invoke functions in chrome when domain is changed
 * @input: weburl is a string that represents the full url of a webside
 */
function handleUrlChange(webURL) {
  if (webURL == "") {   // new Tab
    return;
  }
  const url = new URL(webURL);
  domainChanged(url.hostname);
}


/******************************************************************************
 * Access Functions for frontend
 ******************************************************************************/
/*
 * clean and reset last usage
 */
function cleanUsage() {
  chrome.storage.sync.set(defaultLastDomainObj, function() {});
    if (debugMode) {
      chrome.storage.sync.get(['lastDomain'], function(data) {
        console.log('LastDomain key reset');
        console.log(data);
      });
  }
}

/*
 * clean out chrome storage entirely
 */
function clearChromeStorage() {
  chrome.storage.sync.clear(function () {
    console.log('cleared chrome storage');
  });
}


/*
 * Get domain:time match for a given day
 * @input: date is a formatted string in the form "month/day/year"(i.e. 4/30/2021).
 * @return: a promise that includes an object(i.e. {google.com: 123}), the object might be empty
 */
async function getDomainsForDay(date) {
  // make the chrome storage call synchronous
  console.log(date);
  var p = new Promise(function(resolve, reject){
    chrome.storage.sync.get([date], function(data) {
      if (data[date] === undefined) {
        data = {};
      } else {
        data = data[date];
      }
      resolve(data);
    });
  });
  return await p;
}

/*
 * Get category:[domains] from storage
 */
async function getCategories() {
  var p = new Promise(function(resolve, reject){
    chrome.storage.sync.get(["category"], function(data) {
      if (data["category"]) {
        data = {};
      } else {
        data = data["category"];
      }
      resolve(data);
    });
  })
  return await p;
}

async function getCategoryList() {
  var p = new Promise(function(resolve, reject) {
    return chrome.storage.sync.get(["category"], function (data) {
      resolve(JSON.parse(JSON.stringify(data))['category']);
    })
  });
  return await p; 
}

async function getCategoryKeys() {
  return getCategoryList().then( data => {return Object.keys(data)} );
}

function addLinkToCategory(category, link) {
  chrome.storage.sync.get(["category"], function(data) {
    var list = data['category'][category]
    console.log(list);
    if (list.indexOf(link) === -1) {
      list.push(link);
      chrome.storage.sync.set(data);
      if (debugMode) {
        console.log(link + " is saved to " + category);
      }
    }
  })
}

/******************************************************************************
 * Util functions (can be used for testing, use at your own risks)
 ******************************************************************************/
/*
 * Add elements to map. If already exists, append time
 */
function addElement(date, domain, seconds) {
  chrome.storage.sync.get([date], function(data) {
    if (data[date] === undefined) {
      data[date] = {};
    }
    data = data[date];
    if (data[domain] === undefined) {
      data[domain] = 0;
    }
    data[domain] = data[domain] + seconds;
    let dataObj = {};
    dataObj[date] = data;
    chrome.storage.sync.set(dataObj, function() {
      if (debugMode) {
        console.log('Added: ' + domain + "(" + seconds + "s)");
        console.log(dataObj);
      }
    });
  });
}

/*
 * Remove elements from the map
 */
function removeElement(date, domain) {
  chrome.storage.sync.get([date], function(data) {
    if (data[date] === undefined) {
      return;
    }
    data = data[date];
    if (data[domain] === undefined) {
      return;
    }
    delete data[domain];
    let dataObj = {};
    dataObj[date] = data;

    chrome.storage.sync.set(dataObj, function() {
      if (debugMode) {
        console.log('Deleted: ' + domain);
        console.log(dataObj);
      }
    });
  });
}


/*
 * Remove date from the map
 */
function removeDate(date) {
  chrome.storage.sync.remove(date, function(data) {
    console.log('Deleted: ' + date);
    console.log(data);
  });
}


/*
 * Get a copy of the map
 */
async function getMap() {
  // make the chrome storage call synchronous
  var p = new Promise(function(resolve, reject){
    chrome.storage.sync.get(null, function(data) {
      resolve(data);
    });
  });
  return await p;
}

// So node can import, but the file doesn't throw error when imported with importScripts in background.js
if (typeof exports !== 'undefined') {
  exports.setLastDomain = setLastDomain;
  exports.domainChanged = domainChanged;
  exports.cleanUsage = cleanUsage;
  exports.clearChromeStorage = clearChromeStorage;
  exports.getDomainsForDay = getDomainsForDay;
  exports.getTimeForDay = getTimeForDay;
  exports.getTimeForWeek = getTimeForWeek;
  exports.addElement = addElement;
  exports.removeElement = removeElement;
  exports.removeDate = removeDate;
  exports.getMap = getMap;
  exports.handleUrlChange = handleUrlChange;
}

// create a mock of the chrome API that works similarly to the real one so we can test it.
// If we're running these tests with node, chrome will be undefined. That means we can 
// define a mock api that mimics the function of the parts of the chrome API we use.
if (typeof chrome === 'undefined') {
  // this serves as a mock of the key-value storage of chrome's localstorage
  var TESTING_localStorage = {};
  var chrome = {
    // the only methods we call are chrome.storage.sync.get, and chrome.storage.sync.set.
    // We implement mocks of those functions here.
    storage: {
      sync: {
        set: function(arg, callback) {
          if (typeof arg === 'object') {
            const key = Object.keys(arg)[0]
            TESTING_localStorage[key] = arg[key];
          } else {
            throw 'Error: arg is not object';
          }
          callback();
        },
        get: function(arg, callback) {
          if (Array.isArray(arg)) {
            const key = arg[0];
            const result = TESTING_localStorage[key] === undefined ? {} : TESTING_localStorage[key];
            callback(result);
          // TODO: implement object arg for this function
          // } else if (typeof arg === 'object') {
          //   const key = Object.keys
          } else {
            throw 'Error: arg is not array or object';
          }
        }
      }
    },
  }
  exports.chrome = chrome;
  exports.TESTING_localStorage = TESTING_localStorage;
}