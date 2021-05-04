/******************************************************************************
 * global variables
 ******************************************************************************/
const debugMode = true;         // print message to console (service worker)

/*
  Chrome storage sync keys:

    key: lastDomain
    value: {
      domain: last visited domain,
      openedTime: time stamp of when the domain was opened,
      lastInactiveTime: timestamp of when chrome was inactive,
      totalInactiveTime: total time chrome was inactive
    }

    key: date_domain
    value: {
      time: seconds spent on domain for the time
    }

    key: domains_for_date
    value: {
      domains: list of domains visited that day
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
  // default object if lastDomain key does not exist
  let defaultLastDomainObj = { 
    lastDomain: {
      domain: 'null',
      openedTime: Date.now(),
      lastInactiveTime: 0,
      totalInactiveTime: 0
    }
  };
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

    const keyName = dateString + "_" + lastDomain;

    // set default time to 0 if domain has no time spent
    let defaultValue = { time: 0 };
    chrome.storage.sync.get({[keyName]: defaultValue}, function(data) {
      let newTimeObj = {[keyName]: {time: data[keyName].time + timeSpentOnDomain}};
      chrome.storage.sync.set(newTimeObj, function() {
        if (debugMode) {
          console.log('user spent ' + timeSpentOnDomain + ' seconds on ' + lastDomain);
        }
      });
    });

    // add domain to list of domains for the day
    let domainsForDayKey = 'domains_for_' + dateString;
    defaultValue = { domains: [] };
    chrome.storage.sync.get({[domainsForDayKey]: defaultValue}, function(data) {
      data = data[domainsForDayKey] 
      // TODO could we make this a Set?
      if (!data.domains.includes(domain)) {
        data.domains.push(domain);
        if (debugMode) {
          console.log('added ' + domain + ' to list of domains for ' + dateString);
        }
      }
      chrome.storage.sync.set({[domainsForDayKey]: {domains: data.domains}}, function() {
      });
    });

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
  if (debugMode) {
    console.log('url was changed, hostname is: ' + url.hostname);
  }
  domainChanged(url.hostname);
}


/******************************************************************************
 * Access Functions for frontend
 ******************************************************************************/
/*
 * clean and reset data
 */
function cleanUsage() {
  chrome.storage.sync.get(['lastDomain'], function(data) {
    data['domain'] = null;
    data['openedTime'] = Date.now();
    data['lastInactiveTime'] = null;
    data['totalInactiveTime'] = 0;
    chrome.storage.sync.get(['lastDomain'], function(data) {
      if (debugMode) {
        console.log('LastDomain key reset');
      }
    });
  });
}

/*
 * clean out chrome storage
 */
function clearChromeStorage() {
  chrome.storage.sync.clear(function () {
    console.log('cleared chrome storage');
  });
}


/*
 * Get domains for a given day
 * Note that this computation might be expensive (O(n)).
 * @input: date is a formatted string in the form "month/day/year"(i.e. 4/30/2021).
 * @return: a set of domains, might be empty
 */
async function getDomainsForDay(date) {
  // get domains for a given day
  let domainsForDayKey = 'domains_for_' + dateString;

  // make the chrome storage call synchronous
  var p = new Promise(function(resolve, reject){
    chrome.storage.sync.get([domainsForDayKey], function(data) {
      resolve(data.domains);
    });
  });

  const domainsForDay = await p;
  return domainsForDay;
}


/*
 * get time spent on the domain for a given day
 * @input:
 *    date is a formatted string in the form "month/day/year"(i.e. 4/30/2021).
 *    domain is a string that represents the url of a website(i.e. www.google.com)
 * @return:
 *    the time spent on the domain on the given date. (in seconds)
 *    0 if the domain is never visited on that date.
 */
async function getTimeForDay(date, domain) {
  // prints out the total time spent on each domain
  if (debugMode) {
    chrome.storage.sync.get(null, function(items) {
      console.log(JSON.stringify(items));
      var allKeys = Object.keys(items);
      console.log(allKeys);
      for (key of allKeys) {
        chrome.storage.sync.get([key], function(val) {
          console.log(JSON.stringify(val));
        });
      }
    });
  }
  let timeForDomainDayKey = date + "_" + domain;

  // make the chrome storage call synchronously
  var p = new Promise(function(resolve, reject){
    chrome.storage.sync.get({[timeForDomainDayKey]: {time: 0}}, function(data) {
      resolve(data[timeForDomainDayKey].time);
    });
  });

  const timeForDomain = await p;
  if (debugMode) {
    console.log('time for ' + domain + ' on ' + date);
  }

  return timeForDomain;
}


/*
 * get time spent on the domain for a given week
 * @input:
 *    dates is an array for date in the form of string "month/day/year"(i.e. ["4/30/2021", "5/1/2021"]).
 *    domain is a string that represents the url of a website(i.e. www.google.com)
 * @return:
 *    the time spent on the domain on the given dates. (in seconds)
 *    0 if the domain is never visited.
 */
function getTimeForWeek(dates, domain) {
  var totalTime = 0;
  dates.forEach(function(date, index, array) {
    totalTime += getTimeForDay(date, domain)
  })
  return totalTime;
}


/******************************************************************************
 * Util functions (can be used for testing, delete before publishing)
 ******************************************************************************/
/*
 * Add elements to map. If already exists, append time
 */
//TODO complete these now that we are using sync
function addElement(date, domain, seconds) {
  //const keyName = date + "_" + domain;
  //if (!dateUrlTimeMap.has(keyName)) {
  //  dateUrlTimeMap.set(keyName, 0);
  //}
  //dateUrlTimeMap.set(keyName, dateUrlTimeMap.get(keyName) + seconds);
}

/*
 * Remove elements from the map
 * Return true if successful, false otherwise
 */
function removeElement(date, domain) {
  //const keyName = date + "_" + domain;
  //return dateUrlTimeMap.delete(keyName);
}

/*
 * Get a copy of the map
 */
function getMap() {
  //return new Map(dateUrlTimeMap);
}
