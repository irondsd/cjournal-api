const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const errors = require('../helpers/errors')
const log = require('../helpers/logger')
const fetch = require('node-fetch')
const checkAuth = require('../middleware/checkAuth')
const objectify = require('../helpers/objectify')
const responses = require('../helpers/responses')
require('dotenv').config()

router.post('/login', checkAuth, (req, res, next) => {
    let query =
        `select * from users inner join
            prescriptions on users.id = prescriptions.users_id
            where users.id = ` + req.user.id
    log.debug(query)
    db.all(query, (err, rows) => {
        if (err) {
            log.error(`users internal error ${err}`)
            return errors.internalError(res)
        }
        if (rows.length > 0) {
            objectify.all(rows)
            log.info(`user ${req.user.id} | ${req.user.username} has logged in`)
            return res.send(rows[0])
        } else {
            log.info(`get users id not found ${req.user.id}`)
            return errors.notFound(res)
        }
    })
})

module.exports = router
