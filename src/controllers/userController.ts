import { Request, Response } from 'express'
import { User, IUser } from '../models/user'
import * as Errors from '../helpers/errors'
import Logger from '../helpers/logger'
import { ReqWithUser } from '../middleware/checkAuth'
import { idinvCreate } from './idinvController'
import { IIdinv } from 'models/idinv'

export const userGetAll = async (req: Request, res: Response) => {
    const users = await User.find()
    res.send(users)
}

export const userGetById = async (req: Request, res: Response) => {
    User.findById(req.params.id)
        .populate('patient')
        .exec(function (err: Error, user: IUser) {
            if (err) {
                res.status(400).send(err.message)
            } else {
                res.send(user)
            }
        })
}

export const userEdit = async (req: Request, res: Response) => {
    try {
        if (req.body.idinv) {
            idinvCreate(req.body.idinv)
                .then((idinv: IIdinv) => {
                    Logger.info(`idinv '${req.body.idinv}' created for user '${req.params.id}'`)
                })
                .catch(err => {
                    if (err.code !== 11000)
                        Logger.error(
                            `Error creating idinv '${req.body.idinv}' for user '${req.params.id}: ${err}`,
                        )
                })
        }

        const user = await User.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true })
        res.status(201).send(user)
    } catch (err) {
        Logger.error(err.message)
        Errors.incorrectInput(res)
    }
}

export const userLogin = (req: ReqWithUser, res: Response) => {
    const user = req.user

    User.findOne({ sub: user!.sub })
        .then((user: IUser | null) => {
            if (!user) return Errors.notFound(res)
            res.send(user)
        })
        .catch((err: any) => {
            Errors.incorrectInput(res, err.reason.message)
        })
}

export const userCreate = (username: string, sub: string): Promise<IUser> => {
    return new Promise((resolve, reject) => {
        const user = new User({ sub, username })
        user.save(function (error, user: IUser) {
            if (error) {
                Logger.error('Error in userCreate: ' + error)
                reject(error)
            }

            // create patient

            resolve(user)
        })
    })
}

export const userDelete = (req: Request, res: Response) => {
    User.deleteOne({ _id: req.params.id })
        .then((user: IUser) => {
            if (!user) return Errors.notFound(res)
            res.send(user)
        })
        .catch((err: any) => {
            Errors.incorrectInput(res, err.reason.message)
        })
}
