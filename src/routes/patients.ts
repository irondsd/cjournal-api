import express from 'express'
const router = express.Router()
import * as Errors from '../helpers/errors'
import { Patient } from '../models/patient'

// router.get('/patient/', (req, res) => {
//     Patient.findOne({ users_id: req.params.uid }).then((presc: any) => {
//         if (!presc) return Errors.notFound(res)
//         res.send(presc)
//     })
// })

export { router as PatientsRouter }
