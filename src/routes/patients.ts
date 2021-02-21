import express from 'express'
const router = express.Router()
import * as Errors from '../helpers/errors'
import { patientEdit, patientGetMany, patientGetOne } from '../controllers/patientController'

router.get('/patients/', (req, res) => {
    patientGetMany({})
        .then(patient => res.send(patient))
        .catch(err => Errors.internalError(res, err))
})

router.get('/patients/:pid', (req, res) => {
    patientGetOne({ _id: req.params.pid })
        .then(patient => {
            if (!patient) return Errors.notFound(res)
            res.send(patient)
        })
        .catch(err => Errors.internalError(res, err))
})

router.put('/patients/:pid', (req, res) => {
    patientEdit(req.params.pid, req.body)
        .then(patient => res.status(201).send(patient))
        .catch(err => Errors.internalError(res, err))
})

export { router as PatientsRouter }
