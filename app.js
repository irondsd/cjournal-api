const log = require('./logger')
const express = require('express')
const app = express()
const MarkdownIt = require('markdown-it'),
    md = new MarkdownIt();
const port = 3000
const fs = require('fs')

app.get('/', (req, res) => {
    fs.readFile('README.md', 'utf8', function (err, contents) {
        if (err) {
            res.send('Error reading README file')
        }
        else {
            res.send(md.render(contents))
        }
    });
})

app.listen(port, () => { log('Listening on port ' + port + '...') })