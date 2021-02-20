import mongoose from 'mongoose'

export default (value: string) => {
    return mongoose.Types.ObjectId.isValid(value)
}
