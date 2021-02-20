import path from 'path'
import multer from 'multer'
import { NextFunction, Request, Response } from 'express'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/')
    },
    filename: (req, file, cb) => {
        // todo: better error handling
        if (!req.body._id) return cb(new Error('no _id provided'), '')
        cb(null, req.body._id + path.extname(file.originalname))
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
    const saveNext: NextFunction = () => {
        if (req.files) {
            if ((req as any).files.audio)
                req.body.data.audio = (req as any).files.audio[0].path.replace('\\', '/')
            if ((req as any).files.image)
                req.body.data.image = (req as any).files.image[0].path.replace('\\', '/')
        }

        next()
    }

    saveFilesMiddleware(req, res, saveNext)
}
