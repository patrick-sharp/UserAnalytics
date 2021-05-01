/***************************************
 * global variables
 ***************************************/
var lastActiveTab = null        // the last active domain
var lastTimeStamp = Date.now(); // the last recoreded timestamp
let urlTimeMap = new Map();     // maps from date_domain(i.e. "5/1/2021_www.google.com") to time (seconds).
const debugMode = true;         // print message to console (service worker)

/***************************************
 * Middleware Functions
 ***************************************/
/*
 * sets the last domain key to the domain and current timestamp
 * @input: domain is a string that represents the host name in url
 */
function setLastDomain(domain) {
  lastActiveTab = domain
  lastTimeStamp = Date.now();
}


/* 
 * calculates the time and add to the domain spent
 * @input: domain is a string that represents the host name in url
 */ 
function domainChanged(domain) {
  if (domain == lastActiveTab) { // newtab or nothing changed!
    return;
  }
  if (domain == null) {          // on startup
    setLastDomain(domain);
    return;
  }

  // calculate time
  const second = Math.floor((Date.now() - lastTimeStamp)/1000);
  const date = new Date(Date.now()).toLocaleDateString();

  // add to map
  const keyName = date + "_" + lastActiveTab;
  if (!urlTimeMap.has(keyName)) {
    urlTimeMap.set(keyName, 0);
  }
  urlTimeMap.set(keyName, urlTimeMap.get(keyName) + second);

  // update figures
  setLastDomain(domain);

  // debug print
  if (debugMode) {
    console.log("\n");
    console.log(urlTimeMap);
    console.log("Current tab: " + lastActiveTab);
    console.log("last timestamp: " + new Date(lastTimeStamp).toLocaleDateString());
  }
}


/* 
 * called by invoke functions in chrome when domain is changed
 * @input: weburl is a string that represents the full url of a webside
 */
function handleUrlChange(webURL) {
  if (webURL == "") {   // new Tab
    return;
  }
  const url = new URL(webURL)
  // console.log(url.hostname);
  domainChanged(url.hostname)
}


/***************************************
 * Access Functions for frontend
 ***************************************/




