import { Schema, model, Document, ObjectId, Mixed } from 'mongoose'

const activitySchema = new Schema(
    {
        users_id: { type: Schema.Types.ObjectId, ref: 'User' },
        activity_type: { type: String, required: true },
        time_started: { type: Number, required: true },
        time_ended: { type: Number },
        utc_offset: { type: Number },
        idinv: { type: String },
        comment: { type: String },
        data: { type: Schema.Types.Mixed, default: {} },
        ref_id: { type: Schema.Types.ObjectId, ref: 'Activity' },
        tasks_id: { type: Schema.Types.ObjectId, ref: 'Task' },
        deleted: { type: Boolean, default: false },
    },
    { timestamps: true },
)

export interface IActivity extends Document {
    users_id: ObjectId
    activity_type: String
    time_started: Number
    time_ended: Number
    utc_offset: Number
    idinv: ObjectId
    comment: String
    data: Mixed
    ref_id: ObjectId
    tasks_id: ObjectId
    deleted: Boolean
}

const Activity = model<IActivity>('Activity', activitySchema)

export { Activity }
