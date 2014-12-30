

var http = require('http');
var url = require('url');
var map = require('through2-map');

var port = Number(process.argv[2]);

function parsetime(response, iso) {
    var date = new Date(iso);
    response.end(JSON.stringify({
    "hour" : date.getHours(),
    "minute" : date.getMinutes(),
    "second" : date.getSeconds()
    }));
}

function unixtime(response, iso) {
    response.end(JSON.stringify({
    "unixtime" : new Date(iso).getTime(),
    }));
}

var server = http.createServer(function (request, response) {
    
    response.writeHead(200, { 'Content-Type': 'application/json' })

    var url_dict = url.parse(request.url, true);

    if (!url_dict["query"]["iso"]) {
        console.error("no iso parameter");
    } else {
        if (url_dict["pathname"] == "/api/parsetime") {
                parsetime(response, url_dict["query"]["iso"]);
        } else if (url_dict["pathname"] == "/api/unixtime") {
            unixtime(response, url_dict["query"]["iso"]);
        } else {
            console.error("bad pathname: " + url_dict["pathname"]);
        }
    }

});

server.listen(port);


