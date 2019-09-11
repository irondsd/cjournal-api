const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const validate = require('../helpers/validate')
const session = require('../helpers/session')
const log = require('../helpers/logger')
const bcrypt = require('bcryptjs')

router.post('/login', (req, res) => {
    login(req, res)
})

router.post('/loginqr', (req, res, qr = true) => {
    login(req, res, true)
})

router.post('/qr', (req, res) => {
    qr(req, res)
})

login = function(req, res, qr = false) {
    if (req.body.email && req.body.password) {
        let query = `select 
users.id, name, birthday, gender, email, password, device_type, last_seen, information, hide_elements, language, permissions,
prescriptions.course_therapy, relief_of_attack, tests
from users 
inner join 
prescriptions on users.id = prescriptions.users_id
where users.email = '${req.body.email}' limit 1`
        let short = false
        if (req.query.hasOwnProperty('short')) short = true
        console.log(short)
        db.all(query, (err, rows) => {
            if (err) {
                res.status(500).send(err.keys)
            }
            if (rows[0]) {
                hash = rows[0].password
                if (bcrypt.compareSync(req.body.password, hash)) {
                    if (qr === false) {
                        session.create_session(res, req, rows[0])
                    } else {
                        session.generate_qr(rows[0], res, short)
                    }
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
}

qr = function(req, res) {
    session.decipher_api_key(req.query.api_key).then(decipher => {
        if (!decipher.id) return res.status(400).send({ error: decipher.message })

        let id = decipher.id

        if (req.body.id) id = req.body.id

        let query = `select 
users.id, name, birthday, gender, email, password, device_type, last_seen, information, hide_elements, language, permissions,
prescriptions.course_therapy, relief_of_attack, tests
from users 
inner join 
prescriptions on users.id = prescriptions.users_id
where users.id = '${id}' limit 1`
        db.all(query, (err, rows) => {
            if (err) {
                return res.status(500).send(err.keys)
            }
            if (rows[0]) {
                session.generate_qr(rows[0], res)
            } else {
                return res.status(404).send()
            }
        })
    })
}

module.exports = router
