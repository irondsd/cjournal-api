import {
    Activity,
    ActivityHistory,
    IActivity,
    IActivityHistory,
    ActivityUpdates,
    IActivityUpdates,
} from '../models/activity'
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

export const activityCreate = async (activity: IActivity): Promise<IActivity> => {
    return new Promise((resolve, reject) => {
        const record = new Activity({ ...activity })
        record.save((err, record: IActivity) => {
            if (err) return reject(err)

            activityHistoryCreate(activity._id, activity, 'created')

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
                if (err || !act) return reject(err || { code: 404 })

                activityHistoryCreate(id, activity, 'edited')
                resolve(act)
            },
        )
    })
}

export const activityDelete = async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        Activity.findOneAndDelete({ _id: id }, null, (err, activity) => {
            if (err) return reject(err)

            if (activity) activityHistoryCreate(id, (activity as any)._doc, 'deleted')
            resolve()
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
    id: string,
    activity: any,
    action: historyActions,
): Promise<IActivityHistory> => {
    return new Promise((resolve, reject) => {
        if (activity._id) delete activity._id

        const history = new ActivityHistory({ ...activity, original: id, action })
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

export const activityUpdatesGetMany = async (
    filter: IActivityFilter,
): Promise<[IActivityUpdates]> => {
    return new Promise((resolve, reject) => {
        ActivityUpdates.find(filter, (err: Error, activity: [IActivityUpdates]) => {
            if (err) reject(err.message)
            resolve(activity)
        })
    })
}

export const activityUpdatesGetOne = async (filter: IActivityFilter): Promise<IActivityUpdates> => {
    return new Promise((resolve, reject) => {
        ActivityUpdates.find(filter)
            // .populate('original')
            .exec((err: Error, activity: IActivityUpdates) => {
                if (err) reject(err.message)
                resolve(activity)
            })
    })
}

export const activityUpdatesCreate = async (
    id: string,
    activity: any,
    doctor: string,
): Promise<IActivityUpdates> => {
    return new Promise((resolve, reject) => {
        if (activity._id) delete activity._id

        const history = new ActivityUpdates({ ...activity, original: id, update_by: doctor })
        history.save((err, history: IActivityUpdates) => {
            if (err) {
                reject(err)
                Logger.error(`Error in activityUpdatesCreate: ${err.message}`)
            }

            Logger.info(`Activity history record created: ${history._id}`)
            resolve(history)
        })
    })
}

export const activityUpdatesEdit = async (
    id: string,
    activity: IActivity,
): Promise<IActivityUpdates> => {
    return new Promise((resolve, reject) => {
        ActivityUpdates.findByIdAndUpdate(
            id,
            { ...activity },
            { new: true },
            (err: Error, act: IActivityUpdates | null) => {
                if (err || !act) return reject(err || { code: 404 })

                resolve(act)
            },
        )
    })
}

export const activityUpdatesDelete = async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        ActivityUpdates.findOneAndDelete({ _id: id }, null, (err, activity) => {
            if (err) return reject(err)

            resolve()
        })
    })
}
