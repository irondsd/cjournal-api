let { timestamp } = require('./timestamp')
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')

function taskMarkCompleted(tasks_id) {
    let sql = `update tasks set completed = '1', last_updated = '${timestamp()}' where id = ${tasks_id}`
    db.run(sql, function(err) {
        if (err) {
            console.log(err)
        }
        if (this.changes) {
            console.log(`marked task ${tasks_id} as completed`)
        } else {
            console.log('whatever')
        }
    })
}

module.exports.taskMarkCompleted = taskMarkCompleted
