const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const validate = require('../validate')
const markComleted = require('./tasks')

router.get('/:uid/activity', (req, res) => {
    let timeframe = ``
    if (req.query.from) {
        timeframe += ` and time_started > ${req.query.from} `
    }
    if (req.query.to) {
        timeframe += ` and time_started < ${req.query.to} `
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
        'select id, users_id, activity_type, time_started, time_ended, tasks_id, last_updated, data from activity where users_id = ' +
        req.params.uid +
        timeframe +
        deleted
    console.log(sql)
    db.all(sql, (err, rows) => {
        if (err) {
            res.status(500).send({
                error: err
            })
        }
        res.send(rows)
    })
})

router.post('/:id/activity', (req, res) => {
    if (!validate.activity_record(req)) {
        return res.status(400).send()
    }

    let updated = (Date.now() / 1000) | 10
    let sql = `insert into activity(users_id, activity_type, time_started, data, tasks_id, time_ended, last_updated) values 
            ('${req.params.id}', '${req.body.activity_type}', '${req.body.time_started}', '${JSON.stringify(
        req.body.data
    )}', '${req.body.tasks_id}', '${req.body.time_ended}', ${updated})`

    // console.log(sql)
    db.run(sql, function(err, rows) {
        if (err) {
            console.log(err)
        } else {
            res.status(201).send({
                id: this.lastID
            })

            if (req.body.tasks_id) {
                taskMarkCompleted(req.body.tasks_id)
            }
        }
    })
})

function taskMarkCompleted(tasks_id) {
    let sql = `update tasks set completed = '1' where id = ${tasks_id}`
    console.log(sql)
    db.run(sql, function(err) {
        if (err) {
            console.log(err)
        }
        if (this.changes) {
            console.log('changes')
        } else {
            console.log('whatever')
        }
    })
}

router.put('/:uid/activity/:aid', (req, res) => {
    if (!validate.activity_record(req)) {
        return res.status(400).send({
            error: 'Did not receive enough information',
            example: {
                activity_type: 'Walking',
                data: '{ steps: 44, distance: 55.3, successful: true }',
                time_started: 1552401333
            }
        })
    }

    let updated = (Date.now() / 1000) | 10
    let sql = `update activity set activity_type = '${req.body.activity_type}', time_started = '${
        req.body.time_started
    }', time_ended = '${req.body.time_ended}', data = '${JSON.stringify(
        req.body.data
    )}', last_updated = '${updated}' where id = ${req.params.aid}`

    db.run(sql, (err, rows) => {
        if (err) {
            res.status(400).send({
                error: err
            })
        } else {
            res.status(201).send(rows)
        }
    })
})

router.delete('/:uid/activity/:aid', (req, res) => {
    if (false) {
        //validate api_key
        return res.status(400).send({
            error: 'Internal error'
        })
    }

    let sql = `update activity set deleted = '1' where id = '${req.params.aid}'`
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

// Put request is to add the data and can be done only by the user. No doctor or admin can change the original information
// All the changes should be made in virtual activity

module.exports = router
