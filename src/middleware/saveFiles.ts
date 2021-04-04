import path from 'path'
import multer from 'multer'
import { NextFunction, Request, Response } from 'express'
import { Types } from 'mongoose'
import Logger from '../helpers/logger'
import fs from 'fs'
import config from '../config'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        createUploadsDir().then(() => {
            cb(null, config.uploads_dir)
        })
    },
    filename: (req, file, cb) => {
        const filename = new Types.ObjectId() + path.extname(file.originalname)
        cb(null, filename)
    },
})

const createUploadsDir = async (): Promise<void> => {
    return new Promise(resolve => {
        const dir = config.uploads_dir
        if (!fs.existsSync(dir)) {
            resolve(fs.mkdirSync(dir))
        } else {
            resolve()
        }
    })
}

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (config.accepted_mime_types.includes(file.mimetype)) return cb(null, true)

    cb(null, false)
}
const upload = multer({
    storage: storage,
    limits: { fileSize: config.accepted_file_size },
    fileFilter: fileFilter,
})

const saveFilesMiddleware = upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'log', maxCount: 1 },
])

export const saveFiles = function (req: Request, res: Response, next: NextFunction) {
    const saveNext: NextFunction = () => {
        if (req.files) {
            // todo: improve
            if (!req.body.data || typeof req.body.data !== 'object') req.body.data = {}
            if ((req as any).files.audio) {
                req.body.data.audio = (req as any).files.audio[0].path.replace('\\', '/')
                Logger.info(`File successfully saved ${req.body.data.audio}`)
            }
            if ((req as any).files.image) {
                req.body.data.image = (req as any).files.image[0].path.replace('\\', '/')
                Logger.info(`File successfully saved ${req.body.data.image}`)
            }
            if ((req as any).files.log) {
                req.body.data.log = (req as any).files.log[0].path.replace('\\', '/')
                Logger.info(`File successfully saved ${req.body.data.image}`)
            }
        }

        next()
    }

    saveFilesMiddleware(req, res, saveNext)
}
