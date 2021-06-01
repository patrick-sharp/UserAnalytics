const dates = ['Daily', 'Weekly'];
var charts = [];                    // linechart, polarchart
var loadWeekTimeSheet = false       // true if loading weekly timesheet
var loadDailyTimeSheet = false      // true if loading daily timesheet
var picker = null;                  // calendar picker instance
var pickerDate = null;              // selected calender date

/**
 * Open setting panel
 */
function openSettingPanel() {
    let setting_panel = document.getElementById("setting_panel");
    setting_panel.removeAttribute('style');
    setting_panel.classList.add('halfscreen');
    setting_panel.classList.add('fullscreen');    
    document.getElementById('main').style.marginLeft = "50%";
}


/**
 * Close the setting panel
 */
function closeSettingPanel() {
    let setting_panel = document.getElementById("setting_panel");
    setting_panel.style.width = "0";
    document.getElementById('main').style.marginLeft = "150px";

    document.body.style.backgroundColor = '#F2F0EB'
}


window.onload = async function() {

    document.getElementById("setting").addEventListener("click", openSettingPanel);
    document.getElementById("setting_close_button").addEventListener("click", closeSettingPanel);

    dates.forEach(date => {
        var button = document.createElement("button");
        button.id = date;
        button.innerHTML = date;
    
        button.addEventListener('click', event => updateButtonStyle(event))
        let a = document.getElementById('selector');

        if (date === "Daily") {
            var calendar_container = document.createElement('div');
            calendar_container.id = "calendar_container";
            var calendar_img = document.createElement('img');
            calendar_img.id = "calendar_selector";
            calendar_img.src = 'assets/images/calendar.svg';
            calendar_img.style.width = '28px';
            calendar_img.style.height = '28px';
            calendar_container.appendChild(button);
            calendar_container.appendChild(calendar_img);
            a.append(calendar_container);
        } else {
            a.appendChild(button);
        }
    })

    setupCalendarSelector();

    document.getElementById("Daily").click()

    document.getElementById("clear_usage_button").onclick = clearUsageData;

    var whitelist = await getWhitelist();
    document.getElementById("whitelist_editor").innerHTML = whitelist.join(", ");
    document.getElementById("whitelist_button").onclick = saveWhitelist;

    var categories = await getCategoryList();
    document.getElementById("entertainment_editor").innerHTML = categories["Entertainment"].join(", ");
    document.getElementById("social_editor").innerHTML = categories["Social"].join(", ");
    document.getElementById("reading_editor").innerHTML = categories["Reading"].join(", ");
    document.getElementById("productivity_editor").innerHTML = categories["Productivity"].join(", ");
    document.getElementById("uncategorized_editor").innerHTML = categories["Uncategorized"].join(", ");
    document.getElementById("categories_button").onclick = saveCategories;
};

/**
 * Set up a calendar selector
 */
function setupCalendarSelector() {
    var calendarRange = [];
    for (let i = 0; i < 7; i++) {
        calendarRange.push(calendarDateString(getPreviousDays(i)));
    }

    picker = flatpickr("#calendar_selector", {
        defaultDate: calendarDateString(new Date()),
        enable: calendarRange
    });
    pickerDate = calendarDateString(new Date());

    picker.config.onChange.push(function(selectedDate, datestr) {
        selectedDateString = dateString(selectedDate[0]);
        // loading old timesheet, reset current request.
        if (loadDailyTimeSheet) {
            alert("Timesheet for " + pickerDate + " loading, please try again later.");
            picker.setDate(pickerDate);
            return;
        }
        retrieveDailyData(selectedDateString);
        generateTimeSheet("Daily", selectedDateString);
        renderGraph("Daily", selectedDateString);
        pickerDate = datestr;
    });

}

/**
 * generate timeSheet
 * @param {string} status indicate daily or weekly data
 * @param {string} date dateString, default null
 * @see getTimeSheetData()
 */
