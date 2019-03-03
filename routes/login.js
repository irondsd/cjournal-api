const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const validate = require('../validate')
const session = require('../session')
const log = require('../logger')
const bcrypt = require('bcryptjs')

router.post('/login', (req, res) => {
    if (req.body.email && req.body.password) {
        db.all(`select id, email, password from users where email = '${req.body.email}' limit 1`, (err, rows) => {
            if (err) {
                res.status(500).send(err.keys)
            }
            hash = rows[0].password
            if (bcrypt.compareSync(req.body.password, hash)) {
                // password correct
                user_id = rows[0].id
                session.create_session(res, req, user_id)
            }
            else {
                res.status(403).send('wrong password')
            }
        })
    }
    else {
        res.status(400).send()
    }

    // TODO: delete all the sessions that are a week old each time a user logs in again
})

router.put('/login', (req, res) => {
    if (req.query.api_key) {
        session.renew_session(req, res)
    }
    else {
        res.status(400).send()
    }

    // TODO: delete all the sessions that are a week old each time a user logs in again
})

router.delete('/logout', (req, res) => {
    if (req.query.api_key) {
        console.log(req.query.api_key)
        db.run('', (err, rows) => {
            session.destroy_session(res, req, req.query.api_key)
        })
    }
    else {
        res.status(403).send()
    }
})

module.exports = router