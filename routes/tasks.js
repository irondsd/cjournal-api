const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const validate = require('../helpers/validate')
let { timestamp } = require('../helpers/timestamp')

// TODO: possibly distinguish if there's no data or there is no user on get data request
// TODO: better error managing i.e. send explataion with 404

router.get('/:uid/tasks', (req, res) => {
    let timeframe = ``
    if (req.query.from) {
        timeframe += ` and time >= ${req.query.from} `
    }
    if (req.query.to) {
        timeframe += ` and time <= ${req.query.to} `
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
        'select id, users_id, activity_type, time, ref_id, completed, data, last_updated from tasks where users_id = ' +
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

router.get('/:uid/tasks', (req, res) => {
    query =
        'select id, users_id, activity_type, time, last_updated, ref_id, completed, deleted, data from tasks where users_id = ' +
        req.params.uid

    console.log(query)
    db.all(query, (err, rows) => {
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
    sql = `insert into tasks(users_id, activity_type, time, completed, last_updated, data) values 
            ('${req.params.id}', '${req.body.activity_type}', '${req.body.time}', '0', '${timestamp()}', '${
        req.body.data
    }')`
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
    let queryPreserve = `insert into tasks (users_id, activity_type, time, completed, ref_id, last_updated, data, deleted) SELECT users_id, activity_type, time, completed, ref_id, ${timestamp()}, data, 1 FROM tasks where id = '${
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
        }', last_updated = '${timestamp()}', data = '${req.body.data}' ref_id = '${req.params.aid}' where id = ${
            req.params.aid
        }`
    }

    db.run(sql, (err, rows) => {
        if (err) {
            res.status(400).send({
                error: err
            })
        } else {
            db.run(`update tasks set ref_id = '${this.lastID}' where id = ${req.params.aid}`, (err, rows) => {
                console.log('added ref id')
            })
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
