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
const { saveFiles } = require('../middleware/saveFiles')
const validateActivity = require('../middleware/validateActivity')

router.get('/:idinv/users', (req, res) => {
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

router.get('/:idinv/activity/:aid', (req, res) => {
    query = `select id, users_id, activity_type, time_started, utc_offset, time_ended, tasks_id, idinv, last_updated, comment, data from activity where id = '${req.params.aid}' and idinv = '${req.params.idinv}' and deleted = '0'`
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

router.post('/:idinv/activity', saveFiles, validateActivity, (req, res, next) => {
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

router.put('/:idinv/activity/:aid', saveFiles, validateActivity, (req, res, next) => {
    let aid = stringSanitizer(req.params.aid)
    let idinv = stringSanitizer(req.params.idinv)
    let users_id = intSanitizer(req.body.users_id)
    let activity_type = stringSanitizer(req.body.activity_type)
    let time_started = intSanitizer(req.body.time_started)
    let time_ended = req.body.time_ended ? intSanitizer(req.body.time_ended) : null
    let utc_offset = req.body.utc_offset ? intSanitizer(req.body.utc_offset) : null
    let tasks_id = req.body.tasks_id ? intSanitizer(req.body.tasks_id) : null
    let version = req.body.version ? intSanitizer(req.body.version) : 1
    let comment = req.body.comment ? stringSanitizer(req.body.comment) : ''
    let data = req.body.data ? req.body.data : {}
    let last_updated = req.body.last_updated ? intSanitizer(req.body.last_updated) : timestamp()

    time_ended === null ? (time_ended = 'NULL') : (time_ended = `'${time_ended}'`)
    utc_offset === null ? (utc_offset = 'NULL') : (utc_offset = `'${utc_offset}'`)
    tasks_id === null ? (tasks_id = 'NULL') : (tasks_id = `'${tasks_id}'`)

    // form-data doesn't allow to send objects
    if (typeof req.body.data === 'string')
        try {
            data = JSON.parse(req.body.data)
        } catch (error) {
            data = {}
        }

    // check for files
    if (req.files) {
        last_updated = timestamp() // because we changed data just now.
        if (req.files.audio) data.audio = req.files.audio[0].path.replace('\\', '/')
        if (req.files.image) data.image = req.files.image[0].path.replace('\\', '/')
    }
    data = JSON.stringify(data)

    let queryPreserve = `insert into activity (id, users_id, activity_type, time_started, time_ended, utc_offset, tasks_id, ref_id, last_updated, comment, data, deleted, version, uploaded, idinv) SELECT id, users_id, activity_type, time_started, time_ended, utc_offset, tasks_id, ref_id, last_updated, comment, data, 1, version, uploaded, idinv FROM activity where id = '${aid}' and deleted = 0`
    log.debug(queryPreserve)
    db.run(queryPreserve, (err, rows) => {
        if (err) {
            log.error(`put preserve activity internal error ${err}`)
            return errors.internalError(res)
        } else {
            log.debug('preserved row')
        }
    })
    let sql = `update activity set activity_type = '${activity_type}', time_started = '${time_started}', 
    time_ended = ${time_ended}, utc_offset = ${utc_offset}, comment = '${comment}', data = '${data}', last_updated = '${last_updated}', 
    ref_id = '${aid}', uploaded = '${timestamp()}', tasks_id = ${tasks_id} where id = '${aid}' and idinv = '${idinv}' and deleted = 0`
    log.debug(sql)
    db.run(sql, function (err, rows) {
        if (err) {
            log.error(`put activity internal error ${err}`)
            return errors.internalError(res)
        } else {
            res.status(201).send({
                id: aid,
            })
            if (tasks_id && tasks_id !== 'NULL') {
                taskMarkCompleted(tasks_id, aid)
            }
        }
    })
})

router.delete('/:idinv/activity/:aid', (req, res) => {
    let aid = stringSanitizer(req.params.aid)
    let sql = `update activity set deleted = '1', uploaded = '${timestamp()}' where id = '${aid}'`
    db.run(sql, function (err, rows) {
        if (err) {
            log.error(`delete activity internal error ${err}`)
            return errors.internalError(res)
        }
        if (this.changes) {
            res.status(200).send()
        } else {
            errors.notFound(res)
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

router.get('/:idinv/virtual_activity/:aid', (req, res) => {
    query = `select id, users_id, doctor_id, activity_type, time_started, utc_offset, time_ended, tasks_id, idinv, last_updated, comment, data, set_deleted from virtual_activity where idinv = '${req.params.idinv}' and id = '${req.params.aid}' and deleted = '0'`
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

router.delete('/:idinv/user', (req, res) => {
    query = `update users set idinv = '' where idinv = '${req.params.idinv}'`
    log.debug(query)
    db.all(query, (err, rows) => {
        if (err) {
            log.error(`idinv internal error ${err}`)
            return errors.internalError(res)
        } else {
            res.status(204).send()
        }
    })
})

module.exports = router
