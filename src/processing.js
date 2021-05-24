/*
 * Global JSON Object storing getDomainsForDay results
 * with functions to access it as well
 */
var data = {};
var currentDate = new Date();

/**
 * Get the time data from specific date
 * 
 * @param {string} date the date string the data will be retrieved from
 * @returns a JSON object that contains the data from specified `date`
 */
async function getDate(date) {
  if (Object.keys(data).length === 0 || data[date] === undefined) {
    data[date] = await getDomainsForDay(date);
  }
  return data[date];
}

/******************************************************************************
 * Date Conversion Functions
 ******************************************************************************/

/**
 * formate a date object to corresponding date string in MM/DD/YYYY format
 * @param {Date} dateObj 
 * @returns a string representation of the date object
 */
function dateString(dateObj) {
  return String(dateObj.getMonth() + 1) + "/" + dateObj.getDate() + "/" + dateObj.getFullYear();
}

/**
 * Return a Date object `prev` number of days before today
 * 
 * @param {number} prev 
 * @returns a Date object `prev` number of days before today
 */
function getPreviousDays(prev) {
  const today = new Date()
  const prevDay = new Date(today)
  
  return new Date(prevDay.setDate(today.getDate() - prev));
}

/******************************************************************************
 * Data Processing Functions
 ******************************************************************************/

/**
 * Get time spent on the domain for a given day
 * @param {string} date  formatted string in the form "MM/DD/YYYY"(i.e. 4/30/2021).
 * @param {string} domain url of a website(i.e. www.google.com)
 * @returns A promise that includes the time spent on the domain on the given date. (in seconds); 0 if the domain is never visited on that date.
 */
async function getTimeForDay(date, domain) {
  const dataObj = await getDate(date);
  if (Object.keys(dataObj).length === 0 || dataObj[domain] === undefined) {
    return 0;
  }
  return dataObj[domain];
}

/**
 * Get time spent on the domain for a given week
 * @param {Array} dates an array for date in the form of string "MM/DD/YYYY"(i.e. ["4/30/2021", "5/1/2021"]).
 * @param {string} domain url of a website(i.e. www.google.com)
 * @returns A promise that includes the time spent on the domain on the given dates. (in seconds)
 *          0 if the domain is never visited.
 */
async function getTimeForWeek(dates, domain) {
  var totalTime = 0;
  for (var i = 0; i < dates.length; i ++) {
    totalTime += await getTimeForDay(dates[i], domain);
  }
  return totalTime;
}

/**
 * Uses the current date to find total seconds spent on Chrome today as well as the difference from yesterday
 * @returns A size 2 array, first index the total second spent on Chrome today, 
 *          second index the difference in seconds, today - yesterday.
 */
async function getTotalTime() {
  const todayString = dateString(currentDate);
  const yesterdayString = dateString(getPreviousDays(1));

  const todayData = await getDate(todayString);
  const yesterdayData = await getDate(yesterdayString);


  var todayTime = 0;
  var yesterdayTime = 0;

  for (var domain in todayData) {
    todayTime += todayData[domain];
  }
  for (var domain in yesterdayData) {
    yesterdayTime += yesterdayData[domain];
  }

  return [todayTime, todayTime - yesterdayTime];
}

/**
 * Get the amount of time for the most frequently visited site
 * 
 * @see getTimeForDay
 * @returns an array of size 3. arr[0]: the URL of the most frequently visited domain; 
 *                              arr[1]: the amount of time spent on the domain; 
 *                              arr[2]: the time different in second compared to yesterday
 */
async function getMostFrequentTime() {
  const todayString = dateString(currentDate);

  const todayData = await getDate(todayString);

  var maxDomain = "";
  var maxTime = -1;

  for (var domain in todayData) {
    if (todayData[domain] > maxTime) {
      maxDomain = domain;
      maxTime = todayData[domain];
    }
  }

  var yesterdayTime = await getTimeForDay(dateString(getPreviousDays(1)), maxDomain);

  return [maxDomain, maxTime, maxTime - yesterdayTime];
}

/**
 * get the weekly data for the past week
 * 
 * @param {Array} prevWeek an array of size 7 containing date strings of past 7 days
 * @returns an array size of 2. arr[0]: the total amount of time spent on chrome for the past 7 days
 *                              arr[1]: dummy data that represents the time difference
 */
