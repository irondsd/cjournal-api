const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const validate = require('../validate')

// TODO: match activity module

router.get('/:uid/virtual_activity', (req, res) => {
    let timeframe = ``
    if (req.query.from) {
        timeframe += ` and time_started > ${req.query.from} `
    }
    if (req.query.to) {
        timeframe += ` and time_started < ${req.query.to} `
    }

    sql = 'select * from virtual_activity where users_id = ' + req.params.uid + timeframe

    db.all(sql, (err, rows) => {
        if (err) {
            res.status(500).send(err)
        }
        res.send(rows)
    })
})

router.get('/:uid/virtual_activity/:aid', (req, res) => {
    let timeframe = ``
    if (req.query.from) {
        timeframe += ` and time_started > ${req.query.from} `
    }
    if (req.query.to) {
        timeframe += ` and time_started < ${req.query.to} `
    }

    sql = 'select * from virtual_activity where id = ' + req.params.aid + timeframe

    db.all(sql, (err, rows) => {
        if (err) {
            res.status(500).send(err)
        }
        res.send(rows)
    })
})

router.post('/:uid/virtual_activity/:aid', (req, res) => {
    if (!validate.activity_record(req)) {
        return res.status(400).send()
    }

    db.run(`insert into virtual_activity(id, users_id, activity_type, time_started, duration, data) values 
            ('${req.params.aid}', '${req.params.uid}', '${req.body.activity_type}', '${req.body.time_started}', '${req.body.duration}', '${req.body.data}')`, (err, rows) => {
            if (err) {
                console.log(err)
            }
            else {
                res.status(201).send(rows)
            }
        })
})

router.put('/:uid/virtual_activity/:aid', (req, res) => {
    if (!validate.activity_record(req)) {
        return res.status(400).send()
    }

    let sql = `update virtual_activity set id = '${req.params.aid}', activity_type = '${req.body.activity_type}', time_started = '${req.body.time_started}', duration = '${req.body.duration}', data = '${req.body.data}'`
    db.run(sql, (err, rows) => {
        if (err) {
            console.log(err)
        }
        else {
            res.status(201).send(rows)
        }
    })
})

router.delete('/:uid/virtual_activity/:aid', (req, res) => {
    db.run('delete from virtual_activity where id = ' + req.params.aid, function (err) {
        if (err) {
            return res.status(500).send(err)
        }
        if (this.changes) {
            return res.status(204).send()
        }
        else {
            return res.status(404).send()
        }
    })
})

module.exports = router;