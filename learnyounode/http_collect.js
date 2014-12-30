

var http = require('http');
var bl = require('bl');

var url = process.argv[2];

http.get(url, function callback(response) {

    response.pipe(bl(function(err, data) {
        if (err) {
            console.log('error');
        } else {
            console.log(data.toString().length);
            console.log(data.toString());
        }
    }));

});



