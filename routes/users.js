const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const checkAuth = require('../middleware/checkAuth')
const errors = require('../helpers/errors')
const log = require('../helpers/logger')
const { timestamp } = require('../helpers/timestamp')
const stringSanitizer = require('../helpers/stringSanitizer')
const intSanitizer = require('../helpers/intSanitizer')
const arrayStringify = require('../helpers/arrayStringify')
const objectify = require('../helpers/objectify')

// Get all users
router.get('/', checkAuth, (req, res, next) => {
    // log.info(`user ${req.decoded.id} requested all users list`)
    let query = `select * from users inner join 
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
    let query = `select 
*
from users 
inner join 
prescriptions on users.id = prescriptions.users_id
where users.id = '${req.params.id}'`
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

router.get('/sub/:sub', checkAuth, (req, res, next) => {
    let query = `select * from users where sub = '${req.params.sub}'`

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

// Update user
router.put('/:id', checkAuth, (req, res, next) => {
    let id = intSanitizer(req.params.uid)
    db.all(
        `select * from users inner join
            prescriptions on users.id = prescriptions.users_id where id = '${id}' limit 1`,
        (err, rows) => {
            if (err) {
                log.error(`users internal error ${err}`)
                return errors.internalError(res)
            } else {
                // prevent erasing changes
                let idinv = req.body.idinv ? stringSanitizer(req.body.idinv) : rows[0].idinv
                let language = req.body.language ? req.body.language : rows[0].language
                let hide_elements = arrayStringify(req.body.hide_elements, rows[0].hide_elements)
                let course_therapy = arrayStringify(req.body.course_therapy, rows[0].course_therapy)
                let relief_of_attack = arrayStringify(
                    req.body.relief_of_attack,
                    rows[0].relief_of_attack,
                )
                let tests = arrayStringify(req.body.tests, rows[0].tests)

                let query = `update users set idinv = '${idinv}', last_seen = '${timestamp()}', hide_elements = '${hide_elements}', language = '${language}' where id = '${id}'`
                log.debug(query)
                db.all(query, (err, rows) => {
                    if (err) {
                        log.error(`need inspection users line 90 error`)
                        return errors.internalError(res)
                    } else {
                        // edit prescriptions
                        let query = `update prescriptions set course_therapy = '${course_therapy}', relief_of_attack = '${relief_of_attack}', tests = '${tests}' where users_id = '${id}'`
                        let id = this.lastID
                        db.run(query, function (err, rows) {
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

module.exports = router
