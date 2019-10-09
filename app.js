require('dotenv').config()
const log = require('./helpers/logger')
const express = require('express')
const app = express()
const port = process.env.PORT || 3001
const fs = require('fs')
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const index = require('./routes/index')
const users = require('./routes/users')
const activity = require('./routes/activity')
const virtual_activity = require('./routes/virtual_activity')
const bodyParser = require('body-parser')
const login = require('./routes/login')
const tasks = require('./routes/tasks')
const patients = require('./routes/patients')
const prescriptions = require('./routes/prescriptions')
const checkAuth = require('./middleware/checkAuth')
const errorHandlers = require('./helpers/errorHandlers')

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    res.header('Access-Control-Allow-Methods', '*')
    next()
})
app.use(logger)
app.use(bodyParser.json())
app.use('/api/', index)
app.use('/api/', login)
app.use('/api/users/', patients)
app.use('/api/users/', users)
app.use('/api/users/', activity)
app.use('/api/users/', tasks)
app.use('/api/users/', prescriptions)
app.use('/api/users/', virtual_activity)
app.use('/audios/', express.static('audios'))

// handle errors
app.use((error, req, res, next) => errorHandlers(error, req, res, next))

// just for testing, will be removed later
app.get('/api/check/', checkAuth, (req, res, next) => {
    res.send(req.decoded)
})

app.listen(port, () => {
    log(`Server started on port ${port}`)
})

function logger(req, res, next) {
    log(`${req.method} ${req.url}`)
    next()
}