async function generateTimeSheet(status, date=null) {
    const prefix = "timesheet_"
    let removed = dates.filter(d => d !== status)[0];
    
    document.getElementById(prefix +removed).style.display = "none";
    document.getElementById(prefix + status).style.display = "grid";
    if (status === "Daily") {
        if (loadDailyTimeSheet === true) {
            return;
        }
        loadDailyTimeSheet = true
    }
    if (status === "Weekly") {
        if (loadWeekTimeSheet === true) {
            return;
        }
        loadWeekTimeSheet = true
    }

    var timesheet = document.getElementById(prefix + status);
    timesheet.innerHTML = null;

    var timesheet_data = await getTimesheetData(status, date);
    for (var i = 0; i < timesheet_data.length; i ++) {
        let value = timesheet_data[i]
        var row = document.createElement('div');
        row.className = 'timesheet_row';
        var img = document.createElement('img');
        img.style.width = '32px';
        img.style.height = '32px'
        img.src = await getFavicon(value.title);
        if (i === 0) {      // update mostfrequent Icon
            var icon = document.getElementById('right_container').children[0].children[1].firstChild;
            icon.src = img.src;
        }

        var title = document.createElement('span');
        title.id = 'title';
        title.innerHTML = value.title;
        var time = document.createElement('span');
        time.id = 'time';
        time.innerHTML = formatTimeToHour(value.time).replace(/\d+/g, function(v){
            return "<span class='numbers'>" + v + "</span>";
        });
    
        row.appendChild(img);
        row.appendChild(title);
        row.appendChild(time);
    
        timesheet.appendChild(row);
    }
    if (status === "Daily") {
        loadDailyTimeSheet = false;
    } else {
        loadWeekTimeSheet = false;
    }
}

function clearUsageData() {
    clearChromeStorage();
    document.getElementById("clear_usage_success_text").innerHTML = "Cleared!";
    setTimeout(() => { document.getElementById("clear_usage_success_text").innerHTML = ""; }, 2000)
}

/**
 * Save the whitelist to Chrome storage, and update the visual indication
 * 
 * @see updateWhitelist
 */
function saveWhitelist() {
    var whitelist = document.getElementById("whitelist_editor").value.split(',');
    for (var i = 0; i < whitelist.length; i++) {
        whitelist[i] = whitelist[i].trim();
    }
    updateWhitelist(whitelist);
    document.getElementById("whitelist_success_text").innerHTML = "Saved!";
    setTimeout(() => { document.getElementById("whitelist_success_text").innerHTML = ""; }, 2000)
}

function saveCategories() {
    var obj = {};
    const names = ["Entertainment", "Social", "Reading", "Productivity", "Uncategorized"];
    const editors = ["entertainment_editor", "social_editor", "reading_editor", "productivity_editor", "uncategorized_editor"];
    for (var i = 0; i < names.length; i++) {
        var category = document.getElementById(editors[i]).value.split(',');
        for (var j = 0; j < category.length; j++) {
            category[j] = category[j].trim();
        }
        obj[names[i]] = category;
    }
    updateCategories(obj);
    document.getElementById("categories_success_text").innerHTML = "Saved!";
    setTimeout(() => { document.getElementById("categories_success_text").innerHTML = ""; }, 2000)
}

/**
 * Generate necessary statistics for top banner section
 * 
 * @param {string}  titleString indicate which section the statistics is used for
 * @param {number}  totalTime   the total amount of time for `titleString`
 * @param {number}  timeDiff    the time difference compared to last time
 * @param {string}  domain      the most frequently used domain under `titleString`. empty string for `Daily`
 * @returns a UI container that encapsulates title, icon, time and time difference
 */
