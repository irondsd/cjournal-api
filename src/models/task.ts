import { Schema, model, Document, ObjectId, Mixed } from 'mongoose'
import { timestamp } from 'helpers/timestamp'
import { Number } from 'mongoose'

const taskSchema = new Schema(
    {
        users_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        activity_type: { type: String, required: true },
        time: { type: Number, required: true },
        idinv: { type: String, required: false },
        comment: { type: String, required: false },
        data: { type: Schema.Types.Mixed, required: false },
        ref_id: { type: String, required: false },
        completed: { type: Boolean, required: false, default: false },
        deleted: { type: Boolean, required: false, default: false },
    },
    { timestamps: true },
)

export interface ITask extends Document {
    users_id: ObjectId
    activity_type: String
    time: Number
    idinv: ObjectId
    comment: String
    data: Mixed
    ref_id: ObjectId
    completed: Boolean
    deleted: Boolean
}

const Task = model<ITask>('Task', taskSchema)

export { Task }
