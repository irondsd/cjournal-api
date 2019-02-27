const express = require('express')
const router = express.Router()
const fs = require('fs')
const MarkdownIt = require('markdown-it'), md = new MarkdownIt();
// const log = require('../logger')

// router.use(function timeLog(req, res, next) {
//     log(req.hostname, req.ips)
//     next()
// })

router.get('/', (req, res) => {
    fs.readFile('README.md', 'utf8', function (err, contents) {
        if (err) {
            res.send(md.render("Error reading README.md"))
        }
        else {
            res.send(md.render(contents))
        }
    });
})

module.exports = router