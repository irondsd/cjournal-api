const express = require('express')
const router = express.Router()
const fs = require('fs')
const errors = require('../helpers/errors')
const { exec } = require('child_process')
FileSaver = require('file-saver')

router.post('/acn', (req, res) => {
    if (!req.body.id) return errors.incompleteInput(res)

    try {
        exec(
            `${process.env.PYTHON} cjconverter/run.py -id ${req.body.id} -t ${
                req.headers.authorization.split(' ')[1]
            } -zip`,
            (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`)
                    return
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`)
                    return
                }
                // res.send(stdout)
                if (stdout.includes('finished')) {
                    sendFile('archive.zip', res)
                }
            },
        )
    } catch (error) {
        errors.internalError(res)
    }
})

const sendFile = (filename, res) => {
    const filePath = './output/' + filename // or any file format

    // Check if file specified by the filePath exists
    fs.exists(filePath, function (exists) {
        if (exists) {
            // Content-type is very interesting part that guarantee that
            // Web browser will handle response in an appropriate manner.
            res.writeHead(200, {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': 'attachment; filename=' + filename,
            })
            fs.createReadStream(filePath).pipe(res)
        } else {
            res.writeHead(400, { 'Content-Type': 'text/plain' })
            res.end('ERROR File does not exist')
        }
    })
}

module.exports = router
