let mqtt = require('mqtt'); //require mqtt package
let client = mqtt.connect('mqtt:mqtt.eclipse.org:1883'); //connect to the broker

//set the topic 
var topic = [
    'garden/monitor/system/light',
    'garden/monitor/system/moisture',
    'garden/monitor/system/pump',
]

client.on('connect', function() {
    console.log('concted to a broker...'); //console log when server is success
    topic.forEach(function(value, index) {
        client.subscribe(value, function(err) {
            console.log('subscribed to topic : ' + value); //display the subscribed topic
        })

    });

})

client.on('message', function(topic, message) {
    // message is Buffer
    console.log('topic : ' + topic + ' message : ' + message.toString()) //show th message

})