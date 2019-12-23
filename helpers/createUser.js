const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const errors = require('../helpers/errors')
const log = require('../helpers/logger')
let { timestamp } = require('./timestamp')

module.exports = async (username, access_token, refresh_token) => {
    return new Promise((resolve, reject) => {
        query = `INSERT OR IGNORE INTO users (username, access_token, refresh_token, idinv, last_seen, language, permissions, hide_elements) VALUES ('${username}', '${access_token}', '${refresh_token}', '', '${timestamp()}', 'ru', '1', '[]')`
        log.debug(query)
        db.run(query, function(err, rows) {
            if (err) reject(err)
            else {
                let query = `insert into prescriptions (users_id, course_therapy, relief_of_attack, tests) values ('${this.lastID}', '[]', '[]', '[]')`
                log.debug(query)
                db.all(query, (err, rows) => {
                    if (err) console.log(err)
                })
                resolve()
            }
        })
    })
}
