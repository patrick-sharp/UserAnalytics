
const dates = ['Daily', 'Weekly'];

let timesheet_data = [
    {
        icon:'a',
        title:'b',
        times:'c',
    },
    {
        icon:'a',
        title:'d',
        times:'e',
    },
    {
        icon:'a',
        title:'f',
        times:'g',
    }
]

var curTimeList = [];
var prevTimeList = [];

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


window.onload = function() {

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

    var timesheet = document.getElementById('timesheet');

    timesheet_data.forEach(function(value, _index, _arr){
        // console.log(value);
        // var row = document.createElement('div');
        var row = document.createElement('div');
        row.className = 'timesheet_row';
        var img = document.createElement('img');
        img.src = 'images/timer.png'
        var title = document.createElement('span');
        title.id = 'title';
        title.innerHTML = 'youtube.com';
        var spacer = document.createElement('span');
        spacer.id = 'spacer';
        var time = document.createElement('span');
        time.id = 'time';
        time.innerHTML = '10H28MIN'.replace(/\d+/g, function(v){
            return "<span class='numbers'>" + v + "</span>";
        });
    
        row.appendChild(img);
        row.appendChild(title);
        row.appendChild(spacer);
        row.appendChild(time);
    
        timesheet.appendChild(row);})

        renderGraph();
};

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
function renderGraph() {
    range_selector = document.getElementById('date_range');
    date_range_selection.forEach(function(value) {
        var option = document.createElement('option');
        option.text = value;
        option.value = value;
        // option.style.lineHeight = '27px';
        option.style.width = 'fit';
        range_selector.appendChild(option);
    })
    var ctx_line = document.getElementById("lineChart");
    var lineChart = new Chart(ctx_line, {
                            type: 'bar',
                            data: {
                                labels: Array.from({length: 7}, (_, i) => i + 1),
                                datasets: [
                                    {
                                    data: [{x: 1, y: 24}, {x: 1, y: 10}],
                                    backgroundColor: ['#CFF0C4', '#5AC43B'],
                                    borderRadius: 16,
                                    barThickness: 24,
                                    grouped: false
                                }, {
                                    data: [{x: 2, y: 24}, {x: 2, y: 8}],
                                    backgroundColor: ['#CFF0C4', '#5AC43B'],
                                    borderRadius: 16,
                                    barThickness: 24,
                                    grouped: false
                                }, {
                                    data: [{x: 3, y: 24}, {x: 3, y: 12}],
                                    backgroundColor: ['#CFF0C4', '#5AC43B'],
                                    borderRadius: 16,
                                    barThickness: 24,
                                    grouped: false
                                }, {
                                    data: [{x: 4, y: 24}, {x: 4, y: 6}],
                                    backgroundColor: ['#CFF0C4', '#5AC43B'],
                                    borderRadius: 16,
                                    barThickness: 24,
                                    grouped: false
                                }, {
                                    data: [{x: 5, y: 24}, {x: 5, y: 16}],
                                    backgroundColor: ['#CFF0C4', '#5AC43B'],
                                    borderRadius: 16,
                                    barThickness: 24,
                                    grouped: false
                                }, {
                                    data: [{x: 6, y: 24}, {x: 6, y: 4}],
                                    backgroundColor: ['#CFF0C4', '#5AC43B'],
                                    borderRadius: 16,
                                    barThickness: 24,
                                    grouped: false
                                }, {
                                    data: [{x: 7, y: 24}, {x: 7, y: 16}],
                                    backgroundColor: ['#CFF0C4', '#5AC43B'],
                                    borderRadius: 16,
                                    barThickness: 24,
                                    grouped: false
                                }

                            ]
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

    const labels = ['Red', 'Orange', 'Yellow', 'Green', 'Blue'];
    var ctx_polar = document.getElementById('polarChart');
    var polarChart = new Chart(ctx_polar, {
        type: 'polarArea',
        data: {
            labels: labels,
            datasets: [
            {
                label: 'Dataset 1',
                data: [1,2,3,4,5],
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

function retrieveDailyData() {
    let date = new Date();
    let today = formatDate((date.getMonth() + 1), date.getDate(), date.getFullYear());
    let yesterdayDate = getPreviousDays(1);
    let yesterday = formatDate(yesterdayDate.getMonth() + 1, yesterdayDate.getDate(), yesterdayDate.getFullYear());

    getDomainsForDay(today)
        .then(data => processDailyData(data))
        .then(data => {
            curTimeList = data;
            generateStatistics()
        });
    
    getDomainsForDay(yesterday)
        .then(data => processDailyData(data))
        .then(data => {
            prevTimeList = data;

            var left_container = document.getElementById('left_container');
            var left_content = generateStatistics("Total Time", curTimeList[0], curTimeList[0] - prevTimeList[0]);
            left_container.appendChild(left_content);
        
            var right_container = document.getElementById('right_container');
            let right_content = generateStatistics("Most Frequent", curTimeList[1], curTimeList[1] - prevTimeList[1]);
            right_container.appendChild(right_content);
        });
}

function retrieveWeeklyData() {
    prevWeek = [];
    for (i = 0; i < 7; i++) {
        let date = getPreviousDays(i)
        prevWeek.push( formatDate(date.getMonth() + 1, date.getDate(), date.getFullYear()) );
    }
    
    console.log(prevWeek);
    weeklyTotalTime(prevWeek);
    weeklyMostFrequent(prevWeek);
}

// @output: a array of total time, most frequently used time, and its domain
function processDailyData(data) {
    let sum = Object.values(data).reduce(function(accumulator, currentValue) {
        return accumulator + currentValue;
    }, 0);

    var max = -1;
    var domain = "";
    Object.entries(data).forEach(([key, value]) => {
        // console.log(key, value);
        if (value > max) {
            max = value;
            domain = key;
        }
    });

    return [sum, max, domain];
}

// @input: month: the month to be formatted, 0-indexed
// @input: day: the day of the month
// @input: year: the full year representation
// @output: formatted date string in "month/day/year"
function formatDate(month, day, year) {
    return month + "/" + day + "/" + year;
}


function formatTimeToHour(second) {
    let hour = Math.trunc(second / 3600);
    let minute = Math.abs(Math.ceil(second % 60));
    // console.log(minute);
    return hour + 'H' + minute + 'MIN';
}

function formatTimeToMinute(second) {
    var formattedString = second < 0 ? "-" : "+";
    let minute = Math.floor(second / 60);
    return formattedString + minute + "min";
}

function getPreviousDays(prev) {
    const today = new Date()
    const yesterday = new Date(today)
    
    return new Date(yesterday.setDate(today.getDate() - prev));
}

function weeklyTotalTime(prevWeek) {
    getDomainsForWeek(prevWeek)
    .then(data => {
        var left_container = document.getElementById('left_container');
        var left_content = generateStatistics("Total Time", data, 0);
        left_container.appendChild(left_content);
    });
}
function weeklyMostFrequent(prevWeek) {
    getMostFrequentForWeek(prevWeek).then(data => {
        // console.log(JSON.stringify(data));
        let mostFrequent = data === undefined ? 0 : Object.entries(data).reduce((a, b) => b[1] > a[1] ? b : a);
        var right_container = document.getElementById('right_container');
        let right_content = generateStatistics("Most Frequent", mostFrequent[1], 0);
        right_container.appendChild(right_content);
    });
}