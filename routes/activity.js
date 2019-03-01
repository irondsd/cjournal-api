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

// No put or delete requests here. Original data will always remain. 
// All the changes can be made in virtual activity

module.exports = router;