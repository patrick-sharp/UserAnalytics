const dates = ['Daily', 'Weekly'];
var charts = [];                    // linechart, polarchart

/**
 * Open setting panel
 */
function openSettingPanel() {
    document.getElementById("setting_panel").style.width = "50%";
}

/**
 * Close the setting panel
 */
function closeSettingPanel() {
    document.getElementById("setting_panel").style.width = "0";
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
        a.appendChild(button);
    })

    document.getElementById("Daily").click()

    var whitelist = await getWhitelist();
    document.getElementById("whitelist_editor").innerHTML = whitelist.join(", ");
    document.getElementById("whitelist_button").onclick = saveWhitelist;
};

/**
 * generate timeSheet
 * @param {string} status indicate daily or weekly data
 * @see getTimeSheetData()
 */
async function generateTimeSheet(status) {
    var timesheet = document.getElementById('timesheet');
    timesheet.innerHTML = null;

    var timesheet_data = await getTimesheetData(status);
    timesheet_data.forEach(function(value, _index, _arr){
        var row = document.createElement('div');
        row.className = 'timesheet_row';
        var img = document.createElement('img');
        img.style.width = '32px';
        img.style.height = '32px'
        img.src = 'https://www.google.com/s2/favicons?sz=64&domain_url=' + value.title;
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
    })
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
    icon.src = domain === "" ? 'images/timer.svg' : ('https://www.google.com/s2/favicons?sz=64&domain_url=' + domain)
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
    } else {
        retrieveWeeklyData();
        generateTimeSheet("Weekly")
        renderGraph("Weekly")
    }
}




/**
 * Render the Chrome usage graphs
 * Polar Chart will be updated if already populated
 * @param {string} status indicate daily or weekly data
 */
async function renderGraph(status) {

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
    const [polarLabels, polarDataset] = await getPolarChartData(status);
    if (charts.length === 2) {
        polarChart = charts.pop();
        polarChart.data.datasets[0].data = polarDataset
        polarChart.update("show");
    } else {
        var ctx_polar = document.getElementById('polarChart');
        polarChart = new Chart(ctx_polar, {
            type: 'polarArea',
            data: {
                labels: polarLabels,
                datasets: [
                {
                    label: 'Dataset 1',
                    data: polarDataset,
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
                    }
                }
            }
        });
    }
    charts.push(polarChart);
}

/**
 * Retrieve Daily usage data from Chrome storage
 * 
 * @see generateStatistics
 */
async function retrieveDailyData() {
    totalTimeData = await getTotalTime();
    var left_container = document.getElementById('left_container');
    let left_content = generateStatistics("Total Time", totalTimeData[0], totalTimeData[1], '');
    left_container.appendChild(left_content);
    
    mostFrequentTimeData = await getMostFrequentTime();
    var right_container = document.getElementById('right_container');
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

/**
 * Return a Date object `prev` number of days before today
 * 
 * @param {number} prev 
 * @returns a Date object `prev` number of days before today
 */
function getPreviousDays(prev) {
    const today = new Date()
    const yesterday = new Date(today)
    
    return new Date(yesterday.setDate(today.getDate() - prev));
}