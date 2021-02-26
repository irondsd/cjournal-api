import { Task, ITask } from '../models/task'

interface ITaskFilter {
    _id?: string
    idinv?: string
    user?: string
    patient?: string
}

export const taskGetMany = async (filter: ITaskFilter): Promise<[ITask]> => {
    return new Promise((resolve, reject) => {
        Task.find(filter, (err: Error, task: [ITask]) => {
            if (err) reject(err.message)
            resolve(task)
        })
    })
}

export const taskGetOne = async (filter: ITaskFilter): Promise<ITask> => {
    return new Promise((resolve, reject) => {
        Task.findOne(filter, (err: Error, task: ITask) => {
            if (err) reject(err.message)
            resolve(task)
        })
    })
}

export const taskCreate = async (task: ITask): Promise<ITask> => {
    return new Promise((resolve, reject) => {
        const record = new Task({ ...task })
        record.save((err, record: ITask) => {
            if (err) reject(err)

            resolve(record)
        })
    })
}

export const taskEdit = async (id: string, task: ITask): Promise<ITask> => {
    return new Promise((resolve, reject) => {
        Task.findByIdAndUpdate(id, { ...task }, { new: true }, (err: Error, task: ITask | null) => {
            if (err || !task) return reject(err || { code: 404 })

            resolve(task)
        })
    })
}

export const taskDelete = async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        Task.findOneAndDelete({ _id: id }, null, (err, task) => {
            if (err) return reject(err)

            resolve()
        })
    })
}
