let { timestamp } = require('./timestamp')
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const log = require('../helpers/logger')
// TODO: probably add activity id that completed the task
function taskMarkCompleted(tasks_id) {
    let sql = `update tasks set completed = '1', last_updated = '${timestamp()}' where id = ${tasks_id}`
    db.run(sql, function(err) {
        if (err) {
            log(`internal error task mark completed need inspection ${err}`)
        }
        if (this.changes) {
            log(`marked task ${tasks_id} as completed`)
        } else {
            log(`task mark completed unchanged may need inspection`)
        }
    })
}

module.exports.taskMarkCompleted = taskMarkCompleted
