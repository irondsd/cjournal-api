const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const validate = require('../validate')

// TODO: check email on post
// TODO: change post method to accomidate for email and password
// TODO: make get and delete methods for loggin in and out
// TODO: check password on delete (or api key?) request
// TODO: check password on put request
// TODO: better error managing i.e. send explataion with 404

// Get all users
router.get('/', (req, res) => {
    db.all('select id, name, email, device_type, last_seen from users', (err, rows) => {
        if (err) {
            log(err)
            res.status(500).send(err)
        }
        res.send(rows)
    })
})

// Get information about the user with specific
router.get('/:id', (req, res) => {
    db.all('select id, name, email, device_type, last_seen from users where id = ' + req.params.id, (err, rows) => {
        if (err) {
            return res.status(500).send(err)
        }
        if (rows.length > 0) {
            return res.send(rows)
        }
        else {
            return res.status(404).send()
        }
    })
})

router.delete('/:id', (req, res) => {
    db.run('delete from users where id = ' + req.params.id, function (err) {
        if (err) {
            return res.status(500).send(err)
        }
        if (this.changes) {
            // so if the device was actualy deleted, we need to clear exercise data from exercise table as well
            db.run('delete from exercises where users_id = ' + req.params.id, function (err) {
                if (err) {
                    console.log(err)
                }
            })

            // and finally return 204
            return res.status(204).send()
        }
        else {
            return res.status(404).send()
        }
    })
})

// Add user
router.post('/', (req, res) => {
    if (!validate.new_device(req)) {
        return res.status(400).send()
    }

    const current_type = Date.now() / 1000 | 0

    db.all(`INSERT INTO users(name, device_type, last_seen) VALUES ('${req.body.name}', '${req.body.device_type}', '${current_type}')`, (err, rows) => {
        if (err) {
            return log(err)
        }
        else {
            res.status(201).send(rows)
        }
    })
})


// Update user
router.put('/', (req, res) => {
    if (!validate.put_device(req)) {
        return res.status(400).send()
    }

    sql = `update users set `

    if (req.body.name) {
        sql += `name = '${req.body.name}' `
    }

    if (req.body.device_type) {
        if (req.body.name) {
            // in case there's something in front of device time, need a comma
            sql += `, device_type = '${req.body.device_type}' `
        }
        else {
            sql += `device_type = '${req.body.device_type}' `
        }
    }

    sql += `where id = ${req.params.id}`

    const current_type = Date.now() / 1000 | 0
    db.run(sql, function (err, rows) {
        if (err) {
            return log(err)
        }
        if (this.changes) {
            res.status(204).send(rows)
        }
        else {
            res.status(404).send()
        }
    })
})

module.exports = router;