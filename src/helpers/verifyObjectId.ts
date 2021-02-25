import mongoose from 'mongoose'

export default (value: string): boolean => {
    return mongoose.Types.ObjectId.isValid(value)
}
