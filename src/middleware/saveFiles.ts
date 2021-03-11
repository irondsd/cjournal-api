import path from 'path'
import multer from 'multer'
import { NextFunction, Request, Response } from 'express'
import { Types } from 'mongoose'
import Logger from '../helpers/logger'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/')
    },
    filename: (req, file, cb) => {
        const filename = new Types.ObjectId() + path.extname(file.originalname)
        cb(null, filename)
    },
})

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (
        file.mimetype === 'audio/wave' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpeg'
    )
        return cb(null, true)

    cb(null, false)
}
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 3 },
    fileFilter: fileFilter,
})

const saveFilesMiddleware = upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 },
])

export const saveFiles = function (req: Request, res: Response, next: NextFunction) {
    Logger.debug('SAVE FILES: ' + JSON.stringify(req.body))
    const saveNext: NextFunction = () => {
        if (req.files) {
            if (!req.body.data) req.body.data = {}
            if ((req as any).files.audio) {
                req.body.data.audio = (req as any).files.audio[0].path.replace('\\', '/')
                Logger.info(`File successfully saved ${req.body.data.audio}`)
            }
            if ((req as any).files.image) {
                req.body.data.image = (req as any).files.image[0].path.replace('\\', '/')
                Logger.info(`File successfully saved ${req.body.data.image}`)
            }
        }

        next()
    }

    saveFilesMiddleware(req, res, saveNext)
}
