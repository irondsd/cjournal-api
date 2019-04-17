const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const validate = require('../validate')
let { timestamp } = require('../timestamp')

// TODO: possibly distinguish if there's no data or there is no user on get data request
// TODO: better error managing i.e. send explataion with 404

router.get('/:uid/tasks', (req, res) => {
    let timeframe = ``
    if (req.query.from) {
        timeframe += ` and time_started > ${req.query.from} `
    }
    if (req.query.to) {
        timeframe += ` and time_started < ${req.query.to} `
    }
    let deleted = ` and deleted = `
    if (req.query.deleted == 1) {
        deleted += `${req.query.deleted}`
    } else if (req.query.deleted == 'all') {
        deleted = ''
    } else {
        deleted += '0'
    }

    sql =
        'select id, users_id, activity_type, time, completed, last_updated from tasks where users_id = ' +
        req.params.uid +
        timeframe +
        deleted

    // sql = 'select * from tasks where users_id = ' + req.params.uid + ' ' + timeframe + completed
    console.log(sql)
    db.all(sql, (err, rows) => {
        if (err) {
            res.status(500).send({
                error: err
            })
        }
        res.send(rows)
    })
})

router.post('/:id/tasks', (req, res) => {
    if (!validate.task_record(req)) {
        return res.status(400).send({ error: 'Not enough data' })
    }
    sql = `insert into tasks(users_id, activity_type, time, completed, last_updated) values 
            ('${req.params.id}', '${req.body.activity_type}', '${req.body.time}', '0', '${timestamp()}')`
    console.log(sql)
    db.run(sql, function(err, rows) {
        if (err) {
            console.log(err)
        } else {
            res.status(201).send()
        }
    })
})

router.put('/:uid/tasks/:aid', (req, res) => {
    if (!validate.task_record(req)) {
        return res.status(400).send({
            error: 'Did not receive enough information',
            example: {
                activity_type: 'Walking',
                time: 1552401333,
                completed: false
            }
        })
    }
    let queryPreserve = `insert into tasks (users_id, activity_type, time, completed, last_updated, deleted) SELECT users_id, activity_type, time, completed, ${timestamp()}, 1 FROM tasks where id = '${
        req.params.aid
    }'`
    db.run(queryPreserve, (err, rows) => {
        if (err) {
            console.log(err)
        } else {
            console.log('preserved row')
        }
    })

    let sql
    if (req.body.completed) {
        sql = `update tasks set activity_type = '${req.body.activity_type}', time = '${req.body.time}', completed = '${
            req.body.completed
        }', last_updated = '${last_updated}' where id = ${req.params.aid}`
    } else {
        sql = `update tasks set activity_type = '${req.body.activity_type}', time = '${
            req.body.time
        }', last_updated = '${timestamp()}' where id = ${req.params.aid}`
    }

    db.run(sql, (err, rows) => {
        if (err) {
            res.status(400).send({
                error: err
            })
        } else {
            res.status(201).send(rows)
        }
    })
})

router.delete('/:uid/tasks/:aid', (req, res) => {
    if (!req.params.aid) {
        return res.status(400).send({
            error: 'Did not receive enough information'
        })
    }

    let sql = `update tasks set deleted = '1', last_updated = '${timestamp()}' where id = '${req.params.aid}'`
    db.run(sql, (err, rows) => {
        if (err) {
            res.status(400).send({
                error: err
            })
        } else {
            res.status(204).send(rows)
        }
    })
})

module.exports = router
