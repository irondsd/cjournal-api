import { timestamp } from 'helpers/timestamp'
import { Schema, model, Document, ObjectId } from 'mongoose'

const userSchema = new Schema({
    username: { type: String, required: true },
    sub: { type: String, required: true },
    idinv: { type: String, required: false },
    hide_elements: { type: Array, default: [] },
    last_seen: { type: Number, default: timestamp() },
    prescriptions: { type: Schema.Types.ObjectId, ref: 'Prescription' },
})

export interface IUser extends Document {
    username: string
    sub: string
    idinv: string
    hide_elements: [string]
    last_seen: number
    prescriptions: ObjectId
}

const User = model<IUser>('User', userSchema, 'users')

export { User }
