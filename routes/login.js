const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const validate = require('../helpers/validate')
const session = require('../helpers/session')
const log = require('../helpers/logger')
const bcrypt = require('bcryptjs')

router.post('/login', (req, res) => {
    if (req.body.email && req.body.password) {
        let query = `select 
users.id, name, birthday, gender, email, password, device_type, last_seen, information, hide_elements, language, permissions,
prescriptions.course_therapy, relief_of_attack, tests
from users 
inner join 
prescriptions on users.id = prescriptions.users_id
where users.email = '${req.body.email}' limit 1`
        db.all(query, (err, rows) => {
            if (err) {
                res.status(500).send(err.keys)
            }
            if (rows[0]) {
                hash = rows[0].password
                if (bcrypt.compareSync(req.body.password, hash)) {
                    user_id = rows[0].id
                    session.create_session(res, req, rows[0])
                } else {
                    res.status(403).send({
                        error: 'wrong password'
                    })
                }
            } else {
                res.status(404).send()
            }
        })
    } else {
        res.status(400).send({
            error: 'no email and password received'
        })
    }

    // TODO: delete all the sessions that are a week old each time a user logs in again
})

router.post('/loginqr', (req, res) => {
    if (req.body.email && req.body.password) {
        let query = `select 
users.id, name, birthday, gender, email, password, device_type, last_seen, information, hide_elements, language, permissions,
prescriptions.course_therapy, relief_of_attack, tests
from users 
inner join 
prescriptions on users.id = prescriptions.users_id
where users.email = '${req.body.email}' limit 1`
        db.all(query, (err, rows) => {
            if (err) {
                res.status(500).send(err.keys)
            }
            if (rows[0]) {
                hash = rows[0].password
                console.log(hash)
                if (bcrypt.compareSync(req.body.password, hash)) {
                    user_id = rows[0].id
                    session.create_qr_session(res, req, rows[0])
                } else {
                    res.status(403).send({
                        error: 'wrong password'
                    })
                }
            } else {
                res.status(404).send({
                    error: 'No such user'
                })
            }
        })
    } else {
        res.status(400).send({
            error: 'no email and password received'
        })
    }

    // TODO: delete all the sessions that are a week old each time a user logs in again
})

router.put('/login', (req, res) => {
    if (req.query.api_key) {
        session.renew_session(req, res)
    } else {
        res.status(403).send({
            error: 'no api_key received'
        })
    }

    // TODO: delete all the sessions that are a week old each time a user logs in again
})

router.delete('/logout', (req, res) => {
    if (req.query.api_key) {
        console.log(req.query.api_key)
        db.run('', (err, rows) => {
            session.destroy_session(res, req, req.query.api_key)
        })
    } else {
        res.status(400).send({
            error: 'no api_key received'
        })
    }
})

module.exports = router
