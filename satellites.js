/* global process */
/* global __dirname */
var http    = require('http'),
    fs      = require('fs'),
    request = require('request'),
    mkdirp  = require('mkdirp'),
    path    = require('path');

var SatellitePrototype = {
    constructor: function (name, fetch) {
        this.name = name;
        this.fetch = fetch;
        this.latest = new Date(0);
        this.imagepath = __dirname + path.sep + 'images' + path.sep + name
        mkdirp(this.imagepath, function(err) {
            if(err) {
                console.log('Error: could not create image path for: ' + name)
                process.exit(1);   
            }
        });
    }
};

var discover = Object.create(SatellitePrototype);
discover.constructor('dscovr', function(callback) {
    console.log("fetching discover...");
    console.log("this: " + JSON.stringify(this));
    http.get({
        host: 'epic.gsfc.nasa.gov',
        path: '/api/images.php'
    }, function(response) {
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            var records = JSON.parse(body);
            console.log("this: " + this);
            console.log(records[records.length - 1].date)
            console.log(this.latest)
            if(records && (this.latest < Date.parse(records[records.length - 1].date))) {
                var imagename = records[records.length - 1].image + '.jpg'
                console.log('found a more recent image. downloading...')
                var uri = 'http://epic.gsfc.nasa.gov/epic-archive/jpg/' + imagename;
                var filename = this.path + path.sep + imagename
                request.head(uri, function(err, res, img) {
                    if(err) { callback(err) }
                    console.log('content-type:', res.headers['content-type']);
                    console.log('content-length:', res.headers['content-length']);
                    
                    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback(null, filename));
                })
            } else {
                callback("already have the latest")
            }
        });
    }).on('error', function(err) {
        callback(err)
    });
})


var himawari = Object.create(SatellitePrototype);
himawari.constructor('himawari-8', function() {
    console.log("fetching himawari...");
    
})

exports.discover = discover;
exports.himawari = himawari;