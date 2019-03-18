const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const validate = require('../validate')

// TODO: possibly distinguish if there's no data or there is no user on get data request
// TODO: better error managing i.e. send explataion with 404

router.get('/:uid/tasks', (req, res) => {
    let timeframe = ``
    let completed = ``
    if (req.query.from) {
        timeframe += ` and time_started > ${req.query.from} `
    }
    if (req.query.to) {
        timeframe += ` and time_started < ${req.query.to} `
    }
    if (req.query.completed) {
        completed = `and completed = '${req.query.completed}'`
    }

    sql = 'select * from tasks where users_id = ' + req.params.uid + ' ' + timeframe + completed
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

router.post('/:id/tasks', (req, res) => {
    if (!validate.task_record(req)) {
        return res.status(400).send()
    }
    sql = `insert into tasks(users_id, activity_type, time, duration, completed) values 
            ('${req.params.id}', '${req.body.activity_type}', '${req.body.time}', '${req.body.duration}', '0')`
    console.log(sql)
    db.run(sql, function (err, rows) {
        if (err) {
            console.log(err)
        }
        else {
            res.status(201).send()
        }
    })
})

router.put('/:uid/tasks/:aid', (req, res) => {
    if (!validate.task_record(req)) {
        return res.status(400).send({
            error: 'Did not receive enough information',
            example: {
                "activity_type": "Walking",
                "time": 1552401333,
                "duration": 360,
                "completed": false
            }
        })
    }
    let sql
    if (req.body.completed) {
        sql = `update tasks set activity_type = '${req.body.activity_type}', time = '${req.body.time}', duration = '${req.body.duration}', completed = '${req.body.completed}' where id = ${req.params.aid}`
    }
    else {
        sql = `update tasks set activity_type = '${req.body.activity_type}', time = '${req.body.time}', duration = '${req.body.duration}', where id = ${req.params.aid}`
    }

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

router.delete('/:uid/tasks/:aid', (req, res) => {
    if (!req.params.aid) {
        return res.status(400).send({
            error: 'Did not receive enough information',
        })
    }

    let sql = `delete from tasks where id = '${req.params.aid}'`
    db.run(sql, (err, rows) => {
        if (err) {
            res.status(400).send({
                error: err
            })
        }
        else {
            res.status(204).send(rows)
        }
    })
})

module.exports = router