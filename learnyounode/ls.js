
var fs = require('fs');
fs.readdir(process.argv[2], function callback(err, list) {
    if (err) {
        console.log("error readdir");
    } else {
        list = list.filter(function(item) {
            return (item.indexOf('.') !== -1 && item.split('.').pop() == process.argv[3]);
        });
        console.log(list.join('\n'));
    }
});

