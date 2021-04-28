/***************************************
 * global variables
 ***************************************/
var lastActiveTab = null        // the last active domain
var lastTimeStamp = Date.now(); // the last recoreded timestamp
let urlTimeMap = new Map();     // maps from domain to time (seconds).

var debugMode = true;           // print message to console (service worker)

/***************************************
 * Middleware Functions
 ***************************************/
// sets the last domain key to the domain and current timestamp
function setLastDomain(domain) {
  lastActiveTab = domain
  lastTimeStamp = Date.now();
}


// calculates the time between now and the last domain timestamp
// adds this to the domain time spent
// calls setLastDomain to update the last domain with the new domain
// adds the domain to list of domains for day (domain+date key)
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

  // add to map
  if (!urlTimeMap.has(lastActiveTab)) {
    urlTimeMap.set(lastActiveTab, 0);
  }
  urlTimeMap.set(lastActiveTab, urlTimeMap.get(lastActiveTab) + second);

  // update figures
  setLastDomain(domain);

  // debug print
  if (debugMode) {
    console.log("\n");
    console.log(urlTimeMap);
    console.log("Current tab: " + lastActiveTab);
    console.log("last timestamp: " + lastTimeStamp);
  }
}


// called by invoke functions for domainchanged
function handleUrlChange(webURL) {
  if (webURL == "") {   // new Tab
    return;
  }
  const url = new URL(webURL)
  // console.log(url.hostname);
  domainChanged(url.hostname)
}
