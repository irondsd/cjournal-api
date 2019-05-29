const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const validate = require('../validate')
const log = require('../logger')
const bcrypt = require('bcryptjs')

// TODO: make get and delete methods for loggin in and out
// TODO: require password when updatung the information
// TODO: better error managing i.e. send explataion with 404

// Get all users
router.get('/', (req, res) => {
    let query = `select 
users.id, name, age, gender, email, device_type, last_seen, information, hide_elements,
prescriptions.course_therapy, relief_of_attack, tests
from users 
inner join 
prescriptions on users.id = prescriptions.users_id`
    db.all(query, (err, rows) => {
        if (err) {
            log(err)
            res.status(500).send(err.keys)
        }
        res.send(rows)
    })
})

// Get information about the user with specific
router.get('/:id', (req, res) => {
    let query =
        `select 
users.id, name, age, gender, email, device_type, last_seen, information, hide_elements,
prescriptions.course_therapy, relief_of_attack, tests
from users 
inner join 
prescriptions on users.id = prescriptions.users_id
where users.id = ` + req.params.id
    db.all(query, (err, rows) => {
        if (err) {
            return res.status(500).send(err)
        }
        if (rows.length > 0) {
            return res.send(rows[0])
        } else {
            return res.status(404).send()
        }
    })
})

router.delete('/:id', (req, res) => {
    // TODO: verify password before
    db.run('delete from users where id = ' + req.params.id, function(err) {
        if (err) {
            return res.status(500).send(err)
        }
        if (this.changes) {
            // so if the device was actualy deleted, we need to clear activity data from activity table as well
            db.run('delete from activity where users_id = ' + req.params.id, function(err) {
                if (err) {
                    console.log(err)
                }
            })

            // and finally return 204
            return res.status(204).send()
        } else {
            return res.status(404).send()
        }
    })
})

// Add user
router.post('/', (req, res) => {
    let errors = validate.new_user(req)
    if (errors.length > 0) {
        return res.status(400).send(errors)
    }
    const current_time = (Date.now() / 1000) | 0
    db.all(`select exists (select 1 from users where email = '${req.body.email}' limit 1)`, function(err, rows) {
        if (err) {
            res.status(500).send({
                error: err
            })
        }
        if (rows[0][Object.keys(rows[0])[0]] === 1) {
            return res.status(409).send({
                error: 'user with email is already registered'
            })
        } else {
            let salt = bcrypt.genSaltSync(10)
            let hash = bcrypt.hashSync(req.body.password, salt)
            let query = `INSERT INTO users(name, age, gender, email, password, device_type, last_seen, information, hide_elements) VALUES ('${
                req.body.name
            }', '${req.body.age}', '${req.body.gender}', '${req.body.email}', '${hash}', '${
                req.body.device_type
            }', '${current_time}', '${req.body.information}', '${req.body.hide_elements}')`
            console.log(query)
            db.run(query, function(err, rows) {
                if (err) {
                    res.status(400).send({
                        error: err
                    })
                } else {
                    let query = `insert into prescriptions(users_id, course_therapy, relief_of_attack, tests) values ('${
                        this.lastID
                    }', '${req.body.course_therapy}', '${req.body.relief_of_attack}', '${req.body.tests}')`
                    let id = this.lastID
                    db.run(query, function(err, rows) {
                        if (err) {
                            // to make sure it'll be deleted in case something goes wrong here
                            db.run('delete from users where id = ' + id)
                            res.status(400).send({
                                error: err
                            })
                        } else {
                            res.status(201).send(rows)
                        }
                    })
                }
            })
        }
    })
})

// Update user
router.put('/:id', (req, res) => {
    if (!validate.update_user(req)) {
        return res.status(400).send({
            error: 'request is not validated. Check readme at /api/ for usage information'
        })
    }
    const current_time = (Date.now() / 1000) | 0
    db.serialize(() => {
        db.all(`select email, password from users where id = '${req.params.id}' limit 1`, (err, rows) => {
            if (err) {
                log(err)
                return res.status(400).send({
                    error: err
                })
            } else {
                hash = rows[0].password
                if (bcrypt.compareSync(req.body.password, hash)) {
                    let password_insert = ``
                    if (req.body.new_password) {
                        password_insert = ` password = '${req.body.new_password}',`
                    }
                    let sql = `update users set name = '${req.body.name}', age = '${req.body.age}', gender = '${
                        req.body.gender
                    }', email = '${req.body.email}',${password_insert} device_type = '${
                        req.body.device_type
                    }', last_seen = '${current_time}', information = '${req.body.information}', hide_elements = '${
                        req.body.hide_elements
                    }' where id = ${req.params.id}`
                    db.all(sql, (err, rows) => {
                        if (err) {
                            return res.status(400).send({
                                error: err
                            })
                        } else {
                            return res.status(200).send(rows)
                        }
                    })
                } else {
                    res.status(400).send({
                        error: 'wrong password'
                    })
                }
            }
        })
    })
})

module.exports = router
