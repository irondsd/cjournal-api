import { timestamp } from '../helpers/timestamp'
import { Schema, model, Document, ObjectId, Mixed } from 'mongoose'

const ActivityUpdate = new Schema(
    {
        doctor: { type: Schema.Types.ObjectId, ref: 'User' },
        activity_type: { type: String, required: true },
        time_started: { type: Number, required: true },
        time_ended: { type: Number },
        utc_offset: { type: Number },
        idinv: { type: String },
        comment: { type: String },
        data: { type: Schema.Types.Mixed, default: {} },
        tasks_id: { type: Schema.Types.ObjectId, ref: 'Task' },
        deleted: { type: Boolean, default: false },
        created_at: { type: Number },
        updated_at: { type: Number },
    },
    {
        timestamps: {
            currentTime: () => timestamp(),
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    },
)

export interface IActivityUpdate {
    doctor: ObjectId
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

const activitySchema = new Schema(
    {
        activity_type: { type: String, required: true },
        time_started: { type: Number, required: true },
        time_ended: { type: Number },
        utc_offset: { type: Number },
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        patient: { type: String, ref: 'Patient' },
        idinv: { type: String, ref: 'Idinv' },
        comment: { type: String },
        data: { type: Schema.Types.Mixed, default: {} },
        ref_id: { type: Schema.Types.ObjectId, ref: 'Activity' },
        tasks_id: { type: Schema.Types.ObjectId, ref: 'Task' },
        deleted: { type: Boolean },
        updates: ActivityUpdate,
        created_at: { type: Number },
        updated_at: { type: Number },
    },
    {
        timestamps: {
            currentTime: () => timestamp(),
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    },
)

export interface IActivity extends Document {
    activity_type: String
    time_started: Number
    time_ended: Number
    utc_offset: Number
    user: ObjectId
    patient: ObjectId
    idinv: ObjectId
    comment: String
    data: Mixed
    ref_id: ObjectId
    tasks_id: ObjectId
    deleted: Boolean
    updates: Mixed
}

const Activity = model<IActivity>('Activity', activitySchema)

export { Activity }
