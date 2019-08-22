const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const validate = require('../helpers/validate')
const log = require('../helpers/logger')
const bcrypt = require('bcryptjs')

// Get all users
router.get('/', (req, res) => {
    let query = `select 
users.id, name, birthday, gender, email, device_type, last_seen, information, hide_elements, language, permissions,
prescriptions.course_therapy, relief_of_attack, tests
from users 
inner join 
prescriptions on users.id = prescriptions.users_id`
    console.log(query)
    db.all(query, (err, rows) => {
        if (err) {
            log(err)
            res.status(500).send(err.keys)
        }
        res.send(rows)
    })
})

// Get information about the user with specific id
router.get('/:id', (req, res) => {
    let query =
        `select 
users.id, name, birthday, gender, email, device_type, last_seen, information, hide_elements, language, permissions,
prescriptions.course_therapy, relief_of_attack, tests
from users 
inner join 
prescriptions on users.id = prescriptions.users_id
where users.id = ` + req.params.id
    console.log(query)
    db.all(query, (err, rows) => {
        if (err) {
            return res.status(500).send(err)
        }
        if (rows) {
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

            let permissions = req.body.permissions ? req.body.permissions : 1
            let information = req.body.information ? req.body.information : ''
            let hide_elements = req.body.hide_elements ? req.body.hide_elements : null
            let language = req.body.language ? req.body.language : 'en'

            let query = `INSERT INTO users(name, birthday, gender, email, password, device_type, last_seen, information, hide_elements, language, permissions) VALUES ('${
                req.body.name
            }', '${req.body.birthday}', '${req.body.gender}', '${req.body.email}', '${hash}', '${
                req.body.device_type
            }', '${current_time}', '${information}', '${hide_elements}', '${language}', '${permissions}')`
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
            // TODO: check api key on validation
            error: 'request is not validated. Email is required in every user put request'
        })
    }
    const current_time = (Date.now() / 1000) | 0
    db.serialize(() => {
        db.all(`select * from users where id = '${req.params.id}' limit 1`, (err, rows) => {
            if (err) {
                log(err)
                return res.status(400).send({
                    error: err
                })
            } else {
                let password_insert = ``
                if (req.body.password) {
                    hash = rows[0].password
                    if (bcrypt.compareSync(req.body.password, hash)) {
                        let hash
                        if (req.body.new_password) {
                            let salt = bcrypt.genSaltSync(10)
                            hash = bcrypt.hashSync(req.body.new_password, salt)
                            password_insert = ` password = '${hash}',`
                        }
                    } else {
                        res.status(400).send({
                            error: 'wrong password'
                        })
                    }
                }

                // prevent erasing changes
                let name = req.body.name ? req.body.name : rows[0].name
                let device_type = req.body.device_type ? req.body.device_type : rows[0].device_type
                let gender = req.body.gender ? req.body.gender : rows[0].gender
                let birthday = req.body.birthday ? req.body.birthday : rows[0].birthday
                let permissions = req.body.permissions ? req.body.permissions : rows[0].permissions
                let information = req.body.information ? req.body.information : rows[0].information
                let hide_elements = req.body.hide_elements ? req.body.hide_elements : rows[0].hide_elements
                let language = req.body.language ? req.body.language : rows[0].language

                let query = `update users set name = '${name}', birthday = '${birthday}', gender = '${gender}', email = '${
                    req.body.email
                }', ${password_insert} device_type = '${device_type}', last_seen = '${current_time}', information = '${information}', hide_elements = '${hide_elements}', language = '${language}', permissions= '${permissions}' where id = ${
                    req.params.id
                }`
                console.log(query)
                db.all(query, (err, rows) => {
                    if (err) {
                        if (err.errno === 19)
                            return res.status(400).send({
                                error: 'This email is already used'
                            })
                        return res.status(400).send({
                            error: err
                        })
                    } else {
                        return res.status(200).send(rows)
                    }
                })
            }
        })
    })
})

module.exports = router
