const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')

router.get('/:id/patients', (req, res) => {
    query = 'select * from doctor where doctor_id = ' + req.params.id
    console.log(query)
    db.all(query, (err, rows) => {
        if (err) {
            res.status(500).send({
                error: err
            })
        }

        let patient_ids = [
            ...rows.map(el => {
                return el.patient_id
            })
        ]

        query = `select 
                users.id, name, birthday, gender, email, device_type, last_seen,
                prescriptions.course_therapy, relief_of_attack, tests
                from users 
                inner join 
                prescriptions on users.id = prescriptions.users_id where users.id in (${patient_ids})`
        console.log(query)
        db.all(query, (err, rows) => {
            if (err) return res.status(400).send({ error: err })

            res.send(rows)
        })
    })
})

router.post('/:id/patients', (req, res) => {
    if (!req.body.patient_id) {
        res.status(400).send({
            error: 'patient_id is not included in the body'
        })
    }
    let values = ''
    if (Array.isArray(req.body.patient_id)) {
        values += req.body.patient_id.map(id => {
            return ` ('${req.params.id}', '${id}') `
        })
        values = values.slice(0, -1) + '; '
    } else {
        values = ` ('${req.params.id}', '${req.body.patient_id}') `
    }

    query = `insert into doctor(doctor_id, patient_id) values
            ${values}`
    console.log(query)
    db.run(query, function(err, rows) {
        if (err) {
            console.log(err)
        } else {
            res.status(201).send()
        }
    })
})

router.delete('/:id/patients', (req, res) => {
    if (!req.body.patient_id) {
        res.status(400).send({
            error: 'patient_id is not included in the body'
        })
    }

    let patients = ''

    if (Array.isArray(req.body.patient_id)) {
        patients += req.body.patient_id
            .map(id => {
                return ` patient_id = '${id}' OR`
            })
            .join('')
        patients = patients.slice(0, -3) + '; '
    } else {
        patients += ` patient_id = '${req.body.patient_id}'`
    }

    let sql = `delete from doctor where doctor_id = '${req.params.id}' and${patients}`
    console.log(sql)
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