import mongoose from 'mongoose'
import { ObjectId, Document } from 'mongoose'

const patientSchema = new mongoose.Schema({
    _id: { type: String },
    idinv: { type: String, ref: 'Idinv' },
    hide_elements: { type: [String], default: [] },
    course_therapy: { type: [String], default: [] },
    relief_of_attack: { type: [String], default: [] },
    tests: { type: [String], default: [] },
})

export interface IPatient extends Document {
    users: ObjectId
    course_therapy: [String]
    relief_of_attack: [String]
    tests: [String]
}

const Patient = mongoose.model<IPatient>('Patient', patientSchema)

export { Patient }
