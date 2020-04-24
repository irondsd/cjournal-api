require('dotenv').config()
const log = require('./helpers/logger')
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const fs = require('fs')
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const index = require('./routes/index')
const users = require('./routes/users')
const auth = require('./routes/auth')
const activity = require('./routes/activity')
const virtual_activity = require('./routes/virtual_activity')
const bodyParser = require('body-parser')
const tasks = require('./routes/tasks')
const prescriptions = require('./routes/prescriptions')
const checkAuth = require('./middleware/checkAuth')
const errorHandlers = require('./helpers/errorHandlers')
const https = require('https')
const httpolyglot = require('httpolyglot')
const idinv = require('./routes/idinv')
const cors = require('cors')

app.use(cors())
app.options('*', cors())

// always redirect to https
// app.use(function(req, res, next) {
//     if (!req.secure) {
//         res.redirect(301, 'https://' + req.hostname + `:${port}` + req.originalUrl)
//     }
//     next()
// })

app.use(logger)
app.use(bodyParser.json())
app.use('/api/', index)
app.use('/api/', auth)
app.use('/api/users/', users)
app.use('/api/users/', activity)
app.use('/api/users/', tasks)
app.use('/api/users/', prescriptions)
app.use('/api/users/', virtual_activity)
app.use('/api/idinv/', idinv)

//static
app.use('/uploads/', express.static('uploads'))

// handle errors
app.use((error, req, res, next) => errorHandlers(error, req, res, next))

// alive check
app.get('/alive', (req, res) => res.sendStatus(200))

app.listen(port, () => {
    log.info(`Server started on port ${port}`)
})

function logger(req, res, next) {
    let user_ip =
        req.headers['x-forwarded-for'] ||
        req.headers['x-real-ip'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress

    log.info(`${user_ip} | ${req.method} | ${req.path}`)
    next()
}
