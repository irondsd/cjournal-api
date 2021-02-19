import { timestamp } from '../helpers/timestamp'
import { Schema, model, Document, ObjectId } from 'mongoose'

const userSchema = new Schema(
    {
        username: { type: String, required: true },
        sub: { type: String, required: true },
        idinv: { type: String, required: false, ref: 'Idinv' },
        last_seen: { type: Number, default: timestamp() },
        patient: { type: Schema.Types.ObjectId, ref: 'Patients' },
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

export interface IUser extends Document {
    username: string
    sub: string
    idinv: string
    hide_elements: [string]
    last_seen: number
    patient: ObjectId
}

const User = model<IUser>('User', userSchema)

export { User }
