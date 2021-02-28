import * as Errors from '../helpers/errors'
import Logger from '../helpers/logger'
import fetch from 'node-fetch'
import { userFindOrCreate } from '../helpers/userFindOrCreate'
import { Request, Response, NextFunction } from 'express'
import { ObjectId } from 'mongoose'
import config from '../config'

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

    const url: string = config.identity as string
    fetch(url, {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + token,
        },
    })
        .then(response => {
            if (response.status === 401) throw new Error('unauthorized')
            return response.json()
        })
        .then(identityUser => {
            console.log(identityUser)
            userFindOrCreate(identityUser.sub, identityUser.name)
                .then(res => {
                    ;(req as ReqWithUser).user = {
                        id: res,
                        ...identityUser,
                    }
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
