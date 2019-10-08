const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
let { timestamp } = require('../helpers/timestamp')
const errors = require('../helpers/errors')
const log = require('../helpers/logger')
const validateTask = require('../middleware/validateTask')
const stringSanitizer = require('../helpers/stringSanitizer')

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

        if (Array.isArray(rows)) for (el of rows) el.data = JSON.parse(el.data)

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
            for (el of rows) el.data = JSON.parse(el.data)
            return res.send(rows[0])
        } else {
            log(`get tasks not found ${req.params.tid}`)
            return errors.notFound(res)
        }
    })
})

router.post('/:id/tasks', validateTask, (req, res, next) => {
    let users_id = parseInt(req.params.id)
    let activity_type = stringSanitizer(req.body.activity_type)
    let time = parseInt(req.body.time)
    let data = JSON.stringify(req.body.data)

    sql = `insert into tasks(users_id, activity_type, time, completed, last_updated, data) values 
            ('${users_id}', '${activity_type}', '${time}', '0', '${timestamp()}', '${data}')`
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
    let user_id = parseInt(req.params.uid)
    let id = parseInt(req.params.aid)
    let activity_type = stringSanitizer(req.body.activity_type)
    let time = parseInt(req.body.time)
    let completed = req.body.completed ? parseInt(req.body.completed) : false
    let data = req.body.data ? req.body.data : {}

    let queryPreserve = `insert into tasks (users_id, activity_type, time, completed, ref_id, last_updated, data, deleted) SELECT users_id, activity_type, time, completed, ref_id, ${timestamp()}, data, 1 FROM tasks where id = '${id}'`
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
        sql = `update tasks set activity_type = '${activity_type}', time = '${time}', completed = '${completed}', last_updated = '${last_updated}', ref_id = '${aid}' where id = ${aid}`
    } else {
        sql = `update tasks set activity_type = '${activity_type}', time = '${time}', last_updated = '${timestamp()}', data = '${data}', ref_id = '${id}' where id = ${id}`
    }
    // console.log(sql)
    db.run(sql, (err, rows) => {
        if (err) {
            log(`tasks internal error ${err}`)
            return errors.internalError(res)
        } else {
            db.run(`update tasks set ref_id = '${this.lastID}' where id = ${id}`, (err, rows) => {
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
            log(`delete tasks internal error ${err}`)
            return errors.internalError(res)
        } else {
            res.status(204).send(rows)
        }
    })
})

// undelete
router.patch('/:uid/tasks/:aid', (req, res) => {
    if (!req.params.aid) {
        return errors.incompleteInput(res)
    }

    let sql = `update tasks set deleted = '0', last_updated = '${timestamp()}' where id = '${req.params.aid}'`
    db.run(sql, (err, rows) => {
        if (err) {
            log(`undelete tasks internal error ${err}`)
            return errors.internalError(res)
        } else {
            res.status(204).send(rows)
        }
    })
})

module.exports = router
