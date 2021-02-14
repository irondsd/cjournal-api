import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    sub: { type: String, required: true },
    idinv: { type: String, required: false },
    hide_elements: { type: Array, default: [] },
    last_seen: { type: Date, default: Date.now },
    prescriptions: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
})

const User = mongoose.model('User', userSchema, 'users')

export { User }
