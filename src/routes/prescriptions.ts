import express from 'express'
const router = express.Router()
import stringSanitizer from '../helpers/sanitizeString'
import numberSanitizer from '../helpers/sanitizeNumber'
import * as Errors from '../helpers/errors'
import { Prescription } from '../models/prescription'

router.get('/:uid/prescriptions', (req, res) => {
    const uid = stringSanitizer(req.params.uid)

    Prescription.findOne({ users_id: uid }).then((presc: any) => {
        if (!presc) return Errors.notFound(res)
        res.send(presc)
    })
})

router.post('/:uid/prescriptions', async (req, res) => {
    const uid = stringSanitizer(req.params.uid)
    const presc = new Prescription({ users_id: uid, ...req.body })
    await presc.save()
    res.send(presc)
})

router.put('/:uid/prescriptions/', (req, res) => {
    // todo?
})

export { router as PrescriptionsRouter }
