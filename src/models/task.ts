import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
    users_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activity_type: { type: String, required: true },
    time: { type: Date, required: true },
    idinv: { type: String, required: false },
    last_updated: { type: Date, required: false, default: Date.now },
    uploaded: { type: Date, required: false, default: Date.now },
    comment: { type: String, required: false },
    data: { type: Object, required: false },
    ref_id: { type: String, required: false },
    completed: { type: Boolean, required: false, default: false },
    deleted: { type: Boolean, required: false, default: false },
})

const Task = mongoose.model('Task', taskSchema)

export { Task }
