import { Patient, IPatient } from '../models/patient'

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
            (err: Error, act: IPatient | null) => {
                if (err || !act) return reject(err || null)
                resolve(act)
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

export const patientCreate = async (patient: IPatient): Promise<IPatient> => {
    return new Promise((resolve, reject) => {
        const newPatient = new Patient({ ...patient })
        newPatient.save((err, act: IPatient) => {
            if (err) reject(err)
            resolve(act)
        })
    })
}
