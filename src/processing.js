/*
 * Global JSON Object storing getDomainsForDay results
 * with functions to access it as well
 */
var data = {};
var categories = getCategories();
var currentDate = new Date();

function getDate(date) {
  if (Object.keys(data).length === 0 || data[date] === undefined) {
    data[date] = getDomainsForDay(date);
  }
  return data[date];
}

/******************************************************************************
 * Date Conversion Functions
 ******************************************************************************/

function dateString(dateObj) {
  return String(dateObj.getMonth() + 1) + "/" + dateObj.getDate() + "/" + dateObj.getFullYear();
}

function yesterday(dateObj) {
  return new Date().setTime(dateObj.getDate() - 1 )
}

/******************************************************************************
 * Data Processing Functions
 ******************************************************************************/

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

/*
 * Uses the current date to find total seconds spent on Chrome today as well as the difference from yesterday
 * @return:
 *    A size 2 array, first index the total second spent on Chrome today, 
 *    second index the difference in seconds, today - yesterday.
 */
function getTotalTime() {
  const todayString = dateString(currentDate);
  const yesterdayString = dateString(currentDate);

  const todayData = getDate(todayString);
  const yesterdayData = getDate(yesterdayString);

  var todayTime = 0;
  var yesterdayTime = 0;

  for (var domain in todayData) {
    todayTime += todayData[domain];
  }
  for (var domain in yesterdayData) {
    yesterdayTime += yesterdayData[domain];
  }

  return [todayTime, todayTime - yesterdayTime]
}