import Logger from '../helpers/logger'
import { IUser, User } from '../models/user'
import { ObjectId, CallbackError } from 'mongoose'

export async function userFindOrCreate(sub: string, username: string): Promise<ObjectId> {
    return new Promise((resolve, reject) => {
        User.findOne({ sub: sub }, null, null, (err: CallbackError, user: IUser | null) => {
            if (!user) {
                const user = new User({ sub, username })
                user.save((err: CallbackError, user: IUser) => {
                    if (err) {
                        Logger.error('Error in userFindOrUpdate: ' + err)
                        reject(err)
                    }
                    resolve(user._id)
                })
            } else {
                // there's user!
                resolve(user._id)
            }
        })
    })
}
