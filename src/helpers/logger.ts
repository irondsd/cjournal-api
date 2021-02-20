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
                format.printf(info => `${info.level}: [${info.timestamp}] ${info.message}`),
            ),
        }),
    ],
}

export default winston.createLogger(logConfiguration)

export const winstonMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const Logger = winston.createLogger(logConfiguration)
    const { authorization, ...headersWithNoToken } = req.headers
    Logger.log(
        'http',
        `${req.ip} ${req.method} ${req.originalUrl} ${JSON.stringify(
            headersWithNoToken,
        )} ${JSON.stringify(req.body)}`,
    )
    next()
}
