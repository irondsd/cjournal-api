function log(message) {
    var timestamp = new Date();
    console.log(message)
    const fs = require('fs')
    fs.appendFile('log.txt', timestamp.toString().slice(4, 24) + ' : ' + message + '\n', function (err) {
        if (err) console.log(err)
    })
}

module.exports = log