async function getWeeklyTotalTime(prevWeek) {
  var total = 0;

  for await (const date of prevWeek) {
    let data = await getDate(date);
    let sum = Object.values(data).reduce(function(accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);
    total += sum;
  }

  return [total, 0];
}

/**
 * Get the most frequently visited sites and the time for the past 7 days
 * 
 * @returns an array of size 3. arr[0]: the string URL of the most frequently visited site
 *                              arr[1]: the total time spent on that site
 *                              arr[2]: dummy data that represents the time difference
 */
async function getWeeklyMostFrequentTime() {
  let timeSheetData = await getTimesheetData("Weekly");
  let obj = timeSheetData[0];

  return [obj['title'], obj['time'], 0];
}

/**
 * Prepare data for the linear chart in the dashboard
 * 
 * @see dateString
 * @see getPreviousDays
 * @see getDate
 * @returns an array of size 2; arr[0]: the date labels for the past 7 days
 *                              arr[1]: the dataset for the past 7 days 
 */
async function getLineChartData() {
  var labels = [];
  var dataset = [];

  const templateData = {
    data: [{x: 1, y: 24}, {x: 1, y: 10}],
    backgroundColor: ['#CFF0C4', '#5AC43B'],
    borderRadius: 16,
    barThickness: 24,
    grouped: false
  }

  for (i = 1; i <= 7; i++) {
    labels.push(dateString(getPreviousDays(7-i)));

    var copy = JSON.parse(JSON.stringify(templateData));
    copy.data[0].x = labels[i-1];
    copy.data[1].x = labels[i-1];

    const tempData = await getDate(labels[i-1]);
    var time = 0;

    for (var domain in tempData) {
      time += tempData[domain];
    }

    copy.data[1].y = time / 3600 < 1 ? 1 : time / 3600;

    dataset.push(copy);
  }

  return [labels, dataset]
}

/**
 * Prepare category data for the polar chart in the dashboard
 * 
 * @see getCategoryKeys
 * @see getCategoryList
 * @see dateString
 * @see getTimeForDay
 * @param {string} status indicate daily or weekly data
 * @returns an array of size 2. arr[0]: the category labels
 *                              arr[1]: the dataset for every category
 */
async function getPolarChartData(status) {
  var labels = await getCategoryKeys();
  var dataset = [];
  var categories = await getCategoryList();
  for (var i = 0; i < labels.length; i++) {
    dataset.push(0);
  }

  if (status === "Daily") {
    const todayString = dateString(currentDate)
    for (var i = 0; i < labels.length; i++) { 
      const domains = categories[labels[i]]
      for (var j = 0; j < domains.length; j++) {
        dataset[i] += await getTimeForDay(todayString, domains[j]);
      }
    }
  } else { // status === "Weekly"
    prevWeek = [];
    for (i = 0; i < 7; i++) {
        prevWeek.push(dateString(getPreviousDays(i)));
    }
    for (var i = 0; i < labels.length; i++) { 
      const domains = categories[labels[i]]
      for (var j = 0; j < domains.length; j++) {
        dataset[i] += await getTimeForWeek(prevWeek, domains[j]);
      }
    }
  }
  return [labels, dataset]
}

/**
 * Prepare data for each domain visited for the past day
 * 
 * @see dateString
 * @see getDate
 * 
 * @param status indicate Daily or Weekly data
 * @returns an array object containing each domain and its corresponding time spent. Example format: {domain: time}
 */
async function getTimesheetData(status) {
  var timesheetData = [];

  if (status === "Daily") {
    const todayData = await getDate(dateString(currentDate))
    for (var domain in todayData) {
      var temp = {}
      temp['title'] = domain;
      temp['time'] = todayData[domain];
      timesheetData.push(temp);
    }
    timesheetData.sort(function (a, b) {
      return b.time - a.time;
    })
  } else {  // status === "Weekly"
    prevWeek = [];
    for (i = 0; i < 7; i++) {
        prevWeek.push(dateString(getPreviousDays(i)));
    }
    for await (const day of prevWeek) {
      const todayData = await getDate(day)
      for (var domain in todayData) {
        var found = false
        for (var i = 0; i < timesheetData.length; i++) {  // check if the element already exists
          let tempObj = timesheetData[i]
          if (tempObj['title'] === domain) {
            tempObj['time'] += todayData[domain];
            found = true
            break;
          }
        }
        if (!found) {
          var temp = {}
          temp['title'] = domain;
          temp['time'] = todayData[domain];
          timesheetData.push(temp);
        }
      }
    }
    timesheetData.sort(function (a, b) {
      return b.time - a.time;
    }) 
  }

  return timesheetData;  
}