import { updateLastSeen } from '../helpers/updateLastSeen'
import * as Errors from '../helpers/errors'
import Logger from '../helpers/logger'
import fetch from 'node-fetch'
import { userFindOrCreate } from '../helpers/userFindOrCreate'
import { Request, Response, NextFunction } from 'express'
import * as dotenv from 'dotenv'
import { ObjectId } from 'mongoose'

dotenv.config()

export interface ReqWithUser extends Request {
    user?: {
        id: ObjectId
        sub: string
        name: string
        role?: string | Array<string>
        display_name?: string
    }
}

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    let token: string = req.query.token as string

    if (req.headers.authorization)
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
            token = req.headers.authorization.split(' ')[1]

    const url: string = process.env.IDENTITY as string
    fetch(url, {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + token,
        },
    })
        .then(identityUser => identityUser.json())
        .then(identityUser => {
            userFindOrCreate(identityUser.sub, identityUser.name)
                .then(res => {
                    ;(req as ReqWithUser).user = {
                        id: res,
                        ...identityUser,
                    }
                    updateLastSeen(res)
                    next()
                })
                .catch((err: any) => {
                    Logger.error(err.message)
                })
        })
        .catch(err => {
            Logger.error(err.message)
            Errors.unauthorized(res)
        })
}
