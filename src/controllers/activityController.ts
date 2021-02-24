import { Activity, ActivityHistory, IActivity, IActivityHistory } from '../models/activity'
import Logger from '../helpers/logger'

interface IActivityFilter {
    _id?: string
    idinv?: string
    user?: string
    patient?: string
    original?: string
}

type historyActions = 'created' | 'edited' | 'deleted'

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

export const activityHistoryGetMany = async (
    filter: IActivityFilter,
): Promise<[IActivityHistory]> => {
    return new Promise((resolve, reject) => {
        ActivityHistory.find(filter, (err: Error, activity: [IActivityHistory]) => {
            if (err) reject(err.message)
            resolve(activity)
        })
    })
}

export const activityHistoryGetOne = async (filter: IActivityFilter): Promise<IActivityHistory> => {
    return new Promise((resolve, reject) => {
        ActivityHistory.find(filter)
            // .populate('original')
            .exec((err: Error, activity: IActivityHistory) => {
                if (err) reject(err.message)
                resolve(activity)
            })
    })
}

export const activityHistoryCreate = async (
    activity: any,
    action: historyActions,
): Promise<IActivityHistory> => {
    return new Promise((resolve, reject) => {
        const original = activity._id
        delete activity._id
        const history = new ActivityHistory({ ...activity, original, action })
        history.save((err, history: IActivityHistory) => {
            if (err) {
                reject(err)
                Logger.error(`Error in activityHistoryCreate: ${err.message}`)
            }
            Logger.info(`Activity history record created: ${history._id}`)
            resolve(history)
        })
    })
}

export const activityCreate = async (activity: IActivity): Promise<IActivity> => {
    return new Promise((resolve, reject) => {
        const record = new Activity({ ...activity })
        record.save((err, record: IActivity) => {
            if (err) reject(err)

            activityHistoryCreate(activity, 'created')

            resolve(record)
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

                activityHistoryCreate(activity, 'edited')
                resolve(act)
            },
        )
    })
}

export const activityDelete = async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        Activity.findByIdAndDelete(id, null, (err: Error, activity) => {
            if (err) return reject(err)

            activityHistoryCreate(activity, 'deleted')

            resolve()
        })
    })
}
