import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema(
    {
        users_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        activity_type: { type: String, required: true },
        time_started: { type: Date, required: true },
        time_ended: { type: Date },
        utc_offset: { type: Number },
        idinv: { type: String },
        comment: { type: String },
        data: { type: mongoose.Schema.Types.Mixed, default: {} },
        ref_id: { type: String },
        tasks_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
        deleted: { type: Boolean, default: false },
    },
    { timestamps: true },
)

const Activity = mongoose.model('Activity', activitySchema)

export { Activity }
