import { User } from '../models/user'
import { Patient, IPatient } from '../models/patient'
import { idinvCreate } from './idinvController'
import { IIdinv } from '../models/idinv'
import Logger from '../helpers/logger'

export const patientGetMany = async (filter: any): Promise<IPatient> => {
    return new Promise((resolve, reject) => {
        Patient.find(filter)
            .then((patient: IPatient) => resolve(patient))
            .catch((err: any) => reject(err))
    })
}

export const patientGetOne = async (filter: any): Promise<IPatient> => {
    return new Promise((resolve, reject) => {
        Patient.findOne(filter)
            .then((patient: IPatient) => resolve(patient))
            .catch((err: any) => reject(err))
    })
}

export const patientEdit = async (id: string, patient: IPatient): Promise<IPatient> => {
    return new Promise((resolve, reject) => {
        Patient.findByIdAndUpdate(
            id,
            { ...patient },
            { new: true },
            (err: Error, patient: IPatient | null) => {
                if (err || !patient) return reject(err || null)

                if (patient.idinv) {
                    idinvCreate(patient.idinv)
                        .then((idinv: IIdinv) => {
                            Logger.info(
                                `idinv '${patient.idinv}' created for patient '${patient._id}'`,
                            )
                        })
                        .catch(err => {
                            if (err.code !== 11000)
                                Logger.error(
                                    `Error creating idinv '${patient.idinv}' for patient '${patient._id}: ${err}`,
                                )
                        })
                    User.findOneAndUpdate(
                        { patient: patient._id },
                        { idinv: patient.idinv },
                        null,
                        (err, user) => {
                            if (err)
                                return Logger.error(
                                    `Error linking idinv ${patient.idinv} for user with patient id: ${patient._id}`,
                                )
                            Logger.info(
                                `idinv '${patient.idinv}' linked for user with patient id '${patient._id}'`,
                            )
                        },
                    )
                }

                resolve(patient)
            },
        )
    })
}

export const patientDelete = async (id: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        Patient.findByIdAndDelete(id, null, (err: Error, doc) => {
            if (err) return reject(err)
            resolve(doc)
        })
    })
}

export const patientCreate = async (patient: any): Promise<IPatient> => {
    return new Promise((resolve, reject) => {
        const newPatient = new Patient({ ...patient })
        newPatient.save((err, act: IPatient) => {
            if (err) reject(err)
            resolve(act)
        })
    })
}
