const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const validateActivity = require('../middleware/validateActivity')
const { timestamp } = require('../helpers/timestamp')
const { taskMarkCompleted } = require('../helpers/taskMarkCompleted')
const { saveFiles } = require('../middleware/saveFiles')
const errors = require('../helpers/errors')
const log = require('../helpers/logger')
const stringSanitizer = require('../helpers/stringSanitizer')
const intSanitizer = require('../helpers/intSanitizer')
const objectify = require('../helpers/objectify')

router.get('/:uid/activity', (req, res) => {
    let timeframe = ``
    if (req.query.from) {
        timeframe += ` and time_started >= ${req.query.from} `
    } else if (req.query.fromchanged) {
        timeframe += ` and last_updated >= ${req.query.fromchanged} `
    }
    if (req.query.to) {
        timeframe += ` and last_updated <= ${req.query.to} `
    } else if (req.query.tochanged) {
        timeframe += ` and last_updated <= ${req.query.tochanged} `
    }
    let deleted = ` and deleted = 0`
    let selectDeleted = ''
    if (req.query.deleted == 1) {
        deleted = ` and deleted = 1`
        selectDeleted = ', deleted'
    } else if (req.query.deleted == 'all') {
        deleted = ''
        selectDeleted = ', deleted'
    }
    let uploaded = ``
    if (req.query.uploaded) {
        uploaded = `, uploaded`
    }
    let version = ``
    if (req.query.version) {
        version = `, version`
    }

    let page = ``

    let id = intSanitizer(req.params.uid)

    sql =
        `select id, users_id, activity_type, time_started, time_ended, utc_offset, tasks_id${selectDeleted}, idinv, ref_id, last_updated, comment, data${uploaded}${version} from activity where users_id = ` +
        id +
        timeframe +
        deleted
    if (req.query.limit) {
        let page = 0
        if (req.query.page) page = req.query.page * req.query.limit
        sql =
            `select id, users_id, activity_type, time_started, time_ended, utc_offset, tasks_id, ref_id, last_updated, comment, data${uploaded}${version} from activity where users_id = ` +
            id +
            timeframe +
            deleted +
            ` order by time_started desc limit ${page}, ${req.query.limit}`
    }
    log.debug(sql)
    db.all(sql, function (err, rows) {
        if (err) {
            log.error(`get all activity internal error ${err}`)
            return errors.internalError(res)
        }

        objectify.dataRows(rows)

        return res.send(rows)
    })
})

router.get('/:uid/activity/:aid', (req, res) => {
    let uploaded = ``
    if (req.query.uploaded) {
        uploaded = `, uploaded`
    }
    let version = ``
    if (req.query.version) {
        version = `, version`
    }
    let deleted = ` and deleted = 0`
    if (req.query.deleted == 1) {
        deleted = ` and deleted = 1`
    } else if (req.query.deleted == 'all') {
        deleted = ''
    }

    let id = intSanitizer(req.params.uid)
    let aid = stringSanitizer(req.params.aid)

    query = `select id, users_id, activity_type, time_started, time_ended, utc_offset, tasks_id, ref_id, last_updated, comment, data${uploaded}${version} from activity where id = '${aid}' and users_id = ${id}${deleted}`

    db.all(query, (err, rows) => {
        if (err) {
            log.error(`get id activity internal error ${err}`)
            return errors.internalError(res)
        }
        if (rows.length > 0) {
            objectify.dataRows(rows)
            return res.send(rows[0])
        } else {
            return errors.notFound(res)
        }
    })
})

