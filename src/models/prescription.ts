import mongoose from 'mongoose'

const prescriptionSchema = new mongoose.Schema({
    users_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course_therapy: { type: [String], default: [] },
    relief_of_attack: { type: [String], default: [] },
    tests: { type: [String], default: [] },
})

const Prescription = mongoose.model('Prescription', prescriptionSchema, 'prescriptions')

export { Prescription }
