/*
 * Global JSON Object storing getDomainsForDay results
 * with functions to access it as well
 */
var data = {};
var categories = getCategories();
var currentDate = new Date();

async function getDate(date) {
  if (Object.keys(data).length === 0 || data[date] === undefined) {
    data[date] = await getDomainsForDay(date);
  }
  return data[date];
}

/******************************************************************************
 * Date Conversion Functions
 ******************************************************************************/

function dateString(dateObj) {
  return String(dateObj.getMonth() + 1) + "/" + dateObj.getDate() + "/" + dateObj.getFullYear();
}

function getPreviousDays(prev) {
  const today = new Date()
  const prevDay = new Date(today)
  
  return new Date(prevDay.setDate(today.getDate() - prev));
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
async function getTimeForDay(date, domain) {
  const dataObj = await getDate(date);
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
async function getTimeForWeek(dates, domain) {
  var totalTime = 0;
  for (var i = 0; i < dates.length; i ++) {
    totalTime += await getTimeForDay(dates[i], domain);
  }
  return totalTime;
}

/*
 * Uses the current date to find total seconds spent on Chrome today as well as the difference from yesterday
 * @return:
 *    A size 2 array, first index the total second spent on Chrome today, 
 *    second index the difference in seconds, today - yesterday.
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

async function getWeeklyTotalTime(prevWeek) {
  var total = 0;

  console.log(prevWeek);
  for await (const date of prevWeek) {
    console.log("date is " + date);
    let data = await getDate(date);
    let sum = Object.values(data).reduce(function(accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);
    total += sum;
  }

  return [total, 0];
}

async function getWeeklyMostFrequentTime(prevWeek) {
  var maxDomain = "";
  var maxTime = -1;
  for await (const day of prevWeek) {
    const todayData = await getDate(day);
    for (var domain in todayData) {
      if (todayData[domain] > maxTime) {
        maxDomain = domain;
        maxTime = todayData[domain];
      }
    }
  }

  return [maxDomain, maxTime, 0];
}

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