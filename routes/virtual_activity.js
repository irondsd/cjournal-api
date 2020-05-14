const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
let { timestamp } = require('../helpers/timestamp')
let { taskMarkCompleted } = require('../helpers/taskMarkCompleted')
const errors = require('../helpers/errors')
const log = require('../helpers/logger')
const validateVirtual = require('../middleware/validateVirtual')
const objectify = require('../helpers/objectify')
const intSanitizer = require('../helpers/intSanitizer')

router.get('/:uid/virtual_activity', (req, res) => {
    let timeframe = ``
    if (req.query.from) timeframe += ` and time_started > ${req.query.from} `
    if (req.query.to) timeframe += ` and time_started < ${req.query.to} `

    let deleted = ` and deleted = 0`
    if (req.query.deleted == 1) deleted = ` and deleted = 1`
    else if (req.query.deleted == 'all') deleted = ''

    let uploaded = ``
    if (req.query.uploaded) uploaded = `, uploaded`

    let doctor_id = ``
    if (req.query.doctor_id) doctor_id = ` and doctor_id = ${req.query.doctor_id}`
    let id = intSanitizer(req.params.uid)
    sql =
        `select id, users_id, doctor_id, activity_type, idinv, time_started, time_ended, utc_offset, tasks_id, set_deleted, comment, data${uploaded} from virtual_activity where users_id = ` +
        id +
        timeframe +
        deleted +
        doctor_id

    log.debug(sql)
    db.all(sql, function (err, rows) {
        if (err) {
            log.error(`virtual internal error ${err}`)
            return errors.internalError(res)
        }
        objectify.dataRows(rows)

        return res.send(rows)
    })
})

router.get('/:uid/virtual_activity/:aid', (req, res) => {
    let uploaded = ``
    if (req.query.uploaded) uploaded = `, uploaded`

    let deleted = ` and deleted = 0`
    if (req.query.deleted == 1) deleted = ` and deleted = 1`
    else if (req.query.deleted == 'all') deleted = ''

    let doctor_id = ``
    if (req.query.doctor_id) doctor_id = `and doctor_id = ${req.query.doctor_id}`

    let id = intSanitizer(req.params.uid)

    let query = `select id, users_id, doctor_id, activity_type, time_started, time_ended, utc_offset, tasks_id, comment, data${uploaded}, set_deleted from virtual_activity where users_id = ${id}${deleted} ${doctor_id}`

    log.debug(query)
    db.all(query, (err, rows) => {
        if (err) {
            log.error(`virtual internal error ${err}`)
            return errors.internalError(res)
        }
        if (rows.length > 0) {
            objectify.dataRows(rows)
            return res.send(rows[0])
        } else {
            log.info(`get virtual id not found ${req.params.aid}`)
            return errors.notFound(res)
        }
    })
})

router.post('/:uid/virtual_activity', validateVirtual, (req, res, next) => {
    let check = `select id from virtual_activity where id = '${req.body.id}' and doctor_id = '${req.body.doctor_id}' and deleted = '0'`
    log.debug(check)
    db.all(check, function (err, rows) {
        if (err) {
            log.error(`virtual internal error ${err}`)
            return errors.internalError(res)
        }
        if (rows[0]) {
            return updateVirtualActivity(req, res)
        } else {
            postVirtualActivity(req, res)
        }
    })
})

router.put('/:uid/virtual_activity/:aid', validateVirtual, (req, res, next) => {
    updateVirtualActivity(req, res)
})

