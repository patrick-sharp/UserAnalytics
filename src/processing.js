const { getDomainsForDay, getCategories } = require("./middleware");

/*
 * Global JSON Object storing getDomainsForDay results
 * with functions to access it as well
 */
var data = {};
var categories = getCategories();

function getDate(date) {
  if (Object.keys(data).length === 0 || data[date] === undefined) {
    data[date] = getDomainsForDay(date);
  }
  return data[date];
}

/*
 * get time spent on the domain for a given day
 * @input:
 *    date is a formatted string in the form "month/day/year"(i.e. 4/30/2021).
 *    domain is a string that represents the url of a website(i.e. www.google.com)
 * @return:
 *    A promise that includes the time spent on the domain on the given date. (in seconds)
 *    0 if the domain is never visited on that date.
 */
function getTimeForDay(date, domain) {
  const dataObj = getDate(date);
  if (Object.keys(dataObj).length === 0 || dataObj[domain] === undefined) {
    return 0;
  }
  return dataObj[domain];
}
  
  
/*
 * get time spent on the domain for a given week
 * @input:
 *    dates is an array for date in the form of string "month/day/year"(i.e. ["4/30/2021", "5/1/2021"]).
 *    domain is a string that represents the url of a website(i.e. www.google.com)
 * @return:
 *    A promise that includes the time spent on the domain on the given dates. (in seconds)
 *    0 if the domain is never visited.
 */
function getTimeForWeek(dates, domain) {
  var totalTime = 0;
  for (var i = 0; i < dates.length; i ++) {
    totalTime += getTimeForDay(dates[i], domain);
  }
  return totalTime;
}