function generateStatistics(titleString, totalTime, timeDiff, domain) {
    // UI
    let container = document.createElement('div');
    container.id = 'stats_container';
    container.style.marginLeft = '52px';
    container.style.marginTop = '17px';

    let title = document.createElement('p');
    title.id = 'title';

    let content_container = document.createElement('div');
    content_container.id = 'content_container';

    let icon = document.createElement('img')
    let timeContainer = document.createElement('div');
    timeContainer.id = "time_container";
    let time = document.createElement('div');

    title.innerHTML = titleString;
    title.style.fontSize = '24px';
    title.style.color = '#000000'
    icon.src = 'assets/images/timer.svg';      // placeholder for default image
    icon.style.width = '32px';
    icon.style.height = '32px';

    
    time.innerHTML = formatTimeToHour(totalTime).replace(/\d+/g, function(v){
        return "<span class='numbers'>" + v + "</span>";
    });

    timeContainer.appendChild(time);

    if (timeDiff != 0) {
        let comparison = document.createElement('span');
        comparison.id = 'comparison';
        comparison.innerHTML = (formatTimeToMinute(timeDiff) + " compared to last time").replace(/(\+|\-)\d+(min)/, function(v) {
            return (v.includes('+') ? "<span class='comp_plus'>" : "<span class='comp_minus'>")  + v + "</span>";});
        timeContainer.appendChild(comparison);
    }

    content_container.appendChild(icon);
    content_container.appendChild(timeContainer);

    container.appendChild(title);
    container.appendChild(content_container);

    return container;
}

/**
 * Update the `Daily, Weekly` button style and corresponding data when clicked
 * 
 * @param {object} event the click event from DOM
 * @see retrieveDailyData
 * @see retrieveWeeklyData
 */
function updateButtonStyle(event) {
    var button = document.getElementById(event.target.id)
    button.style.borderRadius = '10px';
    button.style.color = '#5AC43B'
    button.style.backgroundColor = '#DCFFCF'
    button.style.border = '1px solid #5AC43B'
    button.style.boxSizing = 'border-box'

    let i = dates.filter(d => d != event.target.id)[0];
    document.getElementById(i).removeAttribute('style');

    let tags = document.getElementsByClassName('changeable_date_range')
    for (let tag of tags) {
        tag.innerHTML = event.target.id;
    }

    var left = document.getElementById('left_container')
    if (left.children.length > 0) {
        left.removeChild(left.childNodes[0]);
    }
    var right = document.getElementById('right_container')
    if (right.children.length > 0) {
        right.removeChild(right.childNodes[0]);
    }

    if (event.target.id === "Daily") {
        retrieveDailyData();
        generateTimeSheet("Daily")
        renderGraph("Daily")
        document.getElementById('calendar_selector').style.display = 'block';
    } else {
        retrieveWeeklyData();
        generateTimeSheet("Weekly")
        renderGraph("Weekly")
        document.getElementById('calendar_selector').style.display = 'none';
        
        // reset Calender
        picker.setDate(calendarDateString(new Date()));
        pickerDate = calendarDateString(new Date())
    }
}


/**
 * Render the Chrome usage graphs
 * Polar Chart will be updated if already populated
 * @param {string} status indicate daily or weekly data
 * @param {string} date   dateString, default null
 */
async function renderGraph(status, date=null) {

    // plot linechart
    if (charts.length === 0) {
        const [lineLabels, lineDataset] = await getLineChartData();
        var ctx_line = document.getElementById("lineChart");
        var lineChart = new Chart(ctx_line, {
                                type: 'bar',
                                data: {
                                    labels: lineLabels,
                                    datasets: lineDataset
                                },
                                options: {
                                    plugins: {
                                        legend: {
                                            display: false
                                        }
                                    },
                                    events: [],
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            max: 24,
                                            grid: {
                                                display: false,
                                                drawBorder: true,
                                                drawOnChartArea: true,
                                                drawTicks: false,
                                            },
                                            ticks: {
                                                callback: function(value, index, values) {
                                                    return value + "H"
                                                }
                                            }
                                        },
                                        x: {
                                            grid: {
                                                display: false,
                                                drawBorder: true,
                                                drawOnChartArea: true,
                                                drawTicks: false,
                                            }
                                        }
                                    }
                                }
                            });
        charts.push(lineChart);
    }
    
    // plot polarChart
    var polarChart = null;
    const polarData = await getPolarChartData(status, date);

    const sortedPolarData = Object.entries(polarData)
                            .sort(([,a],[,b]) => b-a)
                            .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
    let polarLabels = Object.keys(sortedPolarData);
    let polarDataset = Object.values(sortedPolarData);

    // if no data, set default categories and time (0s)
    if (polarLabels.length === 0) {
        polarLabels = await getCategoryKeys()
    }
    if (polarDataset.length === 0) {
        polarDataset = Array.from(Array(polarLabels.length), (_, i) => 0)
    }
    

    let updatePolarChartToolTip = function(context) {
        let index = context.dataIndex;
    
        let label = polarLabels[index]
        let data = polarDataset[index];
    
        return label + ": " + (data / 60).toFixed(2) + "min";
    }

    const order = Array.from(Array(polarLabels.length), (_, i) => i+1).reverse()
    if (charts.length === 2) {
        polarChart = charts.pop();
        polarChart.options.plugins.tooltip.callbacks.label = updatePolarChartToolTip
        polarChart.update("show");
    } else {
        var ctx_polar = document.getElementById('polarChart');
        polarChart = new Chart(ctx_polar, {
            type: 'polarArea',
            data: {
                labels: polarLabels,
                datasets: [
                {
                    label: '',
                    data: order,
                    backgroundColor: [
                        '#EAD367',
                        '#D3705A',
                        '#D8E8E2',
                        '#C4D293',
                        '#37554C'
                    ]
                }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        callbacks: {
                            label: updatePolarChartToolTip
                        }
                    }
                }
            }
        });
    }
    charts.push(polarChart);
}

