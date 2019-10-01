const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
let { timestamp } = require('../helpers/timestamp')
const errors = require('../helpers/errors')
const log = require('../helpers/logger')
const validateTask = require('../middleware/validateTask')

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
    // console.log(sql)
    db.all(sql, (err, rows) => {
        if (err) {
            log(`tasks internal error ${err}`)
            return errors.internalError(res)
        }
        res.send(rows)
    })
})

router.get('/:uid/tasks/:tid', (req, res) => {
    query = `select id, users_id, activity_type, time, last_updated, ref_id, completed, deleted, data from tasks where id = ${req.params.tid} and users_id = ${req.params.uid}`

    // console.log(query)
    db.all(query, (err, rows) => {
        if (err) {
            log(`tasks internal error ${err}`)
            return errors.internalError(res)
        }
        if (rows.length > 0) {
            return res.send(rows[0])
        } else {
            log(`get tasks not found ${req.params.tid}`)
            return errors.notFound(res)
        }
    })
})

router.post('/:id/tasks', validateTask, (req, res, next) => {
    if (!validate.task_record(req)) {
        return res.status(400).send({ error: 'Not enough data' })
    }
    sql = `insert into tasks(users_id, activity_type, time, completed, last_updated, data) values 
            ('${req.params.id}', '${req.body.activity_type}', '${
        req.body.time
    }', '0', '${timestamp()}', '${JSON.stringify(req.body.data)}')`
    // console.log(sql)
    db.run(sql, function(err, rows) {
        if (err) {
            log(`tasks internal error ${err}`)
            return errors.internalError(res)
        } else {
            res.status(201).send({
                id: this.lastID
            })
        }
    })
})

router.put('/:uid/tasks/:aid', validateTask, (req, res, next) => {
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
            log(`tasks internal error ${err}`)
            return errors.internalError(res)
        } else {
            // console.log('preserved row')
        }
    })

    let sql
    if (req.body.completed) {
        sql = `update tasks set activity_type = '${req.body.activity_type}', time = '${req.body.time}', completed = '${req.body.completed}', last_updated = '${last_updated}', ref_id = '${req.params.aid}' where id = ${req.params.aid}`
    } else {
        sql = `update tasks set activity_type = '${req.body.activity_type}', time = '${
            req.body.time
        }', last_updated = '${timestamp()}', data = '${JSON.stringify(req.body.data)}', ref_id = '${
            req.params.aid
        }' where id = ${req.params.aid}`
    }
    // console.log(sql)
    db.run(sql, (err, rows) => {
        if (err) {
            log(`tasks internal error ${err}`)
            return errors.internalError(res)
        } else {
            db.run(`update tasks set ref_id = '${this.lastID}' where id = ${req.params.aid}`, (err, rows) => {
                // console.log('added ref id')
            })
            res.status(201).send(rows)
        }
    })
})

router.delete('/:uid/tasks/:aid', (req, res) => {
    if (!req.params.aid) {
        return errors.incompleteInput(res)
    }

    let sql = `update tasks set deleted = '1', last_updated = '${timestamp()}' where id = '${req.params.aid}'`
    db.run(sql, (err, rows) => {
        if (err) {
            log(`tasks internal error ${err}`)
            return errors.internalError(res)
        } else {
            res.status(204).send(rows)
        }
    })
})

module.exports = router
