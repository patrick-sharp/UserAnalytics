const dates = ['Daily', 'Weekly'];

// let timesheet_data = [
//     {
//         icon:'a',
//         title:'b',
//         time:'10H28MIN',
//     },
//     {
//         icon:'a',
//         title:'d',
//         time:'0H1MIN',
//     },
//     {
//         icon:'a',
//         title:'f',
//         time:'12H9MIN',
//     }
// ]

let date_range_selection = ['Last 7 Days', 'Last 14 Days'];

function openSettingPanel() {
    document.getElementById("setting_panel").style.width = "50%";
    // document.getElementById("main").style.marginLeft = "50%";
    // document.body.style.backgroundColor = "rgba(0,0,0,0.25)";
}

function closeSettingPanel() {
    document.getElementById("setting_panel").style.width = "0";
    // document.getElementById("main").style.marginLeft = "0";
    document.body.style.backgroundColor = '#F2F0EB'
}


window.onload = async function() {

    // retrieveDailyData();

    document.getElementById("setting").addEventListener("click", openSettingPanel);
    document.getElementById("setting_close_button").addEventListener("click", closeSettingPanel);

    // getDomainsForWeek().then(a => console.log("a is " + a));
    // console.log("a is " + a);


    dates.forEach(date => {
        var button = document.createElement("button");
        button.id = date;
        button.innerHTML = date;
    
        // var a = document.body.appendChild(button);
        button.addEventListener('click', event => updateButtonStyle(event))
        let a = document.getElementById('selector');
        a.appendChild(button);
    })

    document.getElementById("Daily").click()

    renderGraph();

    var timesheet = document.getElementById('timesheet');

    var timesheet_data = await getTimesheetData();
    timesheet_data.forEach(function(value, _index, _arr){
        // console.log(value);
        // var row = document.createElement('div');
        var row = document.createElement('div');
        row.className = 'timesheet_row';
        var img = document.createElement('img');
        img.src = 'images/timer.png'
        var title = document.createElement('span');
        title.id = 'title';
        title.innerHTML = value.title;
        var spacer = document.createElement('span');
        spacer.id = 'spacer';
        var time = document.createElement('span');
        time.id = 'time';
        time.innerHTML = formatTimeToHour(value.time).replace(/\d+/g, function(v){
            return "<span class='numbers'>" + v + "</span>";
        });
    
        row.appendChild(img);
        row.appendChild(title);
        row.appendChild(spacer);
        row.appendChild(time);
    
        timesheet.appendChild(row);
    })

    var whitelist = await getWhitelist();
    document.getElementById("whitelist_editor").innerHTML = whitelist.join(", ");
    document.getElementById("whitelist_button").onclick = saveWhitelist;
};

function saveWhitelist() {
    var whitelist = document.getElementById("whitelist_editor").value.split(',');
    for (var i = 0; i < whitelist.length; i++) {
        whitelist[i] = whitelist[i].trim();
    }
    updateWhitelist(whitelist);
}

function generateStatistics(titleString, totalTime, timeDiff) {
    console.log(titleString, totalTime, timeDiff)
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
    icon.src = 'images/timer.png'

    
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

function updateButtonStyle(event) {
    // console.log(event.target.id);
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
    } else {
        retrieveWeeklyData();
    }
}




// Render the graph
async function renderGraph() {
    range_selector = document.getElementById('date_range');
    date_range_selection.forEach(function(value) {
        var option = document.createElement('option');
        option.text = value;
        option.value = value;
        // option.style.lineHeight = '27px';
        option.style.width = 'fit';
        range_selector.appendChild(option);
    })

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

    const [polarLabels, polarDataset] = await getPolarChartData();
    var ctx_polar = document.getElementById('polarChart');
    var polarChart = new Chart(ctx_polar, {
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

async function retrieveDailyData() {
    // let date = new Date();
    // let today = formatDate((date.getMonth() + 1), date.getDate(), date.getFullYear());
    // let yesterdayDate = getPreviousDays(1);
    // let yesterday = formatDate(yesterdayDate.getMonth() + 1, yesterdayDate.getDate(), yesterdayDate.getFullYear());

    totalTimeData = await getTotalTime();
    var left_container = document.getElementById('left_container');
    let left_content = generateStatistics("Total Time", totalTimeData[0], totalTimeData[1]);
    left_container.appendChild(left_content);
    
    // Add most frequent getMostFrequentTime() in procesing.js
    mostFrequentTimeData = await getMostFrequentTime();
    var right_container = document.getElementById('right_container');
    let right_content = generateStatistics("Most Frequent", mostFrequentTimeData[1], mostFrequentTimeData[2]);
    right_container.appendChild(right_content);
}

async function retrieveWeeklyData() {
    prevWeek = [];
    for (i = 0; i < 7; i++) {
        prevWeek.push(dateString(getPreviousDays(i)));
    }
    
    // console.log(prevWeek);
    weeklyTotalTimeData = await getWeeklyTotalTime(prevWeek);
    weeklyMostFrequentTimeData = await getWeeklyMostFrequentTime(prevWeek);

    var left_container = document.getElementById('left_container');
    let left_content = generateStatistics("Total Time", weeklyTotalTimeData[0], weeklyTotalTimeData[1]);
    left_container.appendChild(left_content);
    
    // Add most frequent getMostFrequentTime() in procesing.js
    mostFrequentTimeData = await getMostFrequentTime();
    var right_container = document.getElementById('right_container');
    let right_content = generateStatistics("Most Frequent", weeklyMostFrequentTimeData[1], weeklyMostFrequentTimeData[2]);
    right_container.appendChild(right_content);
}

// // @output: a array of total time, most frequently used time, and its domain
// function processDailyData(data) {
//     let sum = Object.values(data).reduce(function(accumulator, currentValue) {
//         return accumulator + currentValue;
//     }, 0);

//     var max = -1;
//     var domain = "";
//     Object.entries(data).forEach(([key, value]) => {
//         // console.log(key, value);
//         if (value > max) {
//             max = value;
//             domain = key;
//         }
//     });

//     return [sum, max, domain];
// }

// @input: month: the month to be formatted, 0-indexed
// @input: day: the day of the month
// @input: year: the full year representation
// @output: formatted date string in "month/day/year"
function formatDate(month, day, year) {
    return month + "/" + day + "/" + year;
}


function formatTimeToHour(second) {
    console.log(second)
    let hour = Math.trunc(second / 3600);
    let minute = Math.abs(Math.ceil((second % 3600) / 60));
    return hour + 'H' + minute + 'MIN';
}

function formatTimeToMinute(second) {
    var formattedString = second < 0 ? "" : "+";
    let minute = Math.floor(second / 60);
    return formattedString + minute + "min";
}

function getPreviousDays(prev) {
    const today = new Date()
    const yesterday = new Date(today)
    
    return new Date(yesterday.setDate(today.getDate() - prev));
}

// function weeklyTotalTime(prevWeek) {
//     getDomainsForWeek(prevWeek)
//     .then(data => {
//         var left_container = document.getElementById('left_container');
//         var left_content = generateStatistics("Total Time", data, 0);
//         left_container.appendChild(left_content);
//     });
// }

// function weeklyMostFrequent(prevWeek) {
//     getMostFrequentForWeek(prevWeek).then(data => {
//         // console.log(JSON.stringify(data));
//         let mostFrequent = data === undefined ? 0 : Object.entries(data).reduce((a, b) => b[1] > a[1] ? b : a);
//         var right_container = document.getElementById('right_container');
//         let right_content = generateStatistics("Most Frequent", mostFrequent[1], 0);
//         right_container.appendChild(right_content);
//     });
// }