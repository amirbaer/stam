

var fs = require('fs');

module.exports = function dirlist(dirname, ext, callback) {

    fs.readdir(dirname, function (err, list) {
        if (err) {
            return callback(err);
        } else {
            list = list.filter(function(item) {
                return (item.indexOf('.') !== -1 && item.split('.').pop() == ext);
            });
            return callback(null, list);
        }
    });

}

