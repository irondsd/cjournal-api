import { Request, Response } from 'express'
import { User, IUser } from '../models/user'
import stringSanitizer from '../helpers/sanitizeString'
import * as Errors from '../helpers/errors'
import Logger from '../helpers/logger'
import { ReqWithUser } from 'middleware/checkAuth'

export const userGetAll = async (req: Request, res: Response) => {
    const users = await User.find()
    res.send(users)
}

export const userGetById = async (req: Request, res: Response) => {
    const id = stringSanitizer(req.params.id)
    User.findById(id)
        .populate('prescriptions')
        .then((user: typeof User) => {
            if (!user) return Errors.notFound(res)
            res.send(user)
        })
        .catch((err: any) => {
            Errors.incorrectInput(res, err.reason.message)
        })
}

export const userEdit = async (req: Request, res: Response) => {
    const id = stringSanitizer(req.params.id)

    try {
        const user = await User.findByIdAndUpdate(id, { ...req.body }, { new: true })
        res.status(201).send(user)
    } catch (err) {
        Logger.error(err.message)
        Errors.incorrectInput(res)
    }
}

export const userLogin = (req: ReqWithUser, res: Response) => {
    const user = req.user

    User.find({ sub: user!.sub })
        .then((user: IUser) => {
            if (!user) return Errors.notFound(res)
            res.send(user)
        })
        .catch((err: any) => {
            Errors.incorrectInput(res, err.reason.message)
        })
}
