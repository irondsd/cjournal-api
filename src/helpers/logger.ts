import { NextFunction, Request, Response } from 'express'
import winston, { format } from 'winston'
import * as dotenv from 'dotenv'
dotenv.config()

const logConfiguration = {
    transports: [
        new winston.transports.Console({
            level: 'error',
        }),
        new winston.transports.File({
            level: process.env.LOG_LEVEL || 'debug',
            filename: './logs/combined.log',
            format: format.combine(
                format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
                format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
            ),
        }),
    ],
}

export default winston.createLogger(logConfiguration)

export const reqLogger = (req: Request, res: Response, next: NextFunction): void => {}
