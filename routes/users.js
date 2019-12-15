const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const bcrypt = require('bcryptjs')
const checkAuth = require('../middleware/checkAuth')
const validateNewUser = require('../middleware/validateNewUser')
const validateEditUser = require('../middleware/validateEditUser')
const errors = require('../helpers/errors')
const log = require('../helpers/logger')
const { timestamp } = require('../helpers/timestamp')
const stringSanitizer = require('../helpers/stringSanitizer')
const arrayStringify = require('../helpers/arrayStringify')
const objectify = require('../helpers/objectify')

// Get all users
router.get('/', checkAuth, (req, res, next) => {
    log.info(`user ${req.decoded.id} requested all users list`)
    let query = `select 
users.id, name, birthday, gender, username, idinv, last_seen, information, hide_elements, language, permissions,
prescriptions.course_therapy, relief_of_attack, tests
from users 
inner join 
prescriptions on users.id = prescriptions.users_id`
    log.debug(query)
    db.all(query, (err, rows) => {
        if (err) {
            log.error(`get all users internal error ${err}`)
            return errors.internalError(res)
        }

        objectify.all(rows)

        res.send(rows)
    })
})

// Get information about the user with specific id
router.get('/:id', checkAuth, (req, res, next) => {
    log.info(`user ${req.decoded.id} requested user ${req.params.id}`)
    let query =
        `select 
users.id, name, birthday, gender, username, idinv, last_seen, information, hide_elements, language, permissions,
prescriptions.course_therapy, relief_of_attack, tests
from users 
inner join 
prescriptions on users.id = prescriptions.users_id
where users.id = ` + req.params.id
    log.debug(query)
    db.all(query, (err, rows) => {
        if (err) {
            log.error(`users internal error ${err}`)
            return errors.internalError(res)
        }
        if (rows.length > 0) {
            objectify.all(rows)
            return res.send(rows[0])
        } else {
            log.info(`get users id not found ${req.params.id}`)
            return errors.notFound(res)
        }
    })
})

router.delete('/:id', checkAuth, (req, res, next) => {
    log.info(`user ${req.decoded.id} deleted user ${req.params.id}`)
    db.run('delete from users where id = ' + req.params.id, function(err) {
        if (err) {
            log.error(`users internal error ${err}`)
            return errors.internalError(res)
        }
        if (this.changes) {
            // so if the device was actualy deleted, we need to clear prescritions data from prescritions table as well
            db.run('delete from prescriptions where users_id = ' + req.params.id, function(err) {
                if (err) {
                    log.error(`error delete users need inspection ${err}`)
                }
            })

            // and finally return 204
            return res.status(204).send()
        } else {
            log.info(`delete users id not found ${req.params.id}`)
            return errors.notFound(res)
        }
    })
})

// Add user
router.post('/', validateNewUser, checkAuth, (req, res, next) => {
    db.all(
        `select exists (select 1 from users where username = '${req.body.username}' limit 1)`,
        function(err, rows) {
            if (err) {
                log.error(`users internal error ${err}`)
                return errors.internalError(res)
            }
            if (rows[0][Object.keys(rows[0])[0]] === 1) {
                log.info(
                    `user ${req.decoded.id} tried to post user with username ${req.body.username}`,
                )
                return errors.userExists(res)
            } else {
                let salt = bcrypt.genSaltSync(10)
                let hash = bcrypt.hashSync(req.body.password, salt)

                let name = stringSanitizer(req.body.name)
                let username = req.body.username // already checked by the middleware
                let birthday = req.body.birthday ? stringSanitizer(req.body.birthday) : '01.01.1970'
                let gender = req.body.gender ? stringSanitizer(req.body.gender) : 'male'
                let idinv = stringSanitizer(req.body.idinv)
                let permissions = req.body.permissions ? req.body.permissions : 1
                let information = req.body.information ? stringSanitizer(req.body.information) : ''
                let hide_elements = arrayStringify(req.body.hide_elements)
                let language = req.body.language ? req.body.language : 'en'
                let course_therapy = arrayStringify(req.body.course_therapy)
                let relief_of_attack = arrayStringify(req.body.relief_of_attack)
                let tests = arrayStringify(req.body.tests)

                let query = `INSERT INTO users(name, birthday, gender, username, password, idinv, last_seen, information, hide_elements, language, permissions) VALUES ('${name}', '${birthday}', '${gender}', '${username}', '${hash}', '${idinv}', '${timestamp()}', '${information}', '${hide_elements}', '${language}', '${permissions}')`
                log.debug(query)
                db.run(query, function(err, rows) {
                    if (err) {
                        log.error(`post users internal error ${err}`)
                        return errors.internalError(res)
                    } else {
                        log.info(`user ${req.decoded.id} posted user with username ${username}`)
                        let query = `insert into prescriptions(users_id, course_therapy, relief_of_attack, tests) values ('${this.lastID}', '${course_therapy}', '${relief_of_attack}', '${tests}')`
                        let id = this.lastID
                        db.run(query, function(err, rows) {
                            if (err) {
                                // to make sure it'll be deleted in case something goes wrong here
                                db.run('delete from users where id = ' + id)
                                log.error(`need inspection users line 120: ${query}`)
                                return errors.internalError(res)
                            } else {
                                res.status(201).send({
                                    id: id,
                                })
                            }
                        })
                    }
                })
            }
        },
    )
})

