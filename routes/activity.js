const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const validate = require('../validate')
const markComleted = require('./tasks')

// TODO: possibly distinguish if there's no data or there is no user on get data request
// TODO: better error managing i.e. send explataion with 404

router.get('/:uid/activity', (req, res) => {
    let timeframe = ``
    if (req.query.from) {
        timeframe += ` and time_started > ${req.query.from} `
    }
    if (req.query.to) {
        timeframe += ` and time_started < ${req.query.to} `
    }

    sql = 'select * from activity where users_id = ' + req.params.uid + timeframe

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

    let sql


    sql = `insert into activity(users_id, activity_type, time_started, duration, data, tasks_id, time_ended) values 
            ('${req.params.id}', '${req.body.activity_type}', '${req.body.time_started}', '${req.body.duration}', '${JSON.stringify(req.body.data)}', '${req.body.tasks_id}', '${req.body.time_ended}')`


    console.log(sql)
    db.run(sql, function (err, rows) {
        if (err) {
            console.log(err)
        }
        else {
            res.status(201).send({
                id: this.lastID
            })

            if (req.body.task_id) {
                taskMarkCompleted(req.body.task_id)
            }
        }
    })
})

function taskMarkCompleted(task_id) {
    let sql = `update tasks set completed = '1' where id = ${task_id}`
    db.run(sql, function (err) {
        if (err) {
            console.log(err)
        }
        if (this.changes) {
            console.log('changes')
        }
        else {
            console.log('whatever')
        }
    })
}

router.put('/:uid/activity/:aid', (req, res) => {
    if (!validate.activity_record(req)) {
        return res.status(400).send({
            error: 'Did not receive enough information',
            example: {
                "activity_type": "Walking",
                "duration": 360,
                "data": "{ steps: 44, distance: 55.3, successful: true }",
                "time_started": 1552401333
            }
        })
    }

    let sql = `update activity set activity_type = '${req.body.activity_type}', time_started = '${req.body.time_started}', duration = '${req.body.duration}', data = '${JSON.stringify(req.body.data)}' where id = ${req.params.aid}`
    db.run(sql, (err, rows) => {
        if (err) {
            res.status(400).send({
                error: err
            })
        }
        else {
            res.status(201).send(rows)
        }
    })
})

router.delete('/:uid/activity/:aid', (req, res) => {
    if (false) { //validate api_key
        return res.status(400).send({
            error: 'ff',
        })
    }

    let sql = `delete from activity where id = '${req.params.aid}'`
    db.run(sql, function (err, rows) {
        if (err) {
            res.status(400).send({
                error: err
            })
        }
        if (this.changes) {
            res.status(200).send()
        }
        else {
            res.status(404).send(rows)
        }
    })
})

// Put request is to add the data and can be done only by the user. No doctor or admin can change the original information
// All the changes should be made in virtual activity

module.exports = router;