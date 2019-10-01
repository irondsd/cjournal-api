let { timestamp } = require('./timestamp')
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const log = require('./logger')

function updateLastSeen(id) {
    let query = `update users set last_seen = '${timestamp()}' where id = ${id}`
    db.run(query, function(err) {
        if (err) {
            log(`internal error update last seen need inspection ${err}`)
        }
        if (this.changes) {
            // log(`updated user ${id} last seen`)
        } else {
            log(`error updating user ${id} last seen`)
        }
    })
}

module.exports.updateLastSeen = updateLastSeen
