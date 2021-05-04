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
export function setLastDomain(domain) {
  chrome.storage.sync.get('lastDomain', function(data) {
    data['domain'] = domain;
    data['openedTime'] = Date.now();
    chrome.storage.sync.set(data, function() {
      if (debugMode) {
        console.log('Last domain set');
      }
    });
  });
}


/* 
 * calculates the time and add to the domain spent
 * @input: domain is a string that represents the host name in url
 */ 
export function domainChanged(domain) {
  chrome.storage.sync.get('lastDomain', function(data) {
    let lastDomain = data['domain'];
    if (domain == null || domain == lastDomain) {  // newtab or nothing changed!
      return;
    }
    if (!lastDomain) {                      // on startup (potential bug, what is default of domain when not set) 
      setLastDomain(domain);
      return;
    }

    // calculate time
    const timeSpentOnDomain = ((Date.now() - data['openedTime'] - data['totalInactiveTime']) / 1000);
    const dateString = new Date(Date.now()).toLocaleDateString();

    const keyName = dateString + "_" + lastActiveTab;

    // set default time to 0 is domain has no time spent
    let defaultValue = { time: 0 };
    chrome.storage.sync.get({[keyName]: defaultValue}, function(data) {
      // data.time will be either the stored value, or defaultValue if nothing is set
      chrome.storage.sync.set({[keyName]: data.time + timeSpentOnDomain}, function() {
        // The value is now stored, so you don't have to do this again
        if (debugMode) {
          console.log('user spent ' + timeSpentOnDomain + ' seconds on ' + domain);
        }
      });
    });

    // add domain to list of domains for the day
    let domainsForDayKey = 'domains_for_' + dateString;
    defaultValue = { domains: [] };
    chrome.storage.sync.get({[domainsForDayKey]: defaultValue}, function(data) {
      // could we make this a Set?
      if (!data.includes(domain)) {
        data.domains.add(domain);
      }
      chrome.storage.sync.set({[domainsForDayKey]: data.domains}, function() {
        // The value is now stored, so you don't have to do this again
        if (debugMode) {
          console.log('added ' + domain + ' to list of domains for ' + dateString);
        }
      });
    });

    // update figures
    setLastDomain(domain);
  });
}


/* 
 * called by invoke functions in chrome when domain is changed
 * @input: weburl is a string that represents the full url of a webside
 */
export function handleUrlChange(webURL) {
  if (webURL == "") {   // new Tab
    return;
  }
  const url = new URL(webURL);
  if (debugMode) {
    console.log('url was changed, hostname is: ' + hostname);
  }
  domainChanged(url.hostname);
}


/******************************************************************************
 * Access Functions for frontend
 ******************************************************************************/
/*
 * clean and reset data
 */
export function cleanUsage() {
  chrome.storage.sync.get('lastDomain', function(data) {
    data['domain'] = null;
    data['openedTime'] = Date.now();
    data['lastInactiveTime'] = null;
    data['totalInactiveTime'] = 0;
    chrome.storage.sync.set(data, function() {
      if (debugMode) {
        console.log('LastDomain key reset');
      }
    });
  });
}


/*
 * Get domains for a given day
 * Note that this computation might be expensive (O(n)).
 * @input: date is a formatted string in the form "month/day/year"(i.e. 4/30/2021).
 * @return: a set of domains, might be empty
 */
export function getDomainsForDay(date) {
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
export function getTimeForDay(date, domain) {
  let timeForDomainDay = date + "_" + domain;

  // make the chrome storage call synchronous
  var p = new Promise(function(resolve, reject){
    chrome.storage.sync.get([timeForDomainDay], function(data) {
      resolve(data.time);
    });
  });

  const timeForDomain = await p;
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
export function getTimeForWeek(dates, domain) {
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
export function addElement(date, domain, seconds) {
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
export function removeElement(date, domain) {
  //const keyName = date + "_" + domain;
  //return dateUrlTimeMap.delete(keyName);
}

/*
 * Get a copy of the map
 */
export function getMap() {
  //return new Map(dateUrlTimeMap);
}
