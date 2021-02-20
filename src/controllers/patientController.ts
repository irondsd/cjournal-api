import { Request, Response } from 'express'
import { Patient, IPatient } from '../models/patient'
import * as Errors from '../helpers/errors'
import Logger from '../helpers/logger'

export const patientGetAll = async (req: Request, res: Response) => {
    const patients = await Patient.find()
    res.send(patients)
}

export const patientGetById = async (req: Request, res: Response) => {
    Patient.findById(req.params.idinv.id)
        .then((patient: IPatient) => {
            if (!patient) return Errors.notFound(res)
            res.send(patient)
        })
        .catch((err: any) => {
            Logger.error('Error in patientGetById controller: ' + err.message)
            Errors.incorrectInput(res, err.reason.message)
        })
}
