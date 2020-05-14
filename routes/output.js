const express = require('express')
const router = express.Router()
const fs = require('fs')
const errors = require('../helpers/errors')
const { spawn } = require('child_process')

router.post('/acn', (req, res) => {
    if (!req.body.id) return errors.incompleteInput(res)

    var dataToSend
    // spawn new child process to call the python script
    const python = spawn('python', [
        'cjconverter/run.py',
        `-id ${req.body.id}`,
        `-u 217.197.236.243:8626`,
        `-t ${123}`,
    ])
    // collect data from script
    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...')
        dataToSend = data.toString()
    })
    // in close event we are sure that stream from child process is closed
    python.on('close', code => {
        console.log(`child process close all stdio with code ${code}`)
        // send data to browser
        res.send(dataToSend)
    })
})

module.exports = router
