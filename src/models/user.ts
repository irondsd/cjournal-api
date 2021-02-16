import { ObjectId } from 'mongoose'
import { Schema, model, Document } from 'mongoose'

const userSchema = new Schema({
    username: { type: String, required: true },
    sub: { type: String, required: true },
    idinv: { type: String, required: false },
    hide_elements: { type: Array, default: [] },
    last_seen: { type: Date, default: Date.now },
    prescriptions: { type: Schema.Types.ObjectId, ref: 'Prescription' },
})

export interface IUser extends Document {
    username: string
    sub: string
    idinv: string
    hide_elements: [string]
    last_seen: Date
    prescriptions: ObjectId
}

const User = model<IUser>('User', userSchema, 'users')

export { User }
