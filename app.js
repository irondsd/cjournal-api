const log = require('./logger')
const express = require('express')
const app = express()
const MarkdownIt = require('markdown-it'), md = new MarkdownIt();
const validate = require('./validate')
const port = process.env.PORT || 3000
const fs = require('fs')
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
app.use(express.json())
const index = require('./routes/index')
const users = require('./routes/users')
app.use('/', index)
app.use('/', users)

app.get('/api/check/', function (req, res) {
    if (validate.api_key(req)) {
        return res.send('key validated')
    }
    res.status(403).send()
})

app.listen(port, () => { log(`Listening on port ${port}...`) })