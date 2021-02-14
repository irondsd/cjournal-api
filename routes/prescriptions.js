const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const errors = require('../helpers/errors')
const log = require('../helpers/logger')
const arrayStringify = require('../helpers/arrayStringify')
const checkAuth = require('../middleware/checkAuth')
const objectify = require('../helpers/objectify')
const intSanitizer = require('../helpers/intSanitizer')
const responses = require('../helpers/responses')

router.get('users/:id/prescriptions', (req, res) => {
    let id = intSanitizer(req.params.id)
    query = 'select * from prescriptions where users_id = ' + id
    log.debug(query)
    db.all(query, (err, rows) => {
        if (err) {
            log.error(`prescriptions internal error ${err}`)
            errors.internalError(res)
        }
        objectify.all(rows)
        res.send(rows[0])
    })
})

router.post('users/:id/prescriptions', checkAuth, (req, res, next) => {
    let course_therapy = arrayStringify(req.body.course_therapy)
    let relief_of_attack = arrayStringify(req.body.relief_of_attack)
    let tests = arrayStringify(req.body.tests)
    let id = intSanitizer(req.params.id)
    query = `insert into prescriptions(users_id, course_therapy, relief_of_attack, tests) values 
            (${id}, '${course_therapy}', '${relief_of_attack}', '${tests}')`
    log.debug(query)
    db.run(query, function (err, rows) {
        if (err) {
            log.error(`prescriptions internal error ${err}`)
            errors.internalError(res)
        } else {
            log.info(`user ${req.decoded.id} posted prescriptions for user ${id}`)
            responses.created(res)
        }
    })
})

router.put('users/:id/prescriptions/', checkAuth, (req, res, next) => {
    let course_therapy = arrayStringify(req.body.course_therapy)
    let relief_of_attack = arrayStringify(req.body.relief_of_attack)
    let tests = arrayStringify(req.body.tests)
    let id = intSanitizer(req.params.id)

    query = `update prescriptions set course_therapy = '${course_therapy}', relief_of_attack = '${relief_of_attack}', tests = '${tests}' where users_id = ${id}`
    log.debug(query)
    db.run(query, function (err, rows) {
        if (err) {
            log.error(`prescriptions internal error ${err}`)
            errors.internalError(res)
        } else {
            log.info(`user ${req.decoded.id} updated prescriptions for user ${id}`)
            responses.created(res)
        }
    })
})

module.exports = router
