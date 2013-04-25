var exec = require("child_process").exec;
var queryString = require('querystring');
var fs = require('fs');

var dirSentinel = {};


var startWatch = function (path, directory) {
    fs.watch(path, {persistent: true}, function(event, filename) { 
            console.log('event' + event);
            if (filename) {
                 console.log('filename provided: ' + filename);
            } else {
                console.log('filename not provided');
            }
            console.log('directorio ' + directory + ' modificado');

            if (!dirSentinel.hasOwnProperty(directory)) { 
                dirSentinel[directory] = {}
            }

            dirSentinel[directory].isModified = true;
            dirSentinel[directory].dateModified = new Date ();

            console.dir(dirSentinel);
        
    });
}

var iniciar = function (response, postData) {
    console.log('Manipulador de petición iniciar ha sido llamado');
    var text;
    console.log('Watching project');

    fs.readdir('project', function(err, files) { 
        if (err) throw err;
        if (files) { 

            for (var i=0; i<files.length; i++) { 
                console.dir(files);
                console.log("filename " + files[i]);
                
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
    })



    response.writeHead(200, {"Content-Type": "text/html"});
    response.write('Hola');
    response.end();
}

var subir = function (response, dataPosteada) {
    console.log('Manipulador de peticion "subir" fue llamado.');
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write('Tu enviaste: ' + queryString.parse(dataPosteada)["text"]);
    response.end();
}

var createJSON =  function (response) {
    console.log('creating JSON');
    var object = {
        a: 1,
        b: 2,
        c: 3
    };
    response.write(JSON.stringify(object));
    response.end();
}

exports.iniciar = iniciar;
exports.subir = subir;
exports.createJSON = createJSON;