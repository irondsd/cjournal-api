const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const validate = require('../validate')
const log = require('../logger')

// TODO: make get and delete methods for loggin in and out
// TODO: better error managing i.e. send explataion with 404

// Get all users
router.get('/', (req, res) => {
    db.all('select id, name, email, device_type, last_seen from users', (err, rows) => {
        if (err) {
            log(err)
            res.status(500).send(err.keys)
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
            // so if the device was actualy deleted, we need to clear activity data from activity table as well
            db.run('delete from activity where users_id = ' + req.params.id, function (err) {
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
    let errors = validate.new_user(req)
    if (errors.length > 0) {
        return res.status(400).send(errors)
    }
    const current_type = Date.now() / 1000 | 0
    db.all(`select exists (select 1 from users where email = '${req.body.email}' limit 1)`, function (err, rows) {
        if (err) {
            log(err)
        }
        if (rows[0][Object.keys(rows[0])[0]] === 1) {
            return res.status(409).send('user with this email is already registered')
        }

        else {
            db.all(`INSERT INTO users(name, email, password, device_type, last_seen) VALUES ('${req.body.name}', '${req.body.email}', '${req.body.password}', '${req.body.device_type}', '${current_type}')`, (err, rows) => {
                if (err) {
                    log(err)
                    return res.status(400).send(err.keys)
                }
                else {
                    res.status(201).send(rows)
                }
            })
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