const log = require('./logger')
const express = require('express')
const app = express()
const MarkdownIt = require('markdown-it'), md = new MarkdownIt();
const validate = require('./validate')
const port = process.env.PORT || 3000
const fs = require('fs')
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const index = require('./routes/index')
const users = require('./routes/users')
const activity = require('./routes/activity')
const virtual_activity = require('./routes/virtual_activity')
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use('/api/', index)
app.use('/api/users/', users)
app.use('/api/users/', activity)
app.use('/api/users/', virtual_activity)

// just for testing, will be removed later
app.get('/api/check/', function (req, res) {
    if (validate.api_key(req)) {
        return res.send('key validated')
    }
    res.status(403).send()
})

app.listen(port, () => { log(`Server started on port ${port}`) })

// TODO: update readme