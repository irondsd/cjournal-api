import { timestamp } from './timestamp'
import Logger from '../helpers/logger'
import { User } from '../models/user'

export async function updateLastSeen(id: string) {
    try {
        User.findOneAndUpdate({ _id: id }, { last_seen: timestamp() * 1000 })
    } catch (error) {
        Logger.error('Error in update last seen: ' + error)
    }
}
