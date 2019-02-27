const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const validate = require('../validate')

// TODO: check email on post
// TODO: change post method to accomidate for email and password
// TODO: make get and delete methods for loggin in and out
// TODO: check password on delete (or api key?) request
// TODO: check password on put request
// TODO: possibly distinguish if there's no data or there is no user on get data request

router.get('/api/users/', (req, res) => {
    db.all('select id, name, email, device_type, last_seen from users', (err, rows) => {
        if (err) {
            log(err)
            res.status(500).send(err)
        }
        res.send(rows)
    })
})

router.get('/api/users/:id', (req, res) => {
    db.all('select id, name, email, device_type, last_seen from users where id = ' + req.params.id, (err, rows) => {
        if (err) {
            return res.status(500).send(err)
        }
        if (rows.length > 0) {
            return res.send(rows)
        }
        else {
            return res.status(404).send()
        }
    })
})

router.delete('/api/users/:id', (req, res) => {
    db.run('delete from users where id = ' + req.params.id, function (err) {
        if (err) {
            return res.status(500).send(err)
        }
        if (this.changes) {
            // so if the device was actualy deleted, we need to clear exercise data from exercise table as well
            db.run('delete from exercises where users_id = ' + req.params.id, function (err) {
                if (err) {
                    console.log(err)
                }
            })

            // and finally return 204
            return res.status(204).send()
        }
        else {
            return res.status(404).send()
        }
    })
})

router.post('/api/users/', (req, res) => {
    if (!validate.new_device(req)) {
        return res.status(400).send()
    }

    const current_type = Date.now() / 1000 | 0

    db.all(`INSERT INTO users(name, device_type, last_seen) VALUES ('${req.body.name}', '${req.body.device_type}', '${current_type}')`, (err, rows) => {
        if (err) {
            return log(err)
        }
        else {
            res.status(201).send(rows)
        }
    })
})

router.put('/api/users/:id', (req, res) => {
    if (!validate.put_device(req)) {
        return res.status(400).send()
    }

    sql = `update users set `

    if (req.body.name) {
        sql += `name = '${req.body.name}' `
    }

    if (req.body.device_type) {
        if (req.body.name) {
            // in case there's something in front of device time, need a comma
            sql += `, device_type = '${req.body.device_type}' `
        }
        else {
            sql += `device_type = '${req.body.device_type}' `
        }
    }

    sql += `where id = ${req.params.id}`

    const current_type = Date.now() / 1000 | 0
    db.run(sql, function (err, rows) {
        if (err) {
            return log(err)
        }
        if (this.changes) {
            res.status(204).send(rows)
        }
        else {
            res.status(404).send()
        }
    })
})

router.get('/api/users/:id/data/', (req, res) => {
    let timeframe = ``
    if (req.query.from) {
        timeframe += ` and time_started > ${req.query.from} `
    }
    if (req.query.to) {
        timeframe += ` and time_started < ${req.query.to} `
    }

    db.all('select * from exercises where users_id = ' + req.params.id + timeframe, (err, rows) => {
        if (err) {
            log(err)
            res.status(500).send(err)
        }
        res.send(rows)
    })
})

router.post('/api/users/:id/data/', (req, res) => {
    if (!validate.exercise_record(req)) {
        return res.status(400).send()
    }

    db.run(`insert into exercises(users_id, exercise_type, time_started, duration, successful, distance, steps) values 
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