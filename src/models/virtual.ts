import mongoose from 'mongoose'

const virtualSchema = new mongoose.Schema(
    {
        users_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        activity_type: { type: String, required: true },
        time_started: { type: Number, required: true },
        time_ended: { type: Number },
        utc_offset: { type: Number },
        idinv: { type: String },
        comment: { type: String },
        data: { type: mongoose.Schema.Types.Mixed, default: {} },
        ref_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' },
        tasks_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
        deleted: { type: Boolean, default: false },
        set_deleted: { type: Boolean, default: false },
    },
    { timestamps: true },
)

const Activity = mongoose.model('Activity', virtualSchema)

export { Activity }
