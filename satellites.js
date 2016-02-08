/* global process */
/* global __dirname */
var http    = require('http'),
    fs      = require('fs'),
    request = require('request'),
    mkdirp  = require('mkdirp'),
    path    = require('path');

var SatellitePrototype = {
    constructor: function (name, fetch) {
        this._name = name;
        this.fetch = fetch;
        this._latest = new Date(0);
        this._imagepath = __dirname + path.sep + 'images' + path.sep + name
        mkdirp(this._imagepath, function(err) {
            if(err) {
                console.log('Error: could not create image path for: ' + name)
                process.exit(1);   
            }
        });
    },
    name : function() { return this._name },
    latest : function() { return this._latest },
    imagepath : function() { return this._imagepath },
    updateLatest : function() { this._latest = Date.now() }
};

var discover = Object.create(SatellitePrototype);
discover.constructor('dscovr', function(callback) {
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
            if(records && (SatellitePrototype.latest.call(discover) < Date.parse(records[records.length - 1].date))) {
                var imagename = records[records.length - 1].image + '.jpg'
                var uri = 'http://epic.gsfc.nasa.gov/epic-archive/jpg/' + imagename;
                var filename = SatellitePrototype.imagepath.call(discover) + path.sep + imagename
                request.head(uri, function(err, res, img) {
                    if(err) { callback(err) }
                    console.log('content-type:', res.headers['content-type']);
                    console.log('content-length:', res.headers['content-length']);
                    console.log('writing to: ', filename);
                    
                    var r = request(uri).pipe(fs.createWriteStream(filename));
                    r.on('error', function() { callback('error with download') })
                    r.on('close', function() {
                        fs.stat(filename, function(err, stat) {
                            if(stat.size > 0) {
                                SatellitePrototype.updateLatest.call(discover);
                                callback(null, filename)
                            } else {
                                callback('filesize is 0')
                            }
                        });
                    });
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