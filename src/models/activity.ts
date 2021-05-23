import { timestamp } from '../helpers/timestamp'
import { Schema, model, Document, ObjectId, Mixed } from 'mongoose'

export interface IActivityUpdate {
    doctor: ObjectId
    activity_type: String
    time_started: Number
    time_ended: Number
    utc_offset: Number
    idinv: ObjectId
    comment: String
    data: Mixed
    task: ObjectId
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
        task: { type: Schema.Types.ObjectId, ref: 'Task' },
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
    activity_type: string
    time_started: number
    time_ended: number
    utc_offset: number
    user: ObjectId
    patient: ObjectId
    idinv: ObjectId
    comment: string
    data: Mixed
    task: ObjectId
    updates: Mixed
}

const Activity = model<IActivity>('Activity', activitySchema)

export interface IActivityHistory extends IActivity {
    original: ObjectId
    action: 'created' | 'updated' | 'deleted'
}

const activityHistorySchema = new Schema(
    {
        original: { type: Schema.Types.ObjectId, required: true, ref: 'Activity' },
        action: { type: String, required: true },
        activity_type: { type: String },
        time_started: { type: Number },
        time_ended: { type: Number },
        utc_offset: { type: Number },
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        patient: { type: String, ref: 'Patient' },
        idinv: { type: String, ref: 'Idinv' },
        comment: { type: String },
        data: { type: Schema.Types.Mixed, default: {} },
        task: { type: Schema.Types.ObjectId, ref: 'Task' },
        created_at: { type: Number },
    },
    {
        timestamps: {
            currentTime: () => timestamp(),
            createdAt: 'created_at',
            updatedAt: false,
        },
    },
)

const ActivityHistory = model<IActivityHistory>('ActivityHistory', activityHistorySchema)

export interface IActivityUpdates extends IActivity {
    original: ObjectId
    updated_by: ObjectId
}

const activityUpdatesSchema = new Schema(
    {
        original: { type: Schema.Types.ObjectId, required: true, ref: 'Activity' },
        updated_by: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
        activity_type: { type: String },
        time_started: { type: Number },
        time_ended: { type: Number },
        utc_offset: { type: Number },
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        patient: { type: String, ref: 'Patient' },
        idinv: { type: String, ref: 'Idinv' },
        comment: { type: String },
        data: { type: Schema.Types.Mixed, default: {} },
        task: { type: Schema.Types.ObjectId, ref: 'Task' },
        created_at: { type: Number },
    },
    {
        timestamps: {
            currentTime: () => timestamp(),
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    },
)

const ActivityUpdates = model<IActivityUpdates>('ActivityUpdates', activityUpdatesSchema)

export { Activity, ActivityHistory, ActivityUpdates }
