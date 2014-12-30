

var http = require('http');
var bl = require('bl');

var url1 = process.argv[2];
var url2 = process.argv[3];
var url3 = process.argv[4];

var data_ret = ["", "", ""];
var data1 = "";
var data2 = "";
var data3 = "";

var done1 = false;
var done2 = false;
var done3 = false;

/*
http.get(url1, callback_wrapper(data1));
*/

function callback_wrapper(index) {
    return function callback(response) {

        response.pipe(bl(function(err, data) {
            if (err) {
                console.error('error');
            } else {
                data_ret[index] += data.toString();
            }
        }));

        response.on("end", function callback() {
            if (data_ret[0] && data_ret[1] && data_ret[2]) {
                data_ret.forEach(function (data) {
                    console.log(data);
                });
            }
        });
    }
}


http.get(url1, callback_wrapper(0));
http.get(url2, callback_wrapper(1));
http.get(url3, callback_wrapper(2));

