const path = require('path')
const multer = require('multer')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, req.params.uid + 'u' + new Date().getTime() + path.extname(file.originalname))
    }
})

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'audio/wave' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/gif' ||
        file.mimetype === 'image/jpeg'
    )
        return cb(null, true)

    cb(null, false)
}
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 3 // up to 3 megabytes
    },
    fileFilter: fileFilter
})

// const saveAudio = upload.single('audio')
const saveFiles = upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 }
])

module.exports.saveFiles = saveFiles
