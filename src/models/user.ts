import { timestamp } from '../helpers/timestamp'
import { Schema, model, Document, ObjectId } from 'mongoose'

const userSchema = new Schema(
    {
        username: { type: String, required: true },
        sub: { type: String, required: true },
        idinv: { type: String, required: false, ref: 'Idinv' },
        patient: { type: String, ref: 'Patient' },
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
    patient: string
    created_at: number
    updated_at: number
}

const User = model<IUser>('User', userSchema)

export { User }
