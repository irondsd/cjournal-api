import fs from 'fs'
import { Request, Response, NextFunction } from 'express'
const dir = './logs/'

function log(type: String, message: String, silent = true) {
    var timestamp = new Date()
    if (!silent) console.log(message)
    fs.appendFile(
        `${dir}${type.toLowerCase()}.log`,
        `${type} : ${timestamp.toString().slice(4, 24)} : ${message}\n`,
        err => {
            if (err?.code === 'ENOENT') {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir)
                    fs.appendFile(
                        `${dir}${type.toLowerCase()}.log`,
                        `${type} : ${timestamp.toString().slice(4, 24)} : ${message}\n`,
                        err => {
                            if (err) console.log(`logger error need inspection ${err}`)
                        },
                    )
                }
            }
            //
        },
    )
}

export const debug = function debug(message: String) {
    log('DEBUG', message, false)
}

export const info = function info(message: String) {
    log('INFO', message, true)
}

export const error = function error(message: String) {
    log('ERROR', message, false)
}

export function logger(req: Request, res: Response, next: NextFunction) {
    let user_ip =
        req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress
    info(`${user_ip} | ${req.method} | ${req.path}`)
    next()
}
