function openSettingPanel() {
    document.getElementById("setting_panel").style.width = "50%";
    document.getElementById("main").style.marginLeft = "50%";
    document.body.style.backgroundColor = "rgba(0,0,0,0.25)";
}

function closeSettingPanel() {
    document.getElementById("setting_panel").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    document.body.style.backgroundColor = '#F2F0EB'
}

// Make the settings button clickable
document.getElementById("setting").addEventListener("click", openSettingPanel);

// Render the graph
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