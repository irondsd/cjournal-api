const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const validate = require('../validate')

// TODO: possibly distinguish if there's no data or there is no user on get data request
// TODO: better error managing i.e. send explataion with 404

router.get('/:id/activity', (req, res) => {
    let timeframe = ``
    if (req.query.from) {
        timeframe += ` and time_started > ${req.query.from} `
    }
    if (req.query.to) {
        timeframe += ` and time_started < ${req.query.to} `
    }

    db.all('select * from activity where users_id = ' + req.params.id + timeframe, (err, rows) => {
        if (err) {
            console.log(err)
            console.log(req)
            res.status(500).send(err)
        }
        res.send(rows)
    })
})

router.post('/:id/activity', (req, res) => {
    if (!validate.exercise_record(req)) {
        return res.status(400).send()
    }

    db.run(`insert into activity(users_id, exercise_type, time_started, duration, successful, distance, steps) values 
            ('${req.params.id}', '${req.body.exercise_type}', '${req.body.time_started}', '${req.body.duration}', '${req.body.successful}', '${req.body.distance}', '${req.body.steps}')`, (err, rows) => {
            if (err) {
                log(err)
            }
            else {
                res.status(201).send(rows)
            }
        })
})

module.exports = router;