/**
 * Retrieve Daily usage data from Chrome storage
 * @param {string} date dateString, default null
 * @see generateStatistics
 */
async function retrieveDailyData(date=null) {
    totalTimeData = await getTotalTime(date);
    var left_container = document.getElementById('left_container');
    if (left_container.children.length > 0) {
        left_container.removeChild(left_container.childNodes[0]);
    }
    let left_content = generateStatistics("Total Time", totalTimeData[0], totalTimeData[1], '');
    left_container.appendChild(left_content);
    
    mostFrequentTimeData = await getMostFrequentTime(date);
    var right_container = document.getElementById('right_container');
    if (right_container.children.length > 0) {
        right_container.removeChild(right_container.childNodes[0]);
    }
    let right_content = generateStatistics("Most Frequent", mostFrequentTimeData[1], mostFrequentTimeData[2], mostFrequentTimeData[0]);
    right_container.appendChild(right_content);
}

/**
 * Retrieve Weekly usage data from Chrome storage and update data in the container through 
 * 
 * @see generateStatistics
 */
async function retrieveWeeklyData() {
    prevWeek = [];
    for (i = 0; i < 7; i++) {
        prevWeek.push(dateString(getPreviousDays(i)));
    }
    
    weeklyTotalTimeData = await getWeeklyTotalTime(prevWeek);
    weeklyMostFrequentTimeData = await getWeeklyMostFrequentTime();

    var left_container = document.getElementById('left_container');
    let left_content = generateStatistics("Total Time", weeklyTotalTimeData[0], weeklyTotalTimeData[1], '');
    left_container.appendChild(left_content);
    
    // Add most frequent getMostFrequentTime() in procesing.js
    mostFrequentTimeData = await getMostFrequentTime();
    var right_container = document.getElementById('right_container');
    let right_content = generateStatistics("Most Frequent", weeklyMostFrequentTimeData[1], weeklyMostFrequentTimeData[2], weeklyMostFrequentTimeData[0]);
    right_container.appendChild(right_content);
}


/**
 * Format month, day and year into MM/DD/YYYY format
 * @example 5/8/2021, 10/12/2020
 * 
 * @param {number} month the month to be formatted, 0-indexed
 * @param {number} day   the day of the month
 * @param {number} year  the full year representation
 * @returns a formatted time string
 */
function formatDate(month, day, year) {
    return month + "/" + day + "/" + year;
}

/**
 * Format a number in second to corresponding hour string 
 * 
 * @param {number} second 
 * @returns a corresponding hour string
 */
function formatTimeToHour(second) {
    let hour = Math.trunc(second / 3600);
    let minute = Math.abs(Math.ceil((second % 3600) / 60));
    return hour + 'H' + minute + 'MIN';
}

/**
 * Format a number in second to corresponding minutes
 * 
 * @param {number} second 
 * @returns a formatted minute string
 */
function formatTimeToMinute(second) {
    var formattedString = second < 0 ? "" : "+";
    let minute = Math.floor(second / 60);
    return formattedString + minute + "min";
}

