var http = require("http");
var url = require("url");

var init = function (route, handle) {
    var onRequest = function (request, response) {
        
        var dataPosteada = "";
        var pathname = url.parse(request.url).pathname;
        if (pathname !== '/favicon.ico') { 
            console.log("hola");
            console.log('Peticion para ' + pathname + ' recibida.');
            
            request.setEncoding("utf8");
            request.addListener("data", function(trozoPosteado){
                dataPosteada += trozoPosteado;
                console.log('recibido trozo POST "' + trozoPosteado + "'.");
            });

            request.addListener('end', function () {
                
                route(handle, pathname, response, dataPosteada);
            });
        }
    }

    http.createServer(onRequest).listen(8888);
    console.log("Servidor Iniciado");
}

exports.init = init;