import Logger from './logger'
import { IPatient, Patient } from '../models/patient'
import { IUser, User } from '../models/user'

export async function patientFindOrCreate(
    user_id: string,
    patient_id: string,
): Promise<IPatient | null> {
    return new Promise((resolve, reject) => {
        Patient.findOne({ id: patient_id }).then(async (patient: IPatient | null) => {
            if (!patient) {
                try {
                    const patient = new Patient({ id: patient_id })
                    patient.save((err, patient: IPatient) => {
                        if (err) return reject(null)
                        User.findOneAndUpdate(
                            { id: user_id },
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
