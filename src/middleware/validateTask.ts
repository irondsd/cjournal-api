import * as Errors from '../helpers/errors'
import Logger from '../helpers/logger'
import { Request, Response, NextFunction } from 'express'

export const validateTask = (req: Request, res: Response, next: NextFunction) => {
    if (req.body.activity_type && req.body.time) {
        next()
    } else {
        Logger.info(`task validation failed: ${JSON.stringify(req.body)}`)
        Errors.incompleteInput(res)
    }
}
