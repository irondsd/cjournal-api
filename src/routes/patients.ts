import express from 'express'
const router = express.Router()
import stringSanitizer from '../helpers/sanitizeString'
import * as Errors from '../helpers/errors'
import { Patient } from '../models/patient'

router.get('/patient/', (req, res) => {
    const uid = stringSanitizer(req.params.uid)

    Patient.findOne({ users_id: uid }).then((presc: any) => {
        if (!presc) return Errors.notFound(res)
        res.send(presc)
    })
})

// todo: make

// router.post('/patient/', async (req, res) => {
//     const uid = stringSanitizer(req.params.uid)
//     const presc = new Patient({ users_id: uid, ...req.body })
//     await presc.save()
//     res.send(presc)
// })

// router.put('/patient/:id', (req, res) => {
//     // todo?
// })

export { router as PatientsRouter }
