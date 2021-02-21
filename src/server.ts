import express from 'express'
import bodyParser from 'body-parser'
import * as dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'
import { usersRouter } from './routes/users'
import { activityRouter } from './routes/activity'
import { tasksRouter } from './routes/tasks'
import { PatientsRouter } from './routes/patients'
import { IdinvRouter } from './routes/idinv'
import { winstonMiddleware } from './helpers/logger'
import config from '../config.json'

dotenv.config()
const app = express()
const port = config.port || 8626

if (!process.env.MONGO_DB)
    throw new Error(
        'credentials for mongodb are not found. Please provide .env file with correct credentials as DB env var',
    )

mongoose.connect(
    process.env.MONGO_DB,
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
