import { Schema, model, Document } from 'mongoose'

const patientSchema = new Schema({
    _id: { type: String },
    idinv: { type: String, ref: 'Idinv' },
    hide_elements: { type: [String], default: [] },
    course_therapy: { type: [String], default: [] },
    relief_of_attack: { type: [String], default: [] },
    tests: { type: [String], default: [] },
})

export interface IPatient extends Document {
    _id: string
    idinv?: string
    hide_elements?: [string]
    course_therapy?: [string]
    relief_of_attack?: [string]
    tests?: [string]
}

const Patient = model<IPatient>('Patient', patientSchema)

export { Patient }
