
var lsmod = require('./lsmod.js');
lsmod(process.argv[2], process.argv[3], function callback(err, list) {
        if (err) {
            console.log("error lsmod");
        } else {
            console.log(list.join('\n'));
        }
    });

