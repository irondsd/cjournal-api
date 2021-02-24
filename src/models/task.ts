import { Schema, model, Document, ObjectId, Mixed } from 'mongoose'
import { timestamp } from '../helpers/timestamp'

const taskSchema = new Schema(
    {
        activity_type: { type: String, required: true },
        time: { type: Number, required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        patient: { type: String, required: false },
        idinv: { type: String, required: false },
        comment: { type: String, required: false },
        data: { type: Schema.Types.Mixed, required: false },
        activity: { type: Schema.Types.ObjectId, ref: 'Activity' },
        completed: { type: Boolean, required: false, default: false },
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

export interface ITask extends Document {
    activity_type: string
    time: number
    user: ObjectId
    patient: string
    idinv: string
    comment: string
    data: Mixed
    activity: ObjectId
    completed: boolean
}

const Task = model<ITask>('Task', taskSchema)

export { Task }
