var bodyParser = require('body-parser')

module.exports = function(app, con) { //exports the function

    app.use(bodyParser.urlencoded({ extended: true }));

    app.get('/', function(req, res) {
        //index route
        res.render('index'); //render the ejs view for index page
    });

    app.get('/light/detail', function(req, res) {
        //light detail page route
        con.query("SELECT * FROM `light` ORDER BY `date` DESC", function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;
            res.render('lightDetail', {
                //render the ejs view for light detail page
                items: result, //send the data from database to the light detail page
            });
        });
    });

    app.get('/moisture/detail', function(req, res) {
        //moisture detail page route
        con.query("SELECT * FROM `soilMoisture` ORDER BY `date` DESC", function(err, result) {
            //select all moisture sensor value and time from the database
            if (err) throw err;
            res.render('moistureDetail', {
                //render the ejs view for moisture detail page
                items: result, //send the data from database to the light detail page
            });
        });
    });



}