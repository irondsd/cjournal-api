const fs = require('fs')

function log(type, message, silent = true) {
    var timestamp = new Date()
    if (!silent) console.log(message)
    fs.appendFile(
        `./logs/${type.toLowerCase()}.log`,
        `${type} : ${timestamp.toString().slice(4, 24)} : ${message}\n`,
        function(err) {
            if (err) console.log(`logger error need inspection ${err}`)
        },
    )
}

exports.debug = function debug(message) {
    log('DEBUG', message, false)
}

exports.info = function info(message) {
    log('INFO', message, false)
}

exports.error = function error(message) {
    log('ERROR', message, false)
}
