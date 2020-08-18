var mosca = require('mosca'); //require mosca library local mqtt broker
let settings = {
    port: 5000 //mqtt port
};

let server = new mosca.Server(settings); //make mosca instance

server.on('clientConnected', function(client) {
    //console log whe broker connection success
    console.log('client connected', client.id);
});


server.on('published', function(packet, client) {
    //console log the pacet when client published message to broker
    console.log('Published', packet.payload);
});

server.on('ready', setup);


function setup() {
    //console log when server is ready
    console.log('Mosca server is up and running');
}