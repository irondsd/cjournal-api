const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')

router.get('/:id/prescriptions', (req, res) => {
    query = 'select * from prescriptions where users_id = ' + req.params.id
    console.log(query)
    db.all(query, (err, rows) => {
        if (err) {
            res.status(500).send({
                error: err
            })
        }
        res.send(rows[0])
    })
})

router.post('/:id/prescriptions', (req, res) => {
    query = `insert into prescriptions(users_id, course_therapy, relief_of_attack, tests) values 
            ('${req.params.id}', '${req.body.course_therapy}', '${req.body.relief_of_attack}', '${req.body.tests}')`
    console.log(query)
    db.run(query, function(err, rows) {
        if (err) {
            console.log(err)
        } else {
            res.status(201).send()
        }
    })
})

router.put('/:id/prescriptions/', (req, res) => {
    query = `update prescriptions set course_therapy = '${req.body.course_therapy}', relief_of_attack = '${
        req.body.relief_of_attack
    }', tests = '${req.body.tests}' where users_id = '${req.params.id}'`
    console.log(query)
    db.run(query, function(err, rows) {
        if (err) {
            console.log(err)
        } else {
            res.status(201).send()
        }
    })
})

router.delete('/:uid/tasks/:aid', (req, res) => {
    if (!req.params.aid) {
        return res.status(400).send({
            error: 'Did not receive enough information'
        })
    }

    let sql = `update tasks set deleted = '1', last_updated = '${timestamp()}' where id = '${req.params.aid}'`
    db.run(sql, (err, rows) => {
        if (err) {
            res.status(400).send({
                error: err
            })
        } else {
            res.status(204).send(rows)
        }
    })
})

module.exports = router
