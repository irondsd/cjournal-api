import * as Errors from '../helpers/errors'
import { Request, Response, NextFunction } from 'express'
import Logger from '../helpers/logger'

export const validateActivity = (req: Request, res: Response, next: NextFunction) => {
    if (
        (req.body.user || req.body.idinv || req.body.patient) &&
        req.body.activity_type &&
        req.body.time_started
    ) {
        next()
    } else {
        Logger.info(`activity validation error: ${JSON.stringify(req.body)}`)
        Errors.incompleteInput(res)
    }
}
