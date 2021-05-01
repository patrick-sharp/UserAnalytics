/******************************************************************************
 * global variables
 ******************************************************************************/
var lastActiveTab = null        // the last active domain
var lastTimeStamp = Date.now(); // the last recoreded timestamp
let dateUrlTimeMap = new Map(); // maps from date_domain(i.e. "5/1/2021_www.google.com") to time (seconds).
const debugMode = true;         // print message to console (service worker)

/******************************************************************************
 * Middleware Functions
 ******************************************************************************/
/*
 * sets the last domain key to the domain and current timestamp
 * @input: domain is a string that represents the host name in url
 */
export function setLastDomain(domain) {
  lastActiveTab = domain
  lastTimeStamp = Date.now();
}


/* 
 * calculates the time and add to the domain spent
 * @input: domain is a string that represents the host name in url
 */ 
export function domainChanged(domain) {
  if (domain == null || domain == lastActiveTab) {  // newtab or nothing changed!
    return;
  }
  if (lastActiveTab == null) {                      // on startup
    setLastDomain(domain);
    return;
  }

  // calculate time
  const second = Math.floor((Date.now() - lastTimeStamp)/1000);
  const date = new Date(Date.now()).toLocaleDateString();

  // add to map
  const keyName = date + "_" + lastActiveTab;
  if (!dateUrlTimeMap.has(keyName)) {
    dateUrlTimeMap.set(keyName, 0);
  }
  dateUrlTimeMap.set(keyName, dateUrlTimeMap.get(keyName) + second);

  // update figures
  setLastDomain(domain);

  // debug print
  if (debugMode) {
    console.log("\n");
    console.log(dateUrlTimeMap);
    console.log("Current tab: " + lastActiveTab);
    console.log("last timestamp: " + new Date(lastTimeStamp).toLocaleDateString());
  }
}


/* 
 * called by invoke functions in chrome when domain is changed
 * @input: weburl is a string that represents the full url of a webside
 */
export function handleUrlChange(webURL) {
  if (webURL == "") {   // new Tab
    return;
  }
  const url = new URL(webURL)
  // console.log(url.hostname);
  domainChanged(url.hostname)
}


/******************************************************************************
 * Access Functions for frontend
 ******************************************************************************/
/*
 * clean and reset data
 */
export function cleanUsage() {
  lastActiveTab = null        
  lastTimeStamp = Date.now();
  dateUrlTimeMap.clear();
}


/*
 * Get domains for a given day
 * Note that this computation might be expensive (O(n)).
 * @input: date is a formatted string in the form "month/day/year"(i.e. 4/30/2021).
 * @return: a set of domains, might be empty
 */
export function getDomainsForDay(date) {
  const returnSet = new Set();
  for (const [key, value] of dateUrlTimeMap.entries()) {
    const str = key.split("_", 2);
    const dateInfo = str[0];
    const domainInfo = str[1];
    if (dateInfo == date) {
      returnSet.add(domainInfo);
    }
  }
  return returnSet; 
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
  const keyName = date + "_" + domain;
  if (!dateUrlTimeMap.has(keyName)) {
    return 0;
  }
  return dateUrlTimeMap.get(keyName);
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
  const keyName = date + "_" + domain;
  if (!dateUrlTimeMap.has(keyName)) {
    dateUrlTimeMap.set(keyName, 0);
  }
  dateUrlTimeMap.set(keyName, dateUrlTimeMap.get(keyName) + seconds);
}

/*
 * Remove elements from the map
 * Return true if successful, false otherwise
 */
export function removeElement(date, domain) {
  const keyName = date + "_" + domain;
  return dateUrlTimeMap.delete(keyName);
}

/*
 * Get a copy of the map
 */
export function getMap() {
  return new Map(dateUrlTimeMap);
}
