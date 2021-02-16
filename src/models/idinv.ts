import { Schema, model, ObjectId, Document } from 'mongoose'

const idinvSchema = new Schema({
    users_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    idinv: { type: String, required: true },
    mon_type: { type: Number, required: true },
    mon_state: { type: Number, required: true },
    mon_number: { type: Number, required: true },
    mon_install: { type: Number, required: true },
})

export interface IIdinv extends Document {
    users_id: ObjectId
    idinv: string
    mon_type: number
    mon_state: number
    mon_number: number
    mon_install: number
}

const Idinv = model<IIdinv>('idinv', idinvSchema)

export { Idinv }