// Update user
router.put('/:id', validateEditUser, checkAuth, (req, res, next) => {
    const current_time = (Date.now() / 1000) | 0
    db.serialize(() => {
        db.all(
            `select * from users inner join 
prescriptions on users.id = prescriptions.users_id where id = '${req.params.id}' limit 1`,
            (err, rows) => {
                if (err) {
                    log.error(`users internal error ${err}`)
                    return errors.internalError(res)
                } else {
                    log.info(`user ${req.decoded.id} updated user ${req.params.id}`)
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
                            log.info(`put users wrong password`)
                            errors.wrongPassword(res)
                        }
                    }

                    // prevent erasing changes
                    let name = req.body.name ? stringSanitizer(req.body.name) : rows[0].name
                    let idinv = req.body.idinv ? stringSanitizer(req.body.idinv) : rows[0].idinv
                    let gender = req.body.gender ? stringSanitizer(req.body.gender) : rows[0].gender
                    let birthday = req.body.birthday
                        ? stringSanitizer(req.body.birthday)
                        : rows[0].birthday
                    let permissions = req.body.permissions
                        ? req.body.permissions
                        : rows[0].permissions
                    let information = req.body.information
                        ? stringSanitizer(req.body.information)
                        : rows[0].information
                    let language = req.body.language ? req.body.language : rows[0].language
                    let hide_elements = arrayStringify(
                        req.body.hide_elements,
                        rows[0].hide_elements,
                    )
                    let course_therapy = arrayStringify(
                        req.body.course_therapy,
                        rows[0].course_therapy,
                    )
                    let relief_of_attack = arrayStringify(
                        req.body.relief_of_attack,
                        rows[0].relief_of_attack,
                    )
                    let tests = arrayStringify(req.body.tests, rows[0].tests)

                    let query = `update users set name = '${name}', birthday = '${birthday}', gender = '${gender}', username = '${req.body.username}', ${password_insert} idinv = '${idinv}', last_seen = '${current_time}', information = '${information}', hide_elements = '${hide_elements}', language = '${language}', permissions= '${permissions}' where id = ${req.params.id}`
                    // log.debug(query)
                    db.all(query, (err, rows) => {
                        if (err) {
                            if (err.errno === 19) {
                                log.info(`put users error username exists ${req.body.username}`)
                                return errors.userExists(res)
                            }
                            log.error(`need inspection users line 214 error`)
                            return errors.internalError(res)
                        } else {
                            // edit prescriptions
                            let query = `update prescriptions set course_therapy = '${course_therapy}', relief_of_attack = '${relief_of_attack}', tests = '${tests}' where users_id = ${req.params.id}`
                            let id = this.lastID
                            db.run(query, function(err, rows) {
                                if (err) {
                                    log.error(`users internal error ${err}`)
                                    return errors.internalError(res)
                                } else {
                                    res.status(201).send(rows)
                                }
                            })
                        }
                    })
                }
            },
        )
    })
})

module.exports = router
