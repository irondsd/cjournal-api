import { Request, Response } from 'express'
import { Activity, IActivity } from '../models/activity'
import stringSanitizer from '../helpers/sanitizeString'
import * as Errors from '../helpers/errors'
import Logger from '../helpers/logger'

interface IActivityFilter {
    _id?: string
    idinv?: string
    user?: string
    patient?: string
}

export const activityGetMany = async (filter: IActivityFilter): Promise<IActivity> => {
    return new Promise((resolve, reject) => {
        Activity.findOne(filter, (err: Error, activity: IActivity) => {
            if (err) reject(err.message)
            resolve(activity)
        })
    })
}

export const activityGetOne = async (filter: IActivityFilter): Promise<IActivity> => {
    return new Promise((resolve, reject) => {
        Activity.findOne(filter, (err: Error, activity: IActivity) => {
            if (err) reject(err.message)
            resolve(activity)
        })
    })
}
