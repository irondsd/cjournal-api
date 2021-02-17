import mongoose from 'mongoose'
import { ObjectId, Document } from 'mongoose'

const prescriptionSchema = new mongoose.Schema({
    users: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    course_therapy: { type: [String], default: [] },
    relief_of_attack: { type: [String], default: [] },
    tests: { type: [String], default: [] },
})

export interface IPrescription extends Document {
    users: ObjectId
    course_therapy: [String]
    relief_of_attack: [String]
    tests: [String]
}

const Prescription = mongoose.model<IPrescription>('Prescription', prescriptionSchema)

export { Prescription }
