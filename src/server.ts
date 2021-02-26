import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import cors from 'cors'
import { usersRouter } from './routes/users'
import { activityRouter } from './routes/activity'
import { tasksRouter } from './routes/tasks'
import { PatientsRouter } from './routes/patients'
import { IdinvRouter } from './routes/idinv'
import { winstonMiddleware } from './helpers/logger'
import config from './config'

const app = express()
const port = config.port || 8626

if (!config.db_url)
    throw new Error(
        'credentials for mongodb are not found. Please lookup the config file for more information',
    )

mongoose.connect(
    config.db_url,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
    },
    err => {
        if (err) return console.log(err)
        console.log('Connected to database')
    },
)
mongoose.connection.setMaxListeners(0) // allow infinite listeners

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ limit: '5mb' }))
app.use(cors())
app.use(winstonMiddleware)
app.use('/api/', usersRouter)
app.use('/api/', activityRouter)
app.use('/api/', tasksRouter)
app.use('/api/', PatientsRouter)
app.use('/api/', IdinvRouter)

app.get('/api/', (req, res) => {
    res.status(200).send('alive')
})

// serve static files
app.use('/uploads/', express.static('uploads'))

app.listen(port, () => {
    console.log(`Server is started on port ${port}`)
})
