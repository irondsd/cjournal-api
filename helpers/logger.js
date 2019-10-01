function log(message) {
    var timestamp = new Date()
    console.log(message)
    const fs = require('fs')
    fs.appendFile('debug.log', timestamp.toString().slice(4, 24) + ' : ' + message + '\n', function(err) {
        if (err) console.log(`logger error need inspection ${err}`)
    })
}

module.exports = log
