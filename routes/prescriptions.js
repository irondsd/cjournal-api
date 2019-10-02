const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const errors = require('../helpers/errors')
const log = require('../helpers/logger')

router.get('/:id/prescriptions', (req, res) => {
    query = 'select * from prescriptions where users_id = ' + req.params.id
    // console.log(query)
    db.all(query, (err, rows) => {
        if (err) {
            log(`prescriptions internal error ${err}`)
            errors.internalError(res)
        }
        if (Array.isArray(rows))
            for (el of rows) {
                el.course_therapy = JSON.parse(el.course_therapy)
                el.relief_of_attack = JSON.parse(el.relief_of_attack)
                el.tests = JSON.parse(el.tests)
            }
        res.send(rows[0])
    })
})

router.post('/:id/prescriptions', (req, res) => {
    query = `insert into prescriptions(users_id, course_therapy, relief_of_attack, tests) values 
            ('${req.params.id}', '${JSON.stringify(req.body.course_therapy)}', '${JSON.stringify(
        req.body.relief_of_attack
    )}', '${JSON.stringify(req.body.tests)}')`
    // console.log(query)
    db.run(query, function(err, rows) {
        if (err) {
            log(`prescriptions internal error ${err}`)
            errors.internalError(res)
        } else {
            res.status(201).send()
        }
    })
})

router.put('/:id/prescriptions/', (req, res) => {
    query = `update prescriptions set course_therapy = '${JSON.stringify(
        req.body.course_therapy
    )}', relief_of_attack = '${JSON.stringify(req.body.relief_of_attack)}', tests = '${JSON.stringify(
        req.body.tests
    )}' where users_id = '${req.params.id}'`
    // console.log(query)
    db.run(query, function(err, rows) {
        if (err) {
            log(`prescriptions internal error ${err}`)
            errors.internalError(res)
        } else {
            res.status(201).send()
        }
    })
})

router.delete('/:uid/tasks/:aid', (req, res) => {
    if (!req.params.aid) {
        return errors.incompleteInput(res)
    }

    let sql = `update tasks set deleted = '1', last_updated = '${timestamp()}' where id = '${req.params.aid}'`
    db.run(sql, (err, rows) => {
        if (err) {
            log(`prescriptions internal error ${err}`)
            errors.internalError(res)
        } else {
            res.status(204).send(rows)
        }
    })
})

module.exports = router
