import { Schema, model, Document } from 'mongoose'

const idinvSchema = new Schema({
    _id: { type: String, required: true, unique: true },
    mon_type: { type: Number, required: true },
    mon_state: { type: Number, required: true },
    mon_number: { type: Number, required: true },
    mon_install: { type: Number, required: true },
})

export interface IIdinv extends Document {
    _id: string
    mon_type: number
    mon_state: number
    mon_number: number
    mon_install: number
}

const Idinv = model<IIdinv>('idinv', idinvSchema)

export { Idinv }
