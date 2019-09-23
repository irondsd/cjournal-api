const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const validate = require('../helpers/validate')
let { timestamp } = require('../helpers/timestamp')
let { updateLastSeen } = require('../helpers/updateLastSeen')
let { taskMarkCompleted } = require('../helpers/taskMarkCompleted')

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

    sql =
        `select id, activity_id, users_id, doctor_id, activity_type, time_started, time_ended, tasks_id, set_deleted, data${uploaded} from virtual_activity where users_id = ` +
        req.params.uid +
        timeframe +
        deleted +
        doctor_id

    console.log(sql)
    db.all(sql, function(err, rows) {
        if (err) {
            res.status(500).send({
                error: err
            })
        }
        if (Array.isArray(rows)) for (el of rows) el.id = 'v' + el.id

        res.send(rows)
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

    let query = `select id, activity_id, users_id, doctor_id, activity_type, time_started, time_ended, tasks_id, data${uploaded}, set_deleted from virtual_activity where activity_id = ${req.params.aid} and users_id = ${req.params.uid}${deleted} ${doctor_id}`

    if (req.params.aid.includes('v'))
        query = `select id, activity_id, users_id, doctor_id, activity_type, time_started, time_ended, tasks_id, data${uploaded}, set_deleted from virtual_activity where id = ${req.params.aid.substring(
            1
        )} and users_id = ${req.params.uid}${deleted} ${doctor_id}`
    console.log(query)
    db.all(query, (err, rows) => {
        if (err) {
            return res.status(500).send(err)
        }
        if (rows.length > 0) {
            for (el of rows) el.id = 'v' + el.id
            return res.send(rows[0])
        } else {
            return res.status(404).send()
        }
    })
})

router.post('/:uid/virtual_activity', (req, res) => {
    // TODO: make virtua; activity validation

    if (req.body.activity_id === 'undefined') delete req.body.activity_id

    if (req.body.activity_id) {
        let check = `select id from virtual_activity where activity_id = '${req.body.activity_id}' and doctor_id = '${req.body.doctor_id}' and deleted = '0'`
        console.log(check)
        db.all(check, function(err, rows) {
            console.log(rows)
            if (err) {
                res.status(500).send({
                    error: err
                })
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

router.put('/:uid/virtual_activity/:aid', (req, res) => {
    // TODO: checks

    if (req.body.activity_id === 'undefined') delete req.body.activity_id

    updateVirtualActivity(req, res)
})

function postVirtualActivity(req, res) {
    let sql = `insert into virtual_activity(activity_id, users_id, doctor_id, activity_type, time_started, data, tasks_id, time_ended, last_updated, uploaded, set_deleted) values
                           ('${req.body.activity_id}', '${req.params.uid}', '${req.body.doctor_id}', '${
        req.body.activity_type
    }', '${req.body.time_started}', '${JSON.stringify(req.body.data)}', '${
        req.body.tasks_id ? req.body.tasks_id : null
    }', '${req.body.time_ended ? req.body.time_ended : null}', '${req.body.last_updated}', '${timestamp()}', '${
        req.body.set_deleted ? req.body.set_deleted : 0
    }')`
    db.run(sql, function(err, rows) {
        if (err) {
            console.log(err)
        } else {
            res.status(201).send({
                id: this.lastID
            })
            if (req.body.tasks_id && req.body.data.successful) {
                taskMarkCompleted(req.body.tasks_id)
            }
        }
    })
}

function updateVirtualActivity(req, res) {
    let id_type = 'id'
    let id = req.params.aid.substring(1)

    if (req.body.activity_id) {
        id = req.body.activity_id
        id_type = 'activity_id'
    }

    let queryPreserve = `insert into virtual_activity (activity_id, users_id, doctor_id,
         activity_type, time_started, time_ended, tasks_id, ref_id, last_updated, data, deleted, uploaded, set_deleted) SELECT activity_id, users_id, doctor_id, activity_type, time_started, time_ended, tasks_id, ref_id, last_updated, data, 1, uploaded, set_deleted FROM virtual_activity where ${id_type} = '${id}' and doctor_id = ${req.body.doctor_id}`
    db.run(queryPreserve, (err, rows) => {
        if (err) {
            console.log(err)
        } else {
            let sql = `update virtual_activity set activity_type = '${req.body.activity_type}', time_started = '${
                req.body.time_started
            }', time_ended = '${req.body.time_ended}', data = '${JSON.stringify(req.body.data)}', last_updated = '${
                req.params.last_updated
            }', ref_id = '${id}', uploaded = '${timestamp()}', set_deleted = '${
                req.body.set_deleted ? req.body.set_deleted : 0
            }' where ${id_type} = ${id}`

            console.log(sql)
            db.run(sql, function(err, rows) {
                if (err) {
                    res.status(400).send({
                        error: err
                    })
                } else {
                    db.run(
                        `update virtual_activity set ref_id = '${this.lastID}' where activity_id = ${id}`,
                        (err, rows) => {
                            console.log('added ref id')
                        }
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
        sql = `update virtual_activity set deleted = '1' where id = '${req.params.aid.substring(1)}'`
    console.log(sql)
    db.run(sql, function(err, rows) {
        if (err) {
            res.status(400).send({
                error: err
            })
        }
        if (this.changes) {
            res.status(200).send()
        } else {
            res.status(404).send(rows)
        }
    })
})

module.exports = router
