import Logger from './logger'
import { IPatient, Patient } from '../models/patient'
import { IUser, User } from '../models/user'

export async function patientFindOrCreate(user: string, patient: string): Promise<IPatient> {
    return new Promise((resolve, reject) => {
        Patient.findOne({ id: patient }).then(async (patient: IPatient | null) => {
            if (!patient) {
                try {
                    const newPatient = new Patient({ id: patient })
                    newPatient.save((err, patient: IPatient) => {
                        if (err) return reject(null)
                        // link user to patient
                        User.findOneAndUpdate(
                            { id: user },
                            { patient: patient._id },
                            (err: Error, user: IUser) => {
                                if (err) Logger.error(`Error on patient find or create: ${err}`)
                                resolve(patient)
                            },
                        )
                    })
                } catch (error) {
                    Logger.error('Error in patientFindOrUpdate: ' + error)
                    reject(null)
                }
            } else {
                resolve(patient)
            }
        })
    })
}
