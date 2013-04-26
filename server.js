var http = require("http");
var url = require("url");

var init = function (route, handle) {
    var onRequest = function (request, response) {
        
        var dataPosteada = "";
        var pathname = url.parse(request.url).pathname;

        if (pathname !== '/favicon.ico') { 
            console.log('Peticion para ' + request.url );
            
            request.setEncoding("utf8");
            request.addListener("data", function(trozoPosteado){
                dataPosteada += trozoPosteado;
                console.log('recibido trozo POST "' + trozoPosteado + "'.");
            });

            request.addListener('end', function () {
                console.log('requestUrl ' + request.url); 
                route(handle, pathname, response, dataPosteada);
            });
        }
    }

    http.createServer(onRequest).listen(8888);
    console.log("Servidor Iniciado");


    http.get("http://10.0.0.249:8888/", function(res) {
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });
}

exports.init = init;