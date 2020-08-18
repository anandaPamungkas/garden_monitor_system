/*
Backend Websocket
*/

var socket = require('socket.io'); //require socket.io package
let mqtt = require('mqtt'); //require mqtt package

module.exports = function(server, con) { //exports the function

    let client = mqtt.connect('mqtt:mqtt.eclipse.org:1883'); //connect to online broker
    //let client = mqtt.connect('mqtt:broker.hivemq.com:1883'); //connect to online broker
    //let client = mqtt.connect('mqtt:192.168.1.12:5000'); //connect to local broker

    var io = socket(server); //pass the server as socket parameter

    var topic = [
        'garden/monitor/system/moisture',
        'garden/monitor/system/light'
    ]; //mqtt topic

    var pubTopic = 'garden/monitor/system/pump';

    client.on('connect', function() {
        console.log('connected to a broker...'); //console log whe connection to broker success
        topic.forEach(function(value, index) {
            client.subscribe(value, function(err) {
                //display subscribed topic when mqtt connection to broker success
                console.log('subscribed to topic : ' + value);
            })
        });
    })

    client.on('message', function(topic, message) {
        //fire the function when message coming

        //get current date time value
        var date = new Date();
        var seconds = date.getSeconds();
        var minutes = date.getMinutes();
        var hour = date.getHours();
        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();
        var time = hour + ' : ' + minutes + ' : ' + seconds; //current time to display on front end
        var dbDateTime = year + "-" + month + "-" + day + "- " + hour + ":" + minutes + ":" + seconds; //date time to save in database

        if (topic == 'garden/monitor/system/light') {
            if (minutes % 60 == 0 && seconds == 0) {
                //save the sensor value to database every 60 minutes
                var sql = "INSERT INTO `light` (`value`, `date`) VALUES (";
                sql += "'" + message.toString() + "',";
                sql += "'" + dbDateTime + "')";
                con.query(sql, function(err, result) {
                    if (err) throw err;
                });
            }
            var data = [message.toString(), time]; //save sensor value from mqtt message and current time 
            io.sockets.emit('light', data); //send sensor value and current time to frontend websocket
        } else
        if (topic == 'garden/monitor/system/moisture') {
            if (minutes % 60 == 0 && seconds == 0) {
                //save the sensor value to database every 60 minutes
                var sql = "INSERT INTO `soilMoisture` (`value`, `date`) VALUES (";
                sql += "'" + message.toString() + "',";
                sql += "'" + dbDateTime + "')";
                con.query(sql, function(err, result) {
                    if (err) throw err;

                });
            }
            var moisture = [message.toString(), time]; //save sensor value from mqtt message and current time 
            io.sockets.emit('moisture', moisture); //send sensor value and current time to frontend websocket


            if (hour == 8 && minutes == 0 && seconds == 0 && message.toString() >= 50) {
                //at 08.00 AM if and the moisture equal or higer than 50 % turn on the pump 
                client.publish(pubTopic, 'on'); //publish the messsage
            } else if (message.toString() <= 30) {
                //always turn off the pump if moisture lower or equal to 30% 
                client.publish(pubTopic, 'off'); //publish the messsage

            }

        }


    })

    io.on('connection', function(socket) {
        socket.on('pumpOn', function() {
            //when pumpOn event emitted publih the message
            client.publish(pubTopic, 'on'); //publish the messsage
        });

        socket.on('pumpOff', function() {
            //when pumpOff event emitted publih the message
            client.publish(pubTopic, 'off'); //publish the messsage
        });
    });




}