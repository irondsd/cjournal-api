const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const validate = require('../helpers/validate')
const bcrypt = require('bcryptjs')
const checkAuth = require('../middleware/checkAuth')
const errors = require('../helpers/errors')
const log = require('../helpers/logger')

// Get all users
router.get('/', checkAuth, (req, res, next) => {
    log(`user ${req.decoded.id} requested all users list`)
    let query = `select 
users.id, name, birthday, gender, email, device_type, last_seen, information, hide_elements, language, permissions,
prescriptions.course_therapy, relief_of_attack, tests
from users 
inner join 
prescriptions on users.id = prescriptions.users_id`
    // console.log(query)
    db.all(query, (err, rows) => {
        if (err) {
            log(`get all users internal error ${err}`)
            return errors.internalError(res)
        }
        res.send(rows)
    })
})

// Get information about the user with specific id
router.get('/:id', checkAuth, (req, res, next) => {
    log(`user ${req.decoded.id} requested user ${req.params.id}`)
    let query =
        `select 
users.id, name, birthday, gender, email, device_type, last_seen, information, hide_elements, language, permissions,
prescriptions.course_therapy, relief_of_attack, tests
from users 
inner join 
prescriptions on users.id = prescriptions.users_id
where users.id = ` + req.params.id
    // console.log(query)
    db.all(query, (err, rows) => {
        if (err) {
            log(`users internal error ${err}`)
            return errors.internalError(res)
        }
        if (rows.length > 0) {
            return res.send(rows[0])
        } else {
            log(`get users id not found ${req.params.id}`)
            return errors.notFound(res)
        }
    })
})

router.delete('/:id', checkAuth, (req, res, next) => {
    log(`user ${req.decoded.id} deleted user ${req.params.id}`)
    db.run('delete from users where id = ' + req.params.id, function(err) {
        if (err) {
            log(`users internal error ${err}`)
            return errors.internalError(res)
        }
        if (this.changes) {
            // so if the device was actualy deleted, we need to clear prescritions data from prescritions table as well
            db.run('delete from prescriptions where users_id = ' + req.params.id, function(err) {
                if (err) {
                    console.log(err)
                }
            })

            // and finally return 204
            return res.status(204).send()
        } else {
            log(`delete users id not found ${req.params.id}`)
            return errors.notFound(res)
        }
    })
})

// Add user
router.post('/', checkAuth, (req, res, next) => {
    let errors = validate.new_user(req)
    if (errors.length > 0) {
        return res.status(400).send({
            error: errors
        })
    }
    const current_time = (Date.now() / 1000) | 0
    db.all(`select exists (select 1 from users where email = '${req.body.email}' limit 1)`, function(err, rows) {
        if (err) {
            log(`users internal error ${err}`)
            return errors.internalError(res)
        }
        if (rows[0][Object.keys(rows[0])[0]] === 1) {
            log(`user ${req.decoded.id} tried to post user with email ${req.body.email}`)
            return errors.userExists(res)
        } else {
            let salt = bcrypt.genSaltSync(10)
            let hash = bcrypt.hashSync(req.body.password, salt)

            let permissions = req.body.permissions ? req.body.permissions : 1
            let information = req.body.information ? req.body.information : ''
            let hide_elements = req.body.hide_elements ? req.body.hide_elements : null
            let language = req.body.language ? req.body.language : 'en'

            let query = `INSERT INTO users(name, birthday, gender, email, password, device_type, last_seen, information, hide_elements, language, permissions) VALUES ('${req.body.name}', '${req.body.birthday}', '${req.body.gender}', '${req.body.email}', '${hash}', '${req.body.device_type}', '${current_time}', '${information}', '${hide_elements}', '${language}', '${permissions}')`
            console.log(query)
            db.run(query, function(err, rows) {
                if (err) {
                    log(`post users internal error ${err}`)
                    return errors.internalError(res)
                } else {
                    log(`user ${req.decoded.id} posted user with email ${req.body.email}`)
                    let query = `insert into prescriptions(users_id, course_therapy, relief_of_attack, tests) values ('${this.lastID}', '${req.body.course_therapy}', '${req.body.relief_of_attack}', '${req.body.tests}')`
                    let id = this.lastID
                    db.run(query, function(err, rows) {
                        if (err) {
                            // to make sure it'll be deleted in case something goes wrong here
                            db.run('delete from users where id = ' + id)
                            log(`need inspection users line 120: ${query}`)
                            return errors.internalError(res)
                        } else {
                            res.status(201).send({
                                id: id
                            })
                        }
                    })
                }
            })
        }
    })
})

// Update user
router.put('/:id', checkAuth, (req, res, next) => {
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
                log(`users internal error ${err}`)
                return errors.internalError(res)
            } else {
                log(`user ${req.decoded.id} updated user ${req.params.id}`)
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
                        log(`put users wrong password`)
                        errors.wrongPassword(res)
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
                let course_therapy = req.body.course_therapy ? req.body.course_therapy : rows[0].course_therapy
                let relief_of_attack = req.body.relief_of_attack ? req.body.relief_of_attack : rows[0].relief_of_attack
                let tests = req.body.tests ? req.body.tests : rows[0].tests

                let query = `update users set name = '${name}', birthday = '${birthday}', gender = '${gender}', email = '${req.body.email}', ${password_insert} device_type = '${device_type}', last_seen = '${current_time}', information = '${information}', hide_elements = '${hide_elements}', language = '${language}', permissions= '${permissions}' where id = ${req.params.id}`
                console.log(query)
                db.all(query, (err, rows) => {
                    if (err) {
                        if (err.errno === 19) {
                            log(`put users error email exists ${req.body.email}`)
                            return errors.userExists(res)
                        }
                        log(`need inspection users line 187 error`)
                        return errors.internalError(res)
                    } else {
                        // edit prescriptions
                        let query = `update prescriptions set course_therapy = '${course_therapy}', relief_of_attack = '${relief_of_attack}', tests = '${tests}' where users_id = ${req.params.id}`
                        let id = this.lastID
                        db.run(query, function(err, rows) {
                            if (err) {
                                log(`users internal error ${err}`)
                                return errors.internalError(res)
                            } else {
                                res.status(201).send(rows)
                            }
                        })
                    }
                })
            }
        })
    })
})

module.exports = router
