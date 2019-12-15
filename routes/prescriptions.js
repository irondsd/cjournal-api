const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const errors = require('../helpers/errors')
const log = require('../helpers/logger')
const arrayStringify = require('../helpers/arrayStringify')
const checkAuth = require('../middleware/checkAuth')
const objectify = require('../helpers/objectify')

router.get('/:id/prescriptions', (req, res) => {
    query = 'select * from prescriptions where users_id = ' + req.params.id
    // log.debug(query)
    db.all(query, (err, rows) => {
        if (err) {
            log.error(`prescriptions internal error ${err}`)
            errors.internalError(res)
        }
        objectify.all(rows)
        res.send(rows[0])
    })
})

router.post('/:id/prescriptions', checkAuth, (req, res, next) => {
    let course_therapy = arrayStringify(req.body.course_therapy)
    let relief_of_attack = arrayStringify(req.body.relief_of_attack)
    let tests = arrayStringify(req.body.tests)

    query = `insert into prescriptions(users_id, course_therapy, relief_of_attack, tests) values 
            ('${req.params.id}', '${course_therapy}', '${relief_of_attack}', '${tests}')`
    // log.debug(query)
    db.run(query, function(err, rows) {
        if (err) {
            log.error(`prescriptions internal error ${err}`)
            errors.internalError(res)
        } else {
            log.info(`user ${req.decoded.id} posted prescriptions for user ${req.params.id}`)
            res.status(201).send()
        }
    })
})

router.put('/:id/prescriptions/', checkAuth, (req, res, next) => {
    let course_therapy = arrayStringify(req.body.course_therapy)
    let relief_of_attack = arrayStringify(req.body.relief_of_attack)
    let tests = arrayStringify(req.body.tests)

    query = `update prescriptions set course_therapy = '${course_therapy}', relief_of_attack = '${relief_of_attack}', tests = '${tests}' where users_id = '${req.params.id}'`
    // log.debug(query)
    db.run(query, function(err, rows) {
        if (err) {
            log.error(`prescriptions internal error ${err}`)
            errors.internalError(res)
        } else {
            log.info(`user ${req.decoded.id} updated prescriptions for user ${req.params.id}`)
            res.status(201).send()
        }
    })
})

module.exports = router