router.post('/:uid/activity', saveFiles, validateActivity, (req, res, next) => {
    let aid = stringSanitizer(req.body.id)
    let users_id = intSanitizer(req.params.uid)
    let activity_type = stringSanitizer(req.body.activity_type)
    let time_started = intSanitizer(req.body.time_started)
    let utc_offset = req.body.utc_offset ? intSanitizer(req.body.utc_offset) : null
    let time_ended = req.body.time_ended ? intSanitizer(req.body.time_ended) : null
    let tasks_id = req.body.tasks_id ? intSanitizer(req.body.tasks_id) : null
    let version = req.body.version ? intSanitizer(req.body.version) : 1
    let comment = req.body.comment ? stringSanitizer(req.body.comment) : ''
    let data = req.body.data ? req.body.data : {}
    let last_updated = req.body.last_updated ? intSanitizer(req.body.last_updated) : timestamp()

    // form-data doesn't allow to send objects
    if (typeof req.body.data === 'string')
        try {
            data = JSON.parse(req.body.data)
        } catch (error) {
            data = {}
        }

    if (req.files) {
        last_updated = timestamp() // because we changed data just now.
        if (req.files.audio) data.audio = req.files.audio[0].path.replace('\\', '/')
        if (req.files.image) data.image = req.files.image[0].path.replace('\\', '/')
    }
    data = JSON.stringify(data)

    time_ended === null ? (time_ended = 'NULL') : (time_ended = `'${time_ended}'`)
    utc_offset === null ? (utc_offset = 'NULL') : (utc_offset = `'${utc_offset}'`)
    tasks_id === null ? (tasks_id = 'NULL') : (tasks_id = `'${tasks_id}'`)

    let sql = `insert into activity(id, users_id, activity_type, time_started, utc_offset, comment, data, tasks_id, time_ended, version, last_updated, uploaded, idinv) values 
            ('${aid}', '${users_id}', '${activity_type}', '${time_started}', ${utc_offset}, '${comment}', '${data}', ${tasks_id}, ${time_ended}, '${version}', '${last_updated}', '${timestamp()}', (select idinv from users where id = '${users_id}'))`

    log.debug(sql)
    db.run(sql, function (err, rows) {
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
})

router.put('/:uid/activity/:aid', saveFiles, validateActivity, (req, res, next) => {
    let aid = stringSanitizer(req.params.aid)
    let activity_type = stringSanitizer(req.body.activity_type)
    let time_started = intSanitizer(req.body.time_started)
    let time_ended = req.body.time_ended ? intSanitizer(req.body.time_ended) : null
    let utc_offset = req.body.utc_offset ? intSanitizer(req.body.utc_offset) : null
    let tasks_id = req.body.tasks_id ? intSanitizer(req.body.tasks_id) : null
    let version = req.body.version ? intSanitizer(req.body.version) : 1
    let comment = req.body.comment ? stringSanitizer(req.body.comment) : ''
    let data = req.body.data ? req.body.data : {}
    let last_updated = req.body.last_updated ? intSanitizer(req.body.last_updated) : timestamp()
    // form-data doesn't allow to send objects
    if (typeof req.body.data === 'string')
        try {
            data = JSON.parse(req.body.data)
        } catch (error) {
            data = {}
        }

    if (req.files) {
        last_updated = timestamp() // because we changed data just now.
        if (req.files.audio) data.audio = req.files.audio[0].path.replace('\\', '/')
        if (req.files.image) data.image = req.files.image[0].path.replace('\\', '/')
    }
    data = JSON.stringify(data)

    time_ended === null ? (time_ended = 'NULL') : (time_ended = `'${time_ended}'`)
    utc_offset === null ? (utc_offset = 'NULL') : (utc_offset = `'${utc_offset}'`)
    tasks_id === null ? (tasks_id = 'NULL') : (tasks_id = `'${tasks_id}'`)

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
    ref_id = '${aid}', uploaded = '${timestamp()}', tasks_id = ${tasks_id} where id = '${aid}' and deleted = 0`
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

router.delete('/:uid/activity/:aid', (req, res) => {
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

// undelete
router.patch('/:uid/activity/:aid', (req, res) => {
    let aid = stringSanitizer(req.params.aid)
    let sql = `update activity set deleted = '0', uploaded = '${timestamp()}' where id = '${aid}'`
    log.debug(sql)
    db.run(sql, function (err, rows) {
        if (err) {
            log.error(`undelete activity internal error ${err}`)
            return errors.internalError(res)
        }
        if (this.changes) {
            res.status(200).send()
        } else {
            errors.notFound(res)
        }
    })
})

module.exports = router
