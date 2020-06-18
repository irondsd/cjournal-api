const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const errors = require('../helpers/errors')
const log = require('../helpers/logger')
const objectify = require('../helpers/objectify')
const stringSanitizer = require('../helpers/stringSanitizer')
const intSanitizer = require('../helpers/intSanitizer')
const { timestamp } = require('../helpers/timestamp')

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
                res.send(rows)
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

router.post('/:idinv/activity', (req, res) => {
    let aid = stringSanitizer(req.body.id)
    let query = `select activity_type from activity where id = '${aid}' limit 1`

    log.debug(query)
    db.get(query, function (err, rows) {
        if (err) {
            log.error(`idinv post internal error ${err}`)
            return errors.internalError(res)
        } else {
            if (rows) {
                return res.status(208).send()
            }

            // check and sanitize values
            let users_id = intSanitizer(req.body.users_id)
            let activity_type = stringSanitizer(req.body.activity_type)
            let idinv = stringSanitizer(req.body.idinv)
            let time_started = intSanitizer(req.body.time_started)
            let utc_offset = req.body.utc_offset ? intSanitizer(req.body.utc_offset) : null
            let time_ended = req.body.time_ended ? intSanitizer(req.body.time_ended) : null
            let tasks_id = req.body.tasks_id ? intSanitizer(req.body.tasks_id) : null
            let version = req.body.version ? intSanitizer(req.body.version) : 1
            let comment = req.body.comment ? stringSanitizer(req.body.comment) : ''
            let data = req.body.data ? req.body.data : {}
            let last_updated = req.body.last_updated
                ? intSanitizer(req.body.last_updated)
                : timestamp()

            // set to NULL
            time_ended === null ? (time_ended = 'NULL') : (time_ended = `'${time_ended}'`)
            utc_offset === null ? (utc_offset = 'NULL') : (utc_offset = `'${utc_offset}'`)
            tasks_id === null ? (tasks_id = 'NULL') : (tasks_id = `'${tasks_id}'`)

            // in case data is a json string
            if (typeof req.body.data === 'string')
                try {
                    data = JSON.parse(req.body.data)
                } catch (error) {
                    data = {}
                }

            // check for attached files
            if (req.files) {
                last_updated = timestamp() // because we changed data just now.
                if (req.files.audio) data.audio = req.files.audio[0].path.replace('\\', '/')
                if (req.files.image) data.image = req.files.image[0].path.replace('\\', '/')
            }
            data = JSON.stringify(data)

            query = `insert into activity(id, users_id, activity_type, time_started, utc_offset, comment, data, tasks_id, time_ended, version, last_updated, uploaded, idinv) values
            ('${aid}', '${users_id}', '${activity_type}', '${time_started}', ${utc_offset}, '${comment}', '${data}', ${tasks_id}, ${time_ended}, '${version}', '${last_updated}', '${timestamp()}', '${idinv}')`

            log.debug(query)
            db.run(query, function (err, rows) {
                if (err) {
                    log.error(`post activity internal error ${err}`)
                    return errors.internalError(res)
                } else {
                    res.status(201).send()
                    if (tasks_id && tasks_id !== 'NULL') {
                        taskMarkCompleted(tasks_id, aid)
                    }
                }
            })
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
