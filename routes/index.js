const express = require('express')
const router = express.Router()
const fs = require('fs')
const MarkdownIt = require('markdown-it')
const log = require('../helpers/logger')
md = new MarkdownIt()
const errors = require('../helpers/errors')

router.get('/', (req, res) => {
    fs.readFile('README.md', 'utf8', function(err, contents) {
        if (err) {
            log.error(`can't read README.md`)
            errors.internalError(res)
        } else {
            res.send(md.render(contents))
        }
    })
})

module.exports = router
