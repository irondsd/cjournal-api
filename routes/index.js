const express = require('express')
const router = express.Router()
const fs = require('fs')
const MarkdownIt = require('markdown-it'),
    md = new MarkdownIt()

router.get('/', (req, res) => {
    fs.readFile('README.md', 'utf8', function(err, contents) {
        if (err) {
            res.status(500).send({
                error: "can't read README.md"
            })
        } else {
            res.send(md.render(contents))
        }
    })
})

module.exports = router
