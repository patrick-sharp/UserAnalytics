// This is for testing with CI.
// We can't test fetch because fetch isn't available in node.
// the process variable is only defined in node
try {
  if (process === undefined) {
    throw "Not in node";
  }
  global.psl = require("../psl.min.js");
  global.categories = require("../category.json");

  global.FileReader = class FileReader {
    readAsDataURL(file) {
      return file;
    }
  };
  global.fetch = (arg) => {
    return new Promise((resolve, reject) => {
      let jsonData = '["PLACEHOLDER_JSON"]';
      if (arg.includes("category.json")) {
        jsonData = categories;
      }
      resolve({
        blob: () => "PLACEHOLDER_BLOB",
        json: () =>
          new Promise((resolve, reject) => {
            resolve(jsonData);
          }),
      });
    });
  };
  console.log("Mock Chrome environment for Node initialized.");
} catch (e) {}

try {
  importScripts("../psl.min.js");
} catch (e) {}

/******************************************************************************
 * global variables
 ******************************************************************************/
const debugMode = false; // print message to console (service worker)
let defaultLastDomainObj = {
  // default object if lastDomain key does not exist
  lastDomain: {
    domain: null,
    openedTime: Date.now(),
    lastInactiveTime: 0,
    totalInactiveTime: 0,
  },
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

    key: whitelist
    value: {
      [google.com, youtube.com, ...]
    }

    key: doTrack
    value: {
      boolean
    }

*/

/******************************************************************************
 * Middleware Functions
 ******************************************************************************/

/**
 * Sets the last domain key to the domain and current timestamp
 *
 * @param {string} domain a string that represents the host name in url
 */
function setLastDomain(domain) {
  chrome.storage.sync.get(["lastDomain"], function (data) {
    data = data.lastDomain;

    let lastDomainObj = {
      lastDomain: {
        domain: domain,
        openedTime: Date.now(),
        lastInactiveTime: 0,
        totalInactiveTime: 0,
      },
    };
    chrome.storage.sync.set(lastDomainObj, function () {
      if (debugMode) {
        console.log("Last domain set to: " + domain);
      }
    });
  });
}

/**
 * Calculates the time and add to the domain spent
 *
 * @param {string} domain host name in url
 */
function domainChanged(domain) {
  chrome.storage.sync.get(
    { ["lastDomain"]: defaultLastDomainObj },
    function (data) {
      data = data.lastDomain;

      let lastDomain = data["domain"];
      if (domain == null || domain == lastDomain) {
        // newtab or nothing changed!
        return;
      }
      if (!lastDomain) {
        // on startup (potential bug, what is default of domain when not set)
        setLastDomain(domain);
        return;
      }

      // calculate time spent on tab
      const timeSpentOnDomain =
        (Date.now() - data["openedTime"] - data["totalInactiveTime"]) / 1000;
      const dateString = new Date(Date.now()).toLocaleDateString();

      // add data to the map
      addElement(dateString, lastDomain, timeSpentOnDomain);

      // check if the current domain is in the whitelist
      chrome.storage.sync.get(["whitelist"], function (data) {
        var list = data["whitelist"];
        if (list === undefined) {
          list = [];
        }
        if (list.includes(domain)) {
          if (debugMode) {
            console.log("White list url found: " + domain);
          }
          // reset LastDomain object
          cleanUsage();
        } else {
          // update the last domain
          setLastDomain(domain);
        }
      });
    }
  );
}

/**
 * Called by invoke functions in chrome when domain is changed
 *
 * @param {string} webURL the full url of a website
 */
function handleUrlChange(webURL) {
  if (webURL == "") {
    // new Tab
    return;
  }

  //do not track
  chrome.storage.sync.get(["doTrack"], function (data) {
    if (data["doTrack"] === undefined) {
      setDoTrack(true);
    } else if (data["doTrack"] === false) {
      if (debugMode) {
        console.log("doTrack is turned off.");
      }
      return;
    }
    const url = new URL(webURL);
    let domain = psl.get(url.hostname);
    domainChanged(domain);
  });
}

/******************************************************************************
 * Access Functions for frontend
 ******************************************************************************/

/**
 * clean and reset last usage
 */
function cleanUsage() {
  chrome.storage.sync.set(defaultLastDomainObj, function () {});
  if (debugMode) {
    chrome.storage.sync.get(["lastDomain"], function (data) {
      console.log("LastDomain key reset");
      console.log(data);
    });
  }
}

/**
 * clean out chrome storage entirely
 */
function clearChromeStorage() {
  chrome.storage.sync.clear(function () {
    if (debugMode) {
      console.log("cleared chrome storage");
    }
  });
  // restore deleted categories
  loadDefaultCategory();
}

/**
 * Get `domain:time` match for a given day
 *
 * @param date a formatted string in the form "MM/DD/YYYY"(i.e. 4/30/2021).
 * @returns a promise that includes an object(i.e. {google.com: 123}), the object might be empty
 */
async function getDomainsForDay(date) {
  // make the chrome storage call synchronous
  var p = new Promise(function (resolve, reject) {
    chrome.storage.sync.get([date], function (data) {
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

/**
 * Get category:[domains] from storage
 * @returns a promise that includes an object(i.e. {"Entertainment": [domain1, domain2]}), the object might be empty
 */
async function getCategoryList() {
  var p = new Promise(function (resolve, reject) {
    return chrome.storage.sync.get(["category"], function (data) {
      resolve(JSON.parse(JSON.stringify(data))["category"]);
    });
  });
  return await p;
}

/**
 * Retrieve Category names from Chrome storage
 *
 * @see getCategoryList
 * @returns a list of keys that represents defined Categories
 */
async function getCategoryKeys() {
  return getCategoryList().then((data) => {
    return Object.keys(data);
  });
}

/**
 * Add user-selected link to specific category to Chrome storage
 *
 * @param {string} category user-selected category
 * @param {string} link domain URL that will added to the `category`
 */
function addLinkToCategory(category, link) {
  chrome.storage.sync.get(["category"], function (data) {
    var list = data["category"][category];
    if (list.indexOf(link) === -1) {
      list.push(link);
      chrome.storage.sync.set(data);
      if (debugMode) {
        console.log(link + " is saved to " + category);
      }
    }
  });
}

/**
 * Return a Promise of a copy of the whiteList from Chrome storage
 *
 * @returns a copy of the whitelist
 */
async function getWhitelist() {
  var p = new Promise(function (resolve, reject) {
    chrome.storage.sync.get(["whitelist"], function (data) {
      var list = data["whitelist"];
      if (list === undefined) {
        list = [];
      }
      resolve(list);
    });
  });
  return await p;
}

/**
 * Update the whiteList (domains: list)
 * @param {string} domains the domain URL to be added
 */
function updateWhitelist(domains) {
  whitelistObj = {};
  whitelistObj["whitelist"] = domains;
  chrome.storage.sync.set(whitelistObj, function () {
    if (debugMode) {
      console.log("Update white list: " + domains);
      console.log(whitelistObj);
    }
  });
}

function updateCategories(categories) {
  categoriesObj = {};
  categoriesObj["category"] = categories;
  chrome.storage.sync.set(categoriesObj, function () {
    if (debugMode) {
      console.log("Update categories: ");
      console.log(categoriesObj);
    }
  });
}

/**
 * Flip doTrack variable
 */
function toggleTracking() {
  chrome.storage.sync.get(["doTrack"], function (data) {
    var val = data["doTrack"];
    if (val === undefined) {
      setDoTrack(true);
      val = true;
    }
    setDoTrack(!val);
    if (debugMode) {
      console.log("ToggleTracking: " + val + " => " + !val);
    }
  });
}

/**
 * Get doTrack status (default will be set to true)
 */
async function getTrackingStatus() {
  var p = new Promise(function (resolve, reject) {
    chrome.storage.sync.get(["doTrack"], function (data) {
      var val = data["doTrack"];
      if (val === undefined) {
        setDoTrack(true);
        val = true;
      }
      resolve(val);
    });
  });
  return await p;
}

/**
 * Set value for doTrack
 * @param {boolean} track the status for doTrack
 */
function setDoTrack(track) {
  let doTrackObj = {};
  doTrackObj["doTrack"] = track;
  if (track === false) {
    cleanUsage(); // reset LastDomain object
  }
  chrome.storage.sync.set(doTrackObj, function () {
    if (debugMode) {
      console.log("Setting: doTrack is set to " + track);
    }
  });
}

/**
 * Call when the user is not in chrome (chrome is not in focus)
 */
function chromeInactive() {
  // set lastInactiveTime to now
  chrome.storage.sync.get(["lastDomain"], function (data) {
    data = data.lastDomain;
    // check if lastInactiveTime was already set
    if (!data || data["lastInactiveTime"] > 0) {
      return;
    }
    let lastDomainObj = {
      lastDomain: {
        domain: data["domain"],
        openedTime: data["openedTime"],
        lastInactiveTime: Date.now(),
        totalInactiveTime: data["totalInactiveTime"]
        ? data["totalInactiveTime"]
        : 0,
      },
    };
    chrome.storage.sync.set(lastDomainObj, function () {
      if (debugMode) {
        console.log("chrome inactive, lastActiveTime set");
      }
    });
  });
}

/**
 * Call when the user is in chrome
 */
function chromeActive() {
  // update totalInactiveTime
  chrome.storage.sync.get(["lastDomain"], function (data) {
    data = data.lastDomain;
    if (!data || !data["lastInactiveTime"] || data["lastInactiveTime"] === 0) {
      return;
    }
    let inactiveTime = Date.now() - data["lastInactiveTime"];
    let lastDomainObj = {
      lastDomain: {
        domain: data["domain"],
        openedTime: data["openedTime"],
        lastInactiveTime: 0,
        totalInactiveTime: data["totalInactiveTime"]
        ? data["totalInactiveTime"] + inactiveTime
        : inactiveTime,
      },
    };
    chrome.storage.sync.set(lastDomainObj, function () {
      if (debugMode) {
        console.log("chrome active, totalInactiveTime updated");
      }
    });
  });
}

/*
 * Default Favicon images from google and statvoo
 * https://stackoverflow.com/questions/5119041/how-can-i-get-a-web-sites-favicon
 */
let googleFaviconFetchDefaultUrl = fetch(
  `https://care37-cors-anywhere.herokuapp.com/https://www.google.com/s2/favicons?domain=null.com.com.com.com`
)
  .then((res) => {
    return res.blob();
  })
  .then((img) => {
    return readFileAsDataURL(img);
  })
  .then((url) => {
    return url;
  });

// get a url of the favicon for a given domain
async function getFavicon(domain) {
  let googleRes = await fetch(
    `https://care37-cors-anywhere.herokuapp.com/https://www.google.com/s2/favicons?sz=128&domain=${domain}`
  );
  let img = await googleRes.blob();
  let url = await readFileAsDataURL(img);
  googleFaviconFetchDefaultUrl = await googleFaviconFetchDefaultUrl;

  // if the favicon doesn't exist fetch from another domain
  if (url === googleFaviconFetchDefaultUrl) {
    let duckduckgoRes = await fetch(
      `https://care37-cors-anywhere.herokuapp.com/https://icons.duckduckgo.com/ip3/${domain}.ico`
    );
    img = await duckduckgoRes.blob();
    url = await readFileAsDataURL(img);
  }

  return url;
}

// convert the image blob data from a request to a local base64 url so we can compare them
async function readFileAsDataURL(file) {
  let result_base64 = await new Promise((resolve) => {
    let fileReader = new FileReader();
    fileReader.onload = (e) => resolve(fileReader.result);
    fileReader.readAsDataURL(file);
  });
  return result_base64;
}

function cleanOldData() {
  // get all the existing keys
  chrome.storage.sync.get(null, function(items) {
    let allKeys = Object.keys(items);

    // find the date keys that are older than a week
    let oldDates = [];
    allKeys.forEach(key => {
      let dateKey = Date.parse(key);
      // skip keys that aren't real dates
      if (isNaN(dateKey)) {
        return;
      }
      let oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 8);

      if (dateKey < oneWeekAgo) {
        let dateString = new Date(dateKey).toLocaleDateString();
        oldDates.push(dateString); 
      }
    });

    if (debugMode) {
      console.log("Removed dates: " + oldDates);
    }
    // remove oldDates from our list of keys
    chrome.storage.sync.remove(oldDates, function(items) {});
  });
}

/******************************************************************************
 * Util functions (can be used for testing, use at your own risks)
 ******************************************************************************/
/*
 * load default category to chromeStorage
 */
function loadDefaultCategory() {
  fetch("../category.json")
    .then((response) => response.json())
    .then((jsonData) => {
      let category = {};
      category["category"] = jsonData;
      chrome.storage.sync.set(category, function () {
        if (debugMode) {
          console.log("categories loaded successfully");
        }
      });
    });
}

/**
 * Add time data to map. If already exists, append time
 *
 * @param {string} date    the date to be added to
 * @param {string} domain  the domain name to be added
 * @param {string} seconds the amount of time, in second, to be added
 */
function addElement(date, domain, seconds) {
  chrome.storage.sync.get([date], function (data) {
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
    chrome.storage.sync.set(dataObj, function () {
      if (debugMode) {
        console.log("Added: " + domain + "(" + seconds + "s)");
        console.log(dataObj);
      }
    });
  });
}

/**
 * Remove time data from the map
 *
 * @param {string} date   the date string that data will be removed from
 * @param {string} domain the domain that will be removed
 */
function removeElement(date, domain) {
  chrome.storage.sync.get([date], function (data) {
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

    chrome.storage.sync.set(dataObj, function () {
      if (debugMode) {
        console.log("Deleted: " + domain);
        console.log(dataObj);
      }
    });
  });
}

/*
 * Remove date from the map
 */

/**
 * Remove date from the map
 *
 * @param {string} date the date string that will be removed
 */
function removeDate(date) {
  chrome.storage.sync.remove(date, function (data) {
    if (debugMode) {
      console.log("Deleted: " + date);
      console.log(data);
    }
  });
}

/**
 * Get a copy of the map
 */
async function getMap() {
  // make the chrome storage call synchronous
  var p = new Promise(function (resolve, reject) {
    chrome.storage.sync.get(null, function (data) {
      resolve(data);
    });
  });
  return await p;
}

// So node can import, but the file doesn't throw error when imported with importScripts in background.js
if (typeof exports !== "undefined") {
  exports.setLastDomain = setLastDomain;
  exports.domainChanged = domainChanged;
  exports.handleUrlChange = handleUrlChange;
  exports.cleanUsage = cleanUsage;
  exports.clearChromeStorage = clearChromeStorage;
  exports.getDomainsForDay = getDomainsForDay;
  exports.getCategoryList = getCategoryList;
  exports.getCategoryKeys = getCategoryKeys;
  exports.addLinkToCategory = addLinkToCategory;
  exports.addElement = addElement;
  exports.removeElement = removeElement;
  exports.removeDate = removeDate;
  exports.getMap = getMap;
  exports.chromeActive = chromeActive;
  exports.chromeInactive = chromeInactive;
  exports.getWhitelist = getWhitelist;
  exports.updateWhitelist = updateWhitelist;
  exports.toggleTracking = toggleTracking;
  exports.getTrackingStatus = getTrackingStatus;
  exports.loadDefaultCategory = loadDefaultCategory;
  exports.updateCategories = updateCategories;
}

// create a mock of the chrome API that works similarly to the real one so we can test it.
// If we're running these tests with node, chrome will be undefined. That means we can
// define a mock api that mimics the function of the parts of the chrome API we use.
if (typeof chrome === "undefined") {
  // this serves as a mock of the key-value storage of chrome's localstorage
  var TESTING_localStorage = {};
  var chrome = {
    // the only methods we call are chrome.storage.sync.get, and chrome.storage.sync.set.
    // We implement mocks of those functions here.
    storage: {
      sync: {
        set: function (arg, callback) {
          if (typeof arg === "object") {
            const key = Object.keys(arg)[0];
            TESTING_localStorage[key] = arg[key];
          } else {
            throw "Error: arg is not object";
          }
          callback();
        },
        get: function (arg, callback) {
          if (Array.isArray(arg)) {
            const key = arg[0];
            const result =
              TESTING_localStorage[key] === undefined
              ? {}
              : { [key]: TESTING_localStorage[key] };
            callback(result);
          } else if (typeof arg === "object") {
            const key = Object.keys(arg)[0];
            const result =
              TESTING_localStorage[key] === undefined
              ? arg[key]
              : { [key]: TESTING_localStorage[key] };
            callback(result);
          } else {
            throw "Error: arg is not array or object";
          }
        },
        clear: function (callback) {
          for (let key of Object.keys(TESTING_localStorage)) {
            delete TESTING_localStorage[key];
          }
          callback();
        },
      },
    },
  };
  exports.chrome = chrome;
  exports.TESTING_localStorage = TESTING_localStorage;
}
