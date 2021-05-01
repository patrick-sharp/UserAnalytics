// generate date selection buttons
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

let date_range_selection = ['Last 7 Days', 'Last 14 Days', 'Last Month'];


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

// Make the settings button clickable
document.getElementById("setting").addEventListener("click", openSettingPanel);
document.getElementById("setting_close_button").addEventListener("click", closeSettingPanel);

window.onload = function() {
    var display = document.getElementById("display");
    var left_container = document.getElementById('left_container');
    let left_content = generateStatistics("Total Time");
    left_container.appendChild(left_content);

    // var separator = document.

    var right_container = document.getElementById('right_container');
    let right_content = generateStatistics("Most Frequent");
    right_container.appendChild(right_content);

    // display.appendChild(left_container);
    // display.appendChild(right_container);

    dates.forEach(date => {
        var button = document.createElement("button");
        button.id = date;
        button.innerHTML = date;
    
        // var a = document.body.appendChild(button);
        button.addEventListener('click', updateButtonStyle)
        let a = document.getElementById('selector');
        a.appendChild(button);
    })

    document.getElementById("Daily").click()

    var timesheet = document.getElementById('timesheet');

    timesheet_data.forEach(function(value, _index, _arr){
        console.log(value);
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
};

function updateButtonStyle(event) {
    console.log(event.target.id);
    var button = document.getElementById(event.target.id)
    button.style.borderRadius = '10px';
    button.style.color = '#5AC43B'
    button.style.backgroundColor = '#DCFFCF'
    button.style.border = '1px solid #5AC43B'
    button.style.boxSizing = 'border-box'

    let i = dates.filter(d => d != event.target.id)[0];
    document.getElementById(i).removeAttribute('style');
}

function generateStatistics(titleString) {

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
    let comparison = document.createElement('span');
    comparison.id = 'comparison';

    title.innerHTML = titleString;
    title.style.fontSize = '24px';
    title.style.color = '#000000'
    icon.src = 'images/timer.png'
    time.innerHTML = (5 + 'H' + 24 + 'MIN').replace(/\d+/g, function(v){
        return "<span class='numbers'>" + v + "</span>";
    });

    comparison.innerHTML = ('+' + 5 + 'min' + ' compared to yesterday').replace(/(\+|\-)\d+(min)/, function(v) {
        return (v.includes('+') ? "<span class='comp_plus'>" : "<span class='comp_minus'>")  + v + "</span>";});

    timeContainer.appendChild(time);
    timeContainer.appendChild(comparison);

    content_container.appendChild(icon);
    content_container.appendChild(timeContainer);

    container.appendChild(title);
    container.appendChild(content_container);

    return container;
}

function updateButtonStyle(event) {
    console.log(event.target.id);
    var button = document.getElementById(event.target.id)
    button.style.borderRadius = '10px';
    button.style.color = '#5AC43B'
    button.style.backgroundColor = '#DCFFCF'
    button.style.border = '1px solid #5AC43B'
    button.style.boxSizing = 'border-box'

    let i = dates.filter(d => d != event.target.id)[0];
    document.getElementById(i).removeAttribute('style');
}




// Render the graph
range_selector = document.getElementById('date_range');
date_range_selection.forEach(function(value) {
    var option = document.createElement('option');
    option.text = value;
    option.value = value;
    // option.style.lineHeight = '27px';
    option.style.width = 'fit';
    range_selector.appendChild(option);
})
var ctx = document.getElementById("myChart");
var myChart = new Chart(ctx, {
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