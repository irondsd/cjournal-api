import * as Errors from '../helpers/errors'
import * as Log from './logger'
import { Request, Response, NextFunction } from 'express'

export const validateTask = (req: Request, res: Response, next: NextFunction) => {
    if (req.body.activity_type && req.body.time) {
        next()
    } else {
        Log.info(`task validation failed: ${JSON.stringify(req.body)}`)
        Errors.incompleteInput(res)
    }
}
