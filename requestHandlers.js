var exec = require("child_process").exec;
var queryString = require('querystring');
var fs = require('fs');

var iniciar = function (response, postData) {
    console.log('Manipulador de petición iniciar ha sido llamado');
    var text;
    console.log('Watching project');

    fs.watch('project', {persistent: true}, function(event, filename) { 
        console.log("event " + event);
            if (filename) {
                console.log('filename provided: ' + filename);
            } else {
                console.log('filename not provided');
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