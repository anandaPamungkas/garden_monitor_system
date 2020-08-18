var express = require('express'); //express package
var mysql = require('mysql'); //mysql package

var app = express(); //express function

app.set('view engine', 'ejs'); //view engine

var port = 3000 //server port

var server = app.listen(port, function() {
    //setup a server in port 3000
    console.log('listening to request on port ' + port);
    console.log('url:http://localhost:' + port);
});

var con = mysql.createConnection({
    //database config
    host: 'localhost',
    user: 'database_username',
    password: 'database_password',
    database: 'database_name'
});

var sensorController = require('./controllers/sensorController.js'); //sensor controller
var websocket = require(__dirname + '/websocket.js'); //websocket


//Static files
app.use(express.static('public'));
app.use('/chartjs', express.static(__dirname + '/node_modules/chart.js/dist/Chart.min.js')); //chartjs library
app.use('/styles', express.static(__dirname + '/public/styles.css')); //stylesheet
app.use('/script', express.static(__dirname + '/public/script.js')); //script



sensorController(app, con); //call sensorController
websocket(server, con); //call websocket
