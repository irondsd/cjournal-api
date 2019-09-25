const multer = require('multer')
const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, './audios/')
    },
    filename: (req, res, cb) => {
        cb(null, req.params.uid + 'u' + new Date().getTime() + '.wav')
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'audio/wave') cb(null, true)

    cb(null, false)
}
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 3 // up to 3 megabytes
    },
    fileFilter: fileFilter
})

const saveAudio = upload.single('audio')

module.exports.saveAudio = saveAudio
