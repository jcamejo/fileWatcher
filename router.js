var route = function (handle, pathname, response, postData, queryObj){
    console.log('A punto de rutear una petición para ' + pathname);
    if (typeof handle[pathname] === 'function') {
        return handle[pathname](response, postData, queryObj);
    } else {
        
        console.log("No request handler found for " + pathname);
        response.writeHead(404, {"Content-Type": "text/html"});
        response.write("404 not found");
        response.end();
    }
}

exports.route = route;