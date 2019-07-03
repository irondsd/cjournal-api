let { timestamp } = require('./timestamp')
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')

function updateLastSeen(id) {
    let query = `update users set last_seen = '${timestamp()}' where id = ${id}`
    db.run(query, function(err) {
        if (err) {
            console.log(err)
        }
        if (this.changes) {
            console.log('updated last seen')
        } else {
            console.log('error, need inspection')
        }
    })
}

module.exports.updateLastSeen = updateLastSeen
