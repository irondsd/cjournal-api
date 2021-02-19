import { Schema, model, Document } from 'mongoose'

const idinvSchema = new Schema({
    _id: { type: String },
    mon_type: { type: String, required: true },
    mon_state: { type: String, required: true },
    mon_number: { type: String, required: true },
    mon_install: { type: String, required: true },
})

export interface IIdinv extends Document {
    _id: string
    mon_type: number
    mon_state: number
    mon_number: number
    mon_install: number
}

const Idinv = model<IIdinv>('Idinv', idinvSchema)

export { Idinv }
