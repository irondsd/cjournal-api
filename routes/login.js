const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const validate = require('../validate')
const session = require('../session')

router.post('/login', (req, res) => {
    if (req.body.email && req.body.password) {
        db.all(`select id, email, password from users where email = '${req.body.email}' limit 1`, (err, rows) => {
            if (err) {
                res.status(500).send(err.keys)
            }
            if (rows[0].password === req.body.password) {
                user_id = rows[0].id
                let { api_key, exp_date } = session.create_session(user_id)
                let sql = `insert into sessions(user_id, api_key, renewable, exp_date) values ('${user_id}', '${api_key}', 'true', '${exp_date}')`
                db.all(sql, (err, rows) => {
                    if (err) {
                        log(err)
                        res.send('error creating session', err)
                    }
                    else {
                        res.send({
                            'api_key': api_key,
                            'exp_date': exp_date
                        })
                    }
                })
            }
            else {
                res.status(403).send('wrong password')
            }
        })
    }
    else {
        res.status(400).send()
    }
})

module.exports = router