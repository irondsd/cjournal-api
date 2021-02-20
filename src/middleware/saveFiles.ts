import path from 'path'
import multer from 'multer'
import { Request } from 'express'

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
    limits: {
        fileSize: 1024 * 1024 * 3, // up to 3 megabytes
    },
    fileFilter: fileFilter,
})

export const saveFiles = upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 },
])
