var exec = require("child_process").exec;
var queryString = require('querystring');
var fs = require('fs');
var utility = require('./utility');

var dirSentinel = {};
var lastWatch = null

var startWatch = function (path, directory) {
    
    fs.watch(path, {persistent: true}, function(event, filename) {  
        var newDate = new Date();   
        if (!lastWatch || (newDate.getTime() - lastWatch.getTime() > 400)) {  //Fix for the mnultiple prints in file
            console.log( filename, 'is', event);
            if (filename) {
                //console.log('filename provided: ' + filename);
            } else {
                console.log('filename not provided');
            }
            console.log('directorio ' + directory + ' modificado');

            if (!dirSentinel.hasOwnProperty(directory)) { 
                dirSentinel[directory] = {}
            }

            if (dirSentinel.hasOwnProperty('message')) {
                dirSentinel.message = '';
            }

            dirSentinel[directory].isModified = true;
            dirSentinel[directory].dateModified = new Date().getTime();

            console.dir(dirSentinel);
            lastWatch = new Date ();
        }
    });
}

var iniciar = function (response, postData, queryObj) {
    console.log('Manipulador de petición iniciar ha sido llamado');
    var text;

    fs.readdir('project', function(err, files) { 
        if (err) throw err;
        if (files) { 
            console.dir(files);
            for (var i=0; i<files.length; i++) { 

                var check = function (filename) {
                   fs.stat('project/' + filename, function(err, stats) { 
                    if (stats.isDirectory()) { 
                            console.log("watching " + filename);
                            startWatch('project/' + filename, filename);
                        }
                    });
                }(files[i]);
            } 
        }
    });



    response.writeHead(200, {"Content-Type": "text/html"});
    response.write('FileWatcher');
    response.end();
}

var subir = function (response, dataPosteada) {
    console.log('Manipulador de peticion "subir" fue llamado.');
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write('Tu enviaste: ' + queryString.parse(dataPosteada)["text"]);
    response.end();
}

var getDirStatus =  function (response, postData, queryObj) {

    var jsonString = '';
    console.dir(queryObj);

    if (utility.isEmpty(dirSentinel)) {
        dirSentinel.message = "No modified directories";
    }

    jsonString = queryObj.hasOwnProperty('callback') ? (queryObj.callback + '(' + JSON.stringify(dirSentinel) + ')') : JSON.stringify(dirSentinel);
    response.writeHead(200, {"Content-Type": "application/javascript"});
    response.write(jsonString);
    response.end();
    
}

exports.iniciar = iniciar;
exports.subir = subir;
exports.getDirStatus = getDirStatus;