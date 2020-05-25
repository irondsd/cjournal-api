const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const errors = require('../helpers/errors')
const log = require('../helpers/logger')
const objectify = require('../helpers/objectify')

router.get('/:idinv/user', (req, res) => {
    query = `select * from users inner join 
prescriptions on users.id = prescriptions.users_id where users.idinv = '${req.params.idinv}'`
    log.debug(query)
    db.all(query, (err, rows) => {
        if (err) {
            log.error(`idinv internal error ${err}`)
            return errors.internalError(res)
        } else {
            if (rows.length > 0) {
                objectify.all(rows)
                res.send(rows[0])
            } else {
                errors.notFound(res)
            }
        }
    })
})

router.get('/:idinv/activity', (req, res) => {
    query = `select id, users_id, activity_type, time_started, utc_offset, time_ended, tasks_id, idinv, last_updated, comment, data from activity where idinv = '${req.params.idinv}' and deleted = '0'`
    log.debug(query)
    db.all(query, (err, rows) => {
        if (err) {
            log.error(`idinv internal error ${err}`)
            return errors.internalError(res)
        } else {
            if (rows.length > 0) objectify.dataRows(rows)
            res.send(rows)
        }
    })
})

router.get('/:idinv/virtual_activity', (req, res) => {
    query = `select id, users_id, doctor_id, activity_type, time_started, utc_offset, time_ended, tasks_id, idinv, last_updated, comment, data, set_deleted from virtual_activity where idinv = '${req.params.idinv}' and deleted = '0'`
    log.debug(query)
    db.all(query, (err, rows) => {
        if (err) {
            log.error(`idinv internal error ${err}`)
            return errors.internalError(res)
        } else {
            if (rows.length > 0) objectify.dataRows(rows)
            res.send(rows)
        }
    })
})

router.get('/:idinv/tasks', (req, res) => {
    query = `select * from tasks where idinv = '${req.params.idinv}' and deleted = '0'`
    log.debug(query)
    db.all(query, (err, rows) => {
        if (err) {
            log.error(`idinv internal error ${err}`)
            return errors.internalError(res)
        } else {
            if (rows.length > 0) objectify.dataRows(rows)
            res.send(rows)
        }
    })
})

module.exports = router
