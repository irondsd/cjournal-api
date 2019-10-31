let { timestamp } = require('./timestamp')
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const log = require('../helpers/logger')

function taskMarkCompleted(tasks_id, activity_id) {
    query = `select data from tasks where id = ${tasks_id} limit 1`
    console.log(query)
    db.all(query, (err, rows) => {
        if (err) console.log(err)

        let data = rows[0].data
        data = JSON.parse(data)
        data['activity_id'] = activity_id
        data = JSON.stringify(data)

        query = `update tasks set completed = '1', last_updated = '${timestamp()}', data = '${data}' where id = ${tasks_id}`
        db.run(query, function(err) {
            if (err) {
                log(`internal error task mark completed need inspection ${err}`)
            }
            if (this.changes) {
                log(`marked task ${tasks_id} as completed`)
            } else {
                log(`task mark completed unchanged may need inspection`)
            }
        })
    })
}

module.exports.taskMarkCompleted = taskMarkCompleted
