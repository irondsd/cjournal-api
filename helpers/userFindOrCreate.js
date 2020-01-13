const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const log = require('./logger')
let { timestamp } = require('./timestamp')

module.exports = async (sub, name) => {
    return new Promise((resolve, reject) => {
        query = `select * from users where sub = '${sub}' limit 1`
        log.debug(query)
        db.all(query, function(err, rows) {
            if (err) reject(err)

            if (rows.length === 0) {
                // no user, then create
                query = `insert into users(sub, username) values('${sub}', '${name}')`
                log.debug(query)
                db.run(query, function(err, rows) {
                    if (err) reject(err)
                    let id = this.lastID

                    // create prescriptions record as well
                    query = `insert into prescriptions(users_id) values('${this.lastID}')`
                    db.run(query, function(err) {
                        if (err) reject(err)
                        resolve(id)
                    })
                })
            } else {
                // there's user with this sub
                resolve(rows[0].id)
            }
        })
    })
}
