const express = require('express')
const router = express.Router()
const fs = require('fs')
const errors = require('../helpers/errors')
const { exec } = require('child_process')
FileSaver = require('file-saver')
const log = require('../helpers/logger')

router.post('/acn', (req, res) => {
    if (!req.body.id || !req.body.idinv) return errors.incompleteInput(res)

    let modifier = `-id ${req.body.id}`
    if (req.body.idinv) modifier = `-idinv ${req.body.idinv}`

    let command = `${process.env.PYTHON} ${process.env.CJCONVERTER_PATH} ${modifier} -t ${
        req.headers.authorization.split(' ')[1]
    } -zip`

    try {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`)
                return
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`)
                return
            }

            if (stdout.includes('finished')) {
                let re = /generated (.+zip)/gm
                let file = re.exec(stdout)[1]
                sendFile(file, res)
            }
        })
    } catch (error) {
        errors.internalError(res)
    }
})

const sendFile = (filename, res) => {
    const filePath = './' + filename // or any file format

    // Check if file specified by the filePath exists
    fs.exists(filePath, function (exists) {
        if (exists) {
            // Content-type is very interesting part that guarantee that
            // Web browser will handle response in an appropriate manner.
            res.writeHead(200, {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': 'attachment; filename=' + filename,
            })

            //cleanup
            let stream = fs.createReadStream(filePath).pipe(res)

            let timeoutId = setTimeout(() => {
                fs.unlinkSync(filePath)
                if (!res.finished) res.end()
            }, 30000)

            stream.on('finish', function () {
                fs.unlink(filePath, err => {
                    if (err) {
                        log.error('output cleanup delete file error', err)
                    }
                })
                clearTimeout(timeoutId)
            })
        } else {
            res.writeHead(400, { 'Content-Type': 'text/plain' })
            res.end('ERROR File does not exist')
        }
    })
}

module.exports = router
