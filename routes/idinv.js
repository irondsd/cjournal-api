const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const errors = require('../helpers/errors')
const log = require('../helpers/logger')
const objectify = require('../helpers/objectify')

router.get('/:idinv/user', (req, res) => {
    query = `select 
users.id, name, birthday, gender, username, idinv, last_seen, information, hide_elements, language, permissions,
prescriptions.course_therapy, relief_of_attack, tests
from users 
inner join 
prescriptions on users.id = prescriptions.users_id where users.idinv = '${req.params.idinv}'`
    log.debug(query)
    db.all(query, (err, rows) => {
        if (err) {
            log.error(`idinv internal error ${err}`)
            return errors.internalError(res)
        } else {
            if (rows.length > 0) {
                objectify.all(rows)
                res.send(rows[0])
            } else {
                errors.notFound(res)
            }
        }
    })
})

router.get('/:idinv/activity', (req, res) => {
    query = `select * from activity where idinv = '${req.params.idinv}'`
    log.debug(query)
    db.all(query, (err, rows) => {
        if (err) {
            log.error(`idinv internal error ${err}`)
            return errors.internalError(res)
        } else {
            if (rows.length > 0) {
                objectify.data(rows)
                res.send(rows[0])
            } else {
                errors.notFound(res)
            }
        }
    })
})

router.get('/:idinv/tasks', (req, res) => {
    query = `select * from tasks where idinv = '${req.params.idinv}'`
    log.debug(query)
    db.all(query, (err, rows) => {
        if (err) {
            log.error(`idinv internal error ${err}`)
            return errors.internalError(res)
        } else {
            if (rows.length > 0) {
                objectify.data(rows)
                res.send(rows[0])
            } else {
                errors.notFound(res)
            }
        }
    })
})

// post tasks ?

module.exports = router
