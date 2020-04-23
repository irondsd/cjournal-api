const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
let { timestamp } = require('../helpers/timestamp')
const errors = require('../helpers/errors')
const log = require('../helpers/logger')
const validateTask = require('../middleware/validateTask')
const stringSanitizer = require('../helpers/stringSanitizer')
const intSanitizer = require('../helpers/intSanitizer')
const objectify = require('../helpers/objectify')

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

    let completed = ` and completed = `
    if (req.query.completed == 1) {
        completed += `${req.query.completed}`
    } else if (req.query.completed == 'all') {
        completed = ''
    } else {
        completed += '0'
    }

    let id = intSanitizer(req.params.uid)

    sql =
        'select id, users_id, activity_type, time, ref_id, completed, idinv, data, last_updated from tasks where users_id = ' +
        id +
        timeframe +
        deleted +
        completed

    // sql = 'select * from tasks where users_id = ' + req.params.uid + ' ' + timeframe + completed
    log.debug(sql)
    db.all(sql, (err, rows) => {
        if (err) {
            log.error(`tasks internal error ${err}`)
            return errors.internalError(res)
        }

        objectify.dataRows(rows)

        res.send(rows)
    })
})

router.get('/:uid/tasks/:tid', (req, res) => {
    let id = intSanitizer(req.params.uid)
    query = `select id, users_id, activity_type, time, last_updated, ref_id, completed, deleted, data from tasks where id = ${req.params.tid} and users_id = ${id}`

    log.debug(query)
    db.all(query, (err, rows) => {
        if (err) {
            log.error(`tasks internal error ${err}`)
            return errors.internalError(res)
        }
        if (rows.length > 0) {
            objectify.dataRows(rows)
            return res.send(rows[0])
        } else {
            log.info(`get tasks not found ${req.params.tid}`)
            return errors.notFound(res)
        }
    })
})

router.post('/:id/tasks', validateTask, (req, res, next) => {
    let users_id = intSanitizer(req.params.id)
    let activity_type = stringSanitizer(req.body.activity_type)
    let time = intSanitizer(req.body.time)
    let data = req.body.data ? JSON.stringify(req.body.data) : '{}'

    sql = `insert into tasks(users_id, activity_type, time, completed, last_updated, data, idinv) values 
            ('${users_id}', '${activity_type}', '${time}', '0', '${timestamp()}', '${data}', (select idinv from users where id = '${users_id}'))`
    log.debug(sql)
    db.run(sql, function (err, rows) {
        if (err) {
            log.error(`tasks internal error ${err}`)
            return errors.internalError(res)
        } else {
            res.status(201).send({
                id: this.lastID,
            })
        }
    })
})

router.put('/:uid/tasks/:tid', validateTask, (req, res, next) => {
    let user_id = intSanitizer(req.params.uid)
    let id = intSanitizer(req.params.tid)
    let activity_type = stringSanitizer(req.body.activity_type)
    let time = intSanitizer(req.body.time)
    let completed = req.body.completed ? intSanitizer(req.body.completed) : false
    let data = req.body.data ? JSON.stringify(req.body.data) : '{}'

    let queryPreserve = `insert into tasks (users_id, activity_type, time, completed, ref_id, last_updated, data, deleted, idinv) SELECT users_id, activity_type, time, completed, ref_id, ${timestamp()}, data, 1, idinv FROM tasks where id = '${id}'`
    log.debug(queryPreserve)
    db.run(queryPreserve, (err, rows) => {
        if (err) {
            log.error(`tasks internal error ${err}`)
            return errors.internalError(res)
        } else {
            log.debug('preserved row')
        }
    })

    let sql
    if (req.body.completed) {
        sql = `update tasks set activity_type = '${activity_type}', time = '${time}', completed = '${completed}', last_updated = '${timestamp()}', ref_id = '${
            req.params.tid
        }' where id = ${req.params.tid}`
    } else {
        sql = `update tasks set activity_type = '${activity_type}', time = '${time}', last_updated = '${timestamp()}', data = '${data}', ref_id = '${id}' where id = ${id}`
    }
    log.debug(sql)
    db.run(sql, (err, rows) => {
        if (err) {
            log.error(`tasks internal error ${err}`)
            return errors.internalError(res)
        } else {
            db.run(`update tasks set ref_id = '${this.lastID}' where id = ${id}`, (err, rows) => {
                // log.info('added ref id')
            })
            res.status(201).send(rows)
        }
    })
})

router.delete('/:uid/tasks/:tid', (req, res) => {
    if (!req.params.tid) {
        return errors.incompleteInput(res)
    }

    let sql = `update tasks set deleted = '1', last_updated = '${timestamp()}' where id = '${
        req.params.tid
    }'`
    db.run(sql, (err, rows) => {
        if (err) {
            log.error(`delete tasks internal error ${err}`)
            return errors.internalError(res)
        } else {
            res.status(204).send(rows)
        }
    })
})

// undelete
router.patch('/:uid/tasks/:tid', (req, res) => {
    if (!req.params.tid) {
        return errors.incompleteInput(res)
    }

    let sql = `update tasks set deleted = '0', last_updated = '${timestamp()}' where id = '${
        req.params.tid
    }'`
    db.run(sql, (err, rows) => {
        if (err) {
            log.error(`undelete tasks internal error ${err}`)
            return errors.internalError(res)
        } else {
            res.status(204).send(rows)
        }
    })
})

module.exports = router
