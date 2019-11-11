const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const validateActivity = require('../middleware/validateActivity')
const { timestamp } = require('../helpers/timestamp')
const { taskMarkCompleted } = require('../helpers/taskMarkCompleted')
const { saveAudio } = require('../middleware/saveAudio')
const errors = require('../helpers/errors')
const log = require('../helpers/logger')
const stringSanitizer = require('../helpers/stringSanitizer')
const intSanitizer = require('../helpers/intSanitizer')

router.get('/:uid/activity', (req, res) => {
    let timeframe = ``
    if (req.query.from) {
        timeframe += ` and time_started > ${req.query.from} `
    }
    if (req.query.to) {
        timeframe += ` and time_started < ${req.query.to} `
    }
    let deleted = ` and deleted = 0`
    if (req.query.deleted == 1) {
        deleted = ` and deleted = 1`
    } else if (req.query.deleted == 'all') {
        deleted = ''
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

    sql =
        `select id, users_id, activity_type, time_started, time_ended, tasks_id, ref_id, last_updated, comment, data${uploaded}${version} from activity where users_id = ` +
        req.params.uid +
        timeframe +
        deleted
    if (req.query.limit) {
        let page = 0
        if (req.query.page) page = req.query.page * req.query.limit
        sql =
            `select id, users_id, activity_type, time_started, time_ended, tasks_id, ref_id, last_updated, comment, data${uploaded}${version} from activity where users_id = ` +
            req.params.uid +
            timeframe +
            deleted +
            ` order by time_started desc limit ${page}, ${req.query.limit}`
    }
    // console.log(sql)
    db.all(sql, function(err, rows) {
        if (err) {
            log(`get all activity internal error ${err}`)
            return errors.internalError(res)
        }
        try {
            if (Array.isArray(rows)) for (el of rows) el.data = JSON.parse(el.data)
        } catch (error) {
            log(`error parsing json data from activity ${error}`)
        }

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
    query = `select id, users_id, activity_type, time_started, time_ended, tasks_id, ref_id, last_updated, comment, data${uploaded}${version} from activity where id = ${req.params.aid} and users_id = ${req.params.uid}${deleted}`

    db.all(query, (err, rows) => {
        if (err) {
            log(`get id activity internal error ${err}`)
            return errors.internalError(res)
        }
        if (rows.length > 0) {
            try {
                for (el of rows) el.data = JSON.parse(el.data)
            } catch (error) {
                log(`error parsing json data from activity id ${rows[0].id}, data = ${rows[0].data}`)
            }
            return res.send(rows[0])
        } else {
            return errors.notFound(res)
        }
    })
})

router.post('/:uid/activity', saveAudio, validateActivity, (req, res, next) => {
    let users_id = intSanitizer(req.params.uid)
    let activity_type = stringSanitizer(req.body.activity_type)
    let time_started = intSanitizer(req.body.time_started)
    let time_ended = req.body.time_ended ? `'${intSanitizer(req.body.time_ended)}'` : 'NULL'
    let tasks_id = req.body.tasks_id ? `'${intSanitizer(req.body.tasks_id)}'` : 'NULL'
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

    if (req.file) {
        data.audio = req.file.path.replace('\\', '/')
        last_updated = timestamp() // because we changed data just now.
    }
    data = JSON.stringify(data)

    let sql = `insert into activity(users_id, activity_type, time_started, comment, data, tasks_id, time_ended, version, last_updated, uploaded) values 
            ('${users_id}', '${activity_type}', '${time_started}', '${comment}', '${data}', ${tasks_id}, ${time_ended}, '${version}', '${last_updated}', '${timestamp()}')`

    // console.log(sql)
    db.run(sql, function(err, rows) {
        if (err) {
            log(`post activity internal error ${err}`)
            return errors.internalError(res)
        } else {
            res.status(201).send({
                id: this.lastID
            })
            if (tasks_id && tasks_id !== 'NULL' && !req.body.data.failed) {
                taskMarkCompleted(tasks_id, this.lastID)
            }
        }
    })
})

router.put('/:uid/activity/:aid', saveAudio, validateActivity, (req, res, next) => {
    let users_id = intSanitizer(req.params.uid)
    let activity_type = stringSanitizer(req.body.activity_type)
    let time_started = intSanitizer(req.body.time_started)
    let time_ended = req.body.time_ended ? `'${intSanitizer(req.body.time_ended)}'` : 'NULL'
    let tasks_id = req.body.tasks_id ? `'${intSanitizer(req.body.tasks_id)}'` : 'NULL'
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

    if (req.file) {
        data.audio = req.file.path.replace('\\', '/')
        last_updated = timestamp() // because we changed data just now.
    }
    data = JSON.stringify(data)

    let queryPreserve = `insert into activity (users_id, activity_type, time_started, time_ended, tasks_id, ref_id, last_updated, comment, data, deleted, version, uploaded) SELECT users_id, activity_type, time_started, time_ended, tasks_id, ref_id, last_updated, comment, data, 1, version, uploaded FROM activity where id = '${req.params.aid}'`
    db.run(queryPreserve, (err, rows) => {
        if (err) {
            log(`put preserve activity internal error ${err}`)
            return errors.internalError(res)
        } else {
            // console.log('preserved row')
        }
    })
    let sql = `update activity set activity_type = '${activity_type}', time_started = '${time_started}', 
    time_ended = ${time_ended}, comment = '${comment}', data = '${data}', last_updated = '${last_updated}', 
    ref_id = '${req.params.aid}', uploaded = '${timestamp()}', tasks_id = ${tasks_id} where id = ${req.params.aid}`
    console.log(sql)
    db.run(sql, function(err, rows) {
        if (err) {
            log(`put activity internal error ${err}`)
            return errors.internalError(res)
        } else {
            db.run(`update activity set ref_id = '${this.lastID}' where id = ${req.params.aid}`, (err, rows) => {
                // console.log('added ref id')
            })
            res.status(201).send({
                id: req.params.aid
            })
            if (tasks_id && tasks_id !== 'NULL' && !req.body.data.failed) {
                console.log(tasks_id, req.body.tasks_id)
                console.log(tasks_id !== 'NULL')
                console.log(req.body)
                taskMarkCompleted(tasks_id, req.params.aid)
            }
        }
    })
})

router.delete('/:uid/activity/:aid', (req, res) => {
    let sql = `update activity set deleted = '1', uploaded = '${timestamp()}' where id = '${req.params.aid}'`
    db.run(sql, function(err, rows) {
        if (err) {
            log(`delete activity internal error ${err}`)
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
    let sql = `update activity set deleted = '0', uploaded = '${timestamp()}' where id = '${req.params.aid}'`
    db.run(sql, function(err, rows) {
        if (err) {
            log(`undelete activity internal error ${err}`)
            return errors.internalError(res)
        }
        if (this.changes) {
            res.status(200).send()
        } else {
            errors.notFound(res)
        }
    })
})

// Put request is to add the data and can be done only by the user. No doctor or admin can change the original information
// All the changes should be made in virtual activity

module.exports = router
