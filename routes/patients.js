const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const errors = require('../helpers/errors')
const log = require('../helpers/logger')

router.get('/:id/patients', (req, res) => {
    query = 'select distinct * from doctor where doctor_id = ' + req.params.id
    log.debug(query)
    db.all(query, (err, rows) => {
        if (err) {
            log.error(`patients internal error ${err}`)
            return errors.internalError(res)
        }

        let patient_ids = [
            ...rows.map(el => {
                return el.patient_id
            }),
        ]

        query = `select 
                users.id, name, birthday, gender, username, idinv, last_seen,
                prescriptions.course_therapy, relief_of_attack, tests
                from users 
                inner join 
                prescriptions on users.id = prescriptions.users_id where users.id in (${patient_ids})`
        log.debug(query)
        db.all(query, (err, rows) => {
            if (err) {
                log.error(`patients internal error ${err}`)
                return errors.internalError(res)
            }

            res.send(rows)
        })
    })
})

router.get('/:id/doctors', (req, res) => {
    query = 'select distinct * from doctor where patient_id = ' + req.params.id
    log.debug(query)
    db.all(query, (err, rows) => {
        if (err) {
            log.error(`patients internal error ${err}`)
            return errors.internalError(res)
        }

        let doctor_ids = [
            ...rows.map(el => {
                return el.doctor_id
            }),
        ]

        query = `select 
                id, name, birthday, gender, username, idinv, last_seen from users
                where users.id in (${doctor_ids})`
        log.debug(query)
        db.all(query, (err, rows) => {
            if (err) {
                log.error(`patients internal error ${err}`)
                return errors.internalError(res)
            }

            res.send(rows)
        })
    })
})

router.post('/:id/patients', (req, res) => {
    if (!req.body.patient_id) {
        return errors.incompleteInput(res)
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
    log.debug(query)
    db.run(query, function(err, rows) {
        if (err) {
            log.error(`patients internal error ${err}`)
            return errors.internalError(res)
        } else {
            res.status(201).send()
        }
    })
})

router.delete('/:id/patients', (req, res) => {
    if (!req.body.patient_id) {
        return errors.incompleteInput(res)
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
    log.debug(sql)
    db.run(sql, (err, rows) => {
        if (err) {
            log.error(`patients internal error ${err}`)
            return errors.internalError(res)
        } else {
            res.status(204).send(rows)
        }
    })
})

module.exports = router
