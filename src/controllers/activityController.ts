import { Request, Response } from 'express'
import { Activity, IActivity } from '../models/activity'

interface IActivityFilter {
    _id?: string
    idinv?: string
    user?: string
    patient?: string
}

export const activityGetMany = async (filter: IActivityFilter): Promise<[IActivity]> => {
    return new Promise((resolve, reject) => {
        Activity.find(filter, (err: Error, activity: [IActivity]) => {
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

export const activityCreate = async (activity: IActivity): Promise<IActivity> => {
    return new Promise((resolve, reject) => {
        const newAct = new Activity({ ...activity })
        newAct.save((err, act: IActivity) => {
            if (err) reject(err)
            resolve(act)
        })
    })
}

export const activityEdit = async (id: string, activity: IActivity): Promise<IActivity> => {
    return new Promise((resolve, reject) => {
        Activity.findByIdAndUpdate(
            id,
            { ...activity },
            { new: true },
            (err: Error, act: IActivity | null) => {
                if (err || !act) return reject(err || null)
                resolve(act)
            },
        )
    })
}

export const activityDelete = async (id: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        Activity.findByIdAndDelete(id, null, (err: Error, doc) => {
            if (err) return reject(err)
            resolve(doc)
        })
    })
}
