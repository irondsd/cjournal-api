const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const validate = require('../validate')

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
            res.status(500).send(err)
        }
        res.send(rows)
    })
})

router.post('/:id/activity', (req, res) => {
    if (!validate.activity_record(req)) {
        return res.status(400).send()
    }

    db.run(`insert into activity(users_id, activity_type, time_started, duration, data) values 
            ('${req.params.id}', '${req.body.activity_type}', '${req.body.time_started}', '${req.body.duration}', '${req.body.data}')`, (err, rows) => {
            if (err) {
                log(err)
            }
            else {
                res.status(201).send(rows)
            }
        })
})

router.put('/:uid/activity/:aid', (req, res) => {
    if (!validate.activity_record(req)) {
        return res.status(400).send()
    }

    let sql = `update activity set activity_type = '${req.body.activity_type}', time_started = '${req.body.time_started}', duration = '${req.body.duration}', data = '${req.body.data}' where id = ${req.params.aid}`
    db.run(sql, (err, rows) => {
        if (err) {
            console.log(err)
        }
        else {
            res.status(201).send(rows)
        }
    })
})

// Put request is to add the data and can be done only by the user. No doctor or admin can change the original information
// All the changes should be made in virtual activity

module.exports = router;