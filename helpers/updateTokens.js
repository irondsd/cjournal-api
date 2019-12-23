const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const errors = require('../helpers/errors')
const log = require('../helpers/logger')
let { timestamp } = require('./timestamp')

module.exports = async (username, access_token, refresh_token) => {
    return new Promise((resolve, reject) => {
        query = `update users set access_token = '${access_token}', refresh_token = '${refresh_token}', last_seen = '${timestamp()}' where username = '${username}'`
        log.debug(query)
        db.all(query, (err, rows) => {
            if (err) reject(err)
            else resolve()
        })
    })
}
