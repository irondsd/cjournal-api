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
        `select id, activity_id, users_id, doctor_id, activity_type, idinv, time_started, time_ended, utc_offset, tasks_id, set_deleted, comment, data${uploaded} from virtual_activity where users_id = ` +
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
        if (Array.isArray(rows)) for (el of rows) el.id = 'v' + el.id
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

    let query = `select id, activity_id, users_id, doctor_id, activity_type, time_started, time_ended, utc_offset, tasks_id, comment, data${uploaded}, set_deleted from virtual_activity where activity_id = ${req.params.aid} and users_id = ${id}${deleted} ${doctor_id}`

    if (req.params.aid.includes('v'))
        query = `select id, activity_id, users_id, doctor_id, activity_type, time_started, time_ended, utc_offset, tasks_id, comment, data${uploaded}, set_deleted from virtual_activity where id = ${req.params.aid.substring(
            1,
        )} and users_id = ${id}${deleted} ${doctor_id}`
    log.debug(query)
    db.all(query, (err, rows) => {
        if (err) {
            log.error(`virtual internal error ${err}`)
            return errors.internalError(res)
        }
        if (rows.length > 0) {
            for (el of rows) el.id = 'v' + el.id
            objectify.dataRows(rows)
            return res.send(rows[0])
        } else {
            log.info(`get virtual id not found ${req.params.aid}`)
            return errors.notFound(res)
        }
    })
})

router.post('/:uid/virtual_activity', validateVirtual, (req, res, next) => {
    if (req.body.activity_id === 'undefined') delete req.body.activity_id

    if (req.body.activity_id) {
        let check = `select id from virtual_activity where activity_id = '${req.body.activity_id}' and doctor_id = '${req.body.doctor_id}' and deleted = '0'`
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
    } else {
        postVirtualActivity(req, res)
    }
})

router.put('/:uid/virtual_activity/:aid', validateVirtual, (req, res, next) => {
    if (req.body.activity_id === 'undefined') delete req.body.activity_id

    updateVirtualActivity(req, res)
})

function postVirtualActivity(req, res) {
    let users_id = req.params.uid
    let doctor_id = req.body.doctor_id
    let activity_id = req.body.activity_id ? `'${req.body.activity_id}'` : 'NULL'
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

    let sql = `insert into virtual_activity(activity_id, users_id, doctor_id, activity_type, time_started, utc_offset, comment, data, tasks_id, time_ended, last_updated, uploaded, set_deleted, idinv) values
                           (${activity_id}, '${
        req.params.uid
    }', '${doctor_id}', '${activity_type}', '${time_started}', ${utc_offset}, '${comment}', '${data}', ${tasks_id}, ${time_ended}, '${last_updated}', '${timestamp()}', '${
        set_deleted ? set_deleted : 0
    }', (select idinv from users where id = '${users_id}'))`
    db.run(sql, function (err, rows) {
        if (err) {
            log.error(`virtual internal error ${err}`)
            return errors.internalError(res)
        } else {
            res.status(201).send({
                id: this.lastID,
            })
        }
    })
}

function updateVirtualActivity(req, res) {
    let id_type
    let id
    let users_id = req.params.uid
    let doctor_id = req.body.doctor_id
    let activity_id = req.body.activity_id ? req.body.activity_id : null
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

    if (req.body.activity_id) {
        id = req.body.activity_id
        id_type = 'activity_id'
    } else {
        id_type = 'id'
        id = req.params.aid.substring(1)
    }

    let queryPreserve = `insert into virtual_activity (activity_id, users_id, doctor_id,
         activity_type, time_started, time_ended, utc_offset, tasks_id, ref_id, last_updated, comment, data, deleted, uploaded, set_deleted, idinv) SELECT activity_id, users_id, doctor_id, activity_type, time_started, time_ended, utc_offset, tasks_id, ref_id, last_updated, comment, data, 1, uploaded, set_deleted, idinv FROM virtual_activity where ${id_type} = ${id} and doctor_id = ${doctor_id}`
    log.debug(queryPreserve)
    db.run(queryPreserve, (err, rows) => {
        if (err) {
            log.error(`virtual internal error ${err}`)
            return errors.internalError(res)
        } else {
            let sql = `update virtual_activity set activity_type = '${activity_type}', time_started = '${time_started}', time_ended = ${time_ended}, utc_offset = ${utc_offset}, comment = '${comment}', doctor_id = '${doctor_id}', data = '${data}', last_updated = '${last_updated}', ref_id = '${id}', uploaded = '${timestamp()}', set_deleted = '${set_deleted}' where ${id_type} = ${id}`

            log.debug(sql)
            db.run(sql, function (err, rows) {
                if (err) {
                    log.error(`put virtual internal error ${err}`)
                    return errors.internalError(res)
                } else {
                    db.run(
                        `update virtual_activity set ref_id = '${this.lastID}' where activity_id = ${id}`,
                        (err, rows) => {
                            // log.info('added ref id')
                        },
                    )
                    res.status(201).send({ id: req.body.activity_id })
                }
            })
        }
    })
}

router.delete('/:uid/virtual_activity/:aid', (req, res) => {
    let sql = `update virtual_activity set deleted = '1' where activity_id = '${req.params.aid}'`

    if (req.params.aid.includes('v'))
        sql = `update virtual_activity set deleted = '1' where id = '${req.params.aid.substring(
            1,
        )}'`
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

router.patch('/:uid/virtual_activity/:aid', (req, res) => {
    let sql = `update virtual_activity set deleted = '0' where activity_id = '${req.params.aid}'`

    if (req.params.aid.includes('v'))
        sql = `update virtual_activity set deleted = '0' where id = '${req.params.aid.substring(
            1,
        )}'`
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
