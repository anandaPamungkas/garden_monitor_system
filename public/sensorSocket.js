/*
    Frontend Websocket
*/

var socket = io.connect("http://localhost:3000"); //Make connection between frontend and backend websocket

//Query DOM
var mq7 = document.getElementById('light-value-element');
var mq7Time = document.getElementById('light-time-element');
var moistureElement = document.getElementById('moisture-value-element');
var moistureTimeElement = document.getElementById('moisture-time-element');



var oldData1 = []; //['1000', '1101', '1130', '1190', '1200']; //emtpy array to hold chart data
var oldLabel = []; //['08:01:01', '08:01:02', '08:01:03', '08:01:04', '08:01:05']; //empty array to hold chart label

var ctx = document.getElementById('light-chart').getContext('2d'); //get the chart holder from canvas tag in html
var chart = new Chart(ctx, { //make the chart
    type: 'line', //chart type
    responsive: true,
    data: {
        labels: oldLabel, //chart labels
        datasets: [{
            label: 'light Intensity in lux', //dataset 1 legenda
            data: oldData1,
            backgroundColor: ['rgba(255, 255, 77, 0.5)'], //chart background color
            borderColor: [
                'rgb(255, 242, 0)' //chart border color
            ],
            borderWidth: 1
        }, ]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});



function addValue(data) {
    //add sensor value to the light chart
    chart.data.labels.push(data[1]); //pushing current time to the light chart
    chart.data.datasets[0].data.push(data[0]); //pushing current sensor value to light chart
    chart.update(); //update the chart
}

function removeValue() {
    //remove sensor value from the light chart
    chart.data.labels.shift(); //shifting hide first oldest value of time from the chart
    chart.data.datasets[0].data.shift(); //shifting first oldest value of sensor value from the chart
    chart.update(); //update the chart
};

var counter = 0; //chart dataset update counter

socket.on('light', function(data) {
    //get the sensor and time value from backend websocket
    addValue(data); //add value to light chart
    mq7.innerHTML = data[0]; //display current sensor value to inner html
    mq7Time.innerHTML = data[1]; //display current time to inner html
    counter = counter + 1; //add counter every receive the new sensor value
    if (counter > 10) {
        //shift hide the first value if 10 data already exist in the chart
        removeValue();
    }
});


var oldMoistureValue = []; //['56', '55', '57', '57', '55']; //emtpy array to hold chart data
var oldMoistureLabel = []; //['08:01:01', '08:01:02', '08:01:03', '08:01:04', '08:01:05']; //empty array to hold chart label

var moistureCtx = document.getElementById('moisture-chart').getContext('2d'); //get the chart holder from canvas tag in html
var moistureChart = new Chart(moistureCtx, { //make the chart
    type: 'line', //chart type
    responsive: true,
    data: {
        labels: oldMoistureLabel, //labels
        datasets: [{
            label: 'Soil Moisture in percentage', //dataset 1 legenda
            data: oldMoistureValue,
            backgroundColor: ['rgba(255, 160, 122, 0.5)'], //chart bacground color
            borderColor: [
                'rgb(126, 46, 31)' //chart borde color
            ],
            borderWidth: 1
        }, ]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});



function moistureChartAddValue(data) {
    //add sensor value to the mositure chart
    moistureChart.data.labels.push(data[1]); //pushing current time to chart
    moistureChart.data.datasets[0].data.push(data[0]); //pushing current sensor value to chart
    moistureChart.update(); //update the chart
}

function moistureChartRemoveValue() {
    moistureChart.data.labels.shift(); //shifting hide first oldest value of time from the chart
    moistureChart.data.datasets[0].data.shift(); //shifting first oldest value of sensor value from the chart
    moistureChart.update(); //update the chart
};

var moistureChartCounter = 0; //chart dataset update counter

socket.on('moisture', function(moisture) {
    //get the sensor and time value from backend websocket

    moistureChartAddValue(moisture); //add value to chart

    moistureElement.innerHTML = moisture[0]; //display current sensor value to inner html
    moistureTimeElement.innerHTML = moisture[1]; //display current time to inner html

    moistureChartCounter = moistureChartCounter + 1;
    if (moistureChartCounter > 10) {
        //shift hide the first value if 10 data already exist in the chart
        moistureChartRemoveValue();
    }

});

var pumpState = 0; //pump state

function turnPump() {
    //function to turn on/off pump

    if (pumpState == 0) {
        pumpState = 1;
        socket.emit('pumpOn'); //emit pumpOn event
        document.getElementById('pump_publish').innerText = 'Turn Off Pump'; //change the button text
    } else if (pumpState == 1) {
        pumpState = 0;
        document.getElementById('pump_publish').innerText = 'Turn On Pump'; //change the button text
        socket.emit('pumpOff'); //emit pumpOff event
    }


    return true;
}