function postVirtualActivity(req, res) {
    let id = req.body.id
    let users_id = req.params.uid
    let doctor_id = req.body.doctor_id
    let activity_type = req.body.activity_type
    let time_started = req.body.time_started
    let time_ended = req.body.time_ended ? `'${req.body.time_ended}'` : 'NULL'
    let utc_offset = req.body.utc_offset ? intSanitizer(req.body.utc_offset) : 'NULL'
    let tasks_id = req.body.tasks_id ? `'${req.body.tasks_id}'` : 'NULL'
    let version = req.body.version ? req.body.version : 1
    let comment = req.body.comment ? req.body.comment : ''
    let data = req.body.data ? JSON.stringify(req.body.data) : '{}'
    let last_updated = req.body.last_updated ? req.body.last_updated : timestamp()
    let set_deleted = req.body.set_deleted ? req.body.set_deleted : 0

    let sql = `insert into virtual_activity(id, users_id, doctor_id, activity_type, time_started, utc_offset, comment, data, tasks_id, time_ended, last_updated, uploaded, set_deleted, idinv) values
        ('${id}', '${
        req.params.uid
    }', '${doctor_id}', '${activity_type}', '${time_started}', ${utc_offset}, '${comment}', '${data}', ${tasks_id}, ${time_ended}, '${last_updated}', '${timestamp()}', '${
        set_deleted ? set_deleted : 0
    }', (select idinv from users where id = '${users_id}'))`
    db.run(sql, function (err, rows) {
        if (err) {
            log.error(`virtual internal error ${err}`)
            return errors.internalError(res)
        } else {
            res.status(201).send()
        }
    })
}

function updateVirtualActivity(req, res) {
    let id_type
    let id = req.body.id
    let users_id = req.params.uid
    let doctor_id = req.body.doctor_id
    let activity_type = req.body.activity_type
    let time_started = req.body.time_started
    let time_ended = req.body.time_ended ? `'${req.body.time_ended}'` : 'NULL'
    let utc_offset = req.body.utc_offset ? intSanitizer(req.body.utc_offset) : 'NULL'
    let tasks_id = req.body.tasks_id ? `'${req.body.tasks_id}'` : 'NULL'
    let version = req.body.version ? req.body.version : 1
    let comment = req.body.comment ? req.body.comment : ''
    let data = req.body.data ? JSON.stringify(req.body.data) : '{}'
    let last_updated = req.body.last_updated ? req.body.last_updated : timestamp()
    let set_deleted = req.body.set_deleted ? req.body.set_deleted : 0

    let queryPreserve = `insert into virtual_activity (id, users_id, doctor_id,
         activity_type, time_started, time_ended, utc_offset, tasks_id, ref_id, last_updated, comment, data, deleted, uploaded, set_deleted, idinv) SELECT id, users_id, doctor_id, activity_type, time_started, time_ended, utc_offset, tasks_id, ref_id, last_updated, comment, data, 1, uploaded, set_deleted, idinv FROM virtual_activity where id = ${id} and doctor_id = ${doctor_id} and deleted = 0`
    log.debug(queryPreserve)
    db.run(queryPreserve, (err, rows) => {
        if (err) {
            log.error(`virtual internal error ${err}`)
            return errors.internalError(res)
        } else {
            let sql = `update virtual_activity set activity_type = '${activity_type}', time_started = '${time_started}', time_ended = ${time_ended}, utc_offset = ${utc_offset}, comment = '${comment}', doctor_id = '${doctor_id}', data = '${data}', last_updated = '${last_updated}', uploaded = '${timestamp()}', set_deleted = '${set_deleted}' where id = ${id} and doctor_id = '${doctor_id}' and deleted = 0`

            log.debug(sql)
            db.run(sql, function (err, rows) {
                if (err) {
                    log.error(`put virtual internal error ${err}`)
                    return errors.internalError(res)
                } else {
                    res.status(201).send()
                }
            })
        }
    })
}

router.delete('/:uid/virtual_activity/:aid', (req, res) => {
    let sql = `update virtual_activity set deleted = '1' where id = '${req.params.aid}'`
    log.debug(sql)
    db.run(sql, function (err, rows) {
        if (err) {
            log.error(`virtual internal error ${err}`)
            return errors.internalError(res)
        }
        if (this.changes) {
            res.status(200).send()
        } else {
            log.info(`delete virtual id not found ${req.params.id}`)
            return errors.notFound(res)
        }
    })
})

module.exports = router
