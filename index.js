var express     = require('express'),
    bodyParser  = require('body-parser'),
    schedule    = require('node-schedule'),
    wallpaper   = require('wallpaper');
    
var satellites  = require('./satellites.js');
var app         = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 9690;

var router = express.Router();

var settings = {
    satellite : satellites.discover,
    cron : '*/3 * * * * *'
}

console.log("satellites: " + JSON.stringify(satellites))

var job = schedule.scheduleJob(settings.cron, showMeTheEarth);

router.get('/', function(req, res) {
    res.json(settings);   
});

router.post('/', function(req, res) {
    settings.satellite = satellites[req.body.satellite]
    settings.cron = req.body.cron
    job.cancel();
    job = schedule.scheduleJob(settings.cron, showMeTheEarth)
    res.json(settings);
})

app.use('/settings', router);

app.listen(port);

function showMeTheEarth() {
    console.log("running: " + settings.satellite.name())
    settings.satellite.fetch(function(err, imagepath) {
        if(err) {
            console.log(err)
        } else {
            wallpaper.set(imagepath)
        }
    });
}