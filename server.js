var http = require("http");
var url = require("url");
var queryString = require("querystring");

var init = function (route, handle) {
    var onRequest = function (request, response) {
        var postedData = "";
        var theUrl = url.parse(request.url);
        var pathname = theUrl.pathname;
        var queryObj = queryString.parse(theUrl.query);

        if (pathname !== '/favicon.ico') { 
            console.log('Peticion para ' + request.url );

            request.setEncoding("utf8");
            
            /*When is a post request*/
            request.addListener("data", function(dataUnit){
                postedData += dataUnit;
                console.log('recibido trozo POST "' + dataUnit + "'.");
            });       

            request.addListener('end', function () {
                route(handle, pathname, response, postedData, queryObj);
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