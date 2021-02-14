import { updateLastSeen } from '../helpers/updateLastSeen'
import * as Errors from '../helpers/errors'
import * as Log from './logger'
import fetch from 'node-fetch'
import { userFindOrCreate } from '../helpers/userFindOrCreate'
import { Request, Response, NextFunction } from 'express'
import * as dotenv from 'dotenv'
dotenv.config()

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
        .then((response) => response.json())
        .then((response) => {
            userFindOrCreate(response.sub, response.name)
                .then((res: any) => {
                    ;(req as any).user = {
                        id: res,
                        sub: response.sub,
                        username: response.name,
                    }
                    updateLastSeen(res)
                    next()
                })
                .catch((err: any) => {
                    Log.error(err)
                })
        })
        .catch((err) => {
            console.log(err)
            Errors.unauthorized(res)
        })
}
