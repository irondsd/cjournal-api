import Logger from '../helpers/logger'
import { User } from '../models/user'

export async function userFindOrCreate(sub: string, username: string) {
    return new Promise((resolve, reject) => {
        User.findOne({ sub: sub }).then(async (user: any) => {
            if (!user) {
                try {
                    const user = new User({ sub, username })
                    await user.save()
                    resolve(user._id)
                } catch (error) {
                    Logger.error('Error in userFindOrUpdate: ' + error)
                    reject(error)
                }
            } else {
                // there's user!
                resolve(user._id)
            }
        })
    })
}