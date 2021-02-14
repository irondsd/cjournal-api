import * as Errors from '../helpers/errors'
import * as Log from './logger'
import { Request, Response, NextFunction } from 'express'

export const validateActivity = (req: Request, res: Response, next: NextFunction) => {
    if ((req.body._id || req.body.idinv) && req.body.activity_type && req.body.time_started) {
        next()
    } else {
        Log.info(`activity validation failed: ${JSON.stringify(req.body)}`)
        Errors.incompleteInput(res)
    }
}
