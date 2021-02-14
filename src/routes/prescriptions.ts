import express from 'express'
const router = express.Router()
import stringSanitizer from '../helpers/sanitizeString'
import * as Errors from '../helpers/errors'
import { Prescription } from '../models/prescription'

router.get('/users/:uid/prescriptions', (req, res) => {
    const uid = stringSanitizer(req.params.uid)

    Prescription.findOne({ users_id: uid }).then((presc: any) => {
        if (!presc) return Errors.notFound(res)
        res.send(presc)
    })
})

router.post('/users/:uid/prescriptions', async (req, res) => {
    const uid = stringSanitizer(req.params.uid)
    const presc = new Prescription({ users_id: uid, ...req.body })
    await presc.save()
    res.send(presc)
})

router.put('/users/:uid/prescriptions/', (req, res) => {
    // todo?
})

export { router as PrescriptionsRouter }
