import { timestamp } from './timestamp'
import Logger from '../helpers/logger'
import { User } from '../models/user'
import { ObjectId } from 'mongoose'

export async function updateLastSeen(id: ObjectId) {
    try {
        User.findOneAndUpdate({ _id: id }, { last_seen: timestamp() * 1000 })
    } catch (error) {
        Logger.error('Error in update last seen: ' + error)
    }
}
