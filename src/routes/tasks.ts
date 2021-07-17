import express from 'express'
const router = express.Router()
import * as Errors from '../helpers/errors'
import { validateTask } from '../middleware/validateTask'
import Logger from '../helpers/logger'
import {
    taskComplete,
    taskCreate,
    taskDelete,
    taskEdit,
    taskGetMany,
    taskGetOne,
} from '../controllers/taskController'

// get all

router.get('/users/:uid/tasks', async (req, res) => {
    taskGetMany({ user: req.params.uid })
        .then(tasks => res.send(tasks))
        .catch(err => Errors.internalError(res, err.message))
})

router.get('/idinv/:idinv/tasks', async (req, res) => {
    taskGetMany({ idinv: req.params.idinv })
        .then(tasks => res.send(tasks))
        .catch(err => Errors.internalError(res, err.message))
})

router.get('/patients/:pid/tasks', async (req, res) => {
    taskGetMany({ patient: req.params.pid })
        .then(tasks => res.send(tasks))
        .catch(err => Errors.internalError(res, err.message))
})

// get by id

router.get('/users/:uid/tasks/:tid', async (req, res) => {
    taskGetOne({ user: req.params.uid, _id: req.params.tid })
        .then(tasks => {
            if (!tasks) return Errors.notFound(res)
            res.send(tasks)
        })
        .catch(err => {
            Logger.error(err.message)
            Errors.incorrectInput(res, err.reason.message)
        })
})

router.get('/idinv/:idinv/tasks/:tid', async (req, res) => {
    taskGetOne({ idinv: req.params.idinv, _id: req.params.tid })
        .then(tasks => {
            if (!tasks) return Errors.notFound(res)
            res.send(tasks)
        })
        .catch(err => {
            Logger.error(err.message)
            Errors.incorrectInput(res, err.reason.message)
        })
})

router.get('/patients/:pid/tasks/:tid', async (req, res) => {
    taskGetOne({ patient: req.params.pid, _id: req.params.tid })
        .then(tasks => {
            if (!tasks) return Errors.notFound(res)
            res.send(tasks)
        })
        .catch(err => {
            Logger.error(err.message)
            Errors.incorrectInput(res, err.reason.message)
        })
})

// post

router.post('/users/:uid/tasks', validateTask, async (req, res) => {
    taskCreate({ ...req.body, user: req.params.uid })
        .then(task => res.send(task))
        .catch(err => {
            Logger.error(err.message)
            if (err.code === 11000) return res.status(208).send()

            Errors.incorrectInput(res)
        })
})

router.post('/idinv/:idinv/tasks', validateTask, async (req, res) => {
    taskCreate({ ...req.body, idinv: req.params.idinv })
        .then(task => res.send(task))
        .catch(err => {
            Logger.error(err.message)
            if (err.code === 11000) return res.status(208).send()

            Errors.incorrectInput(res)
        })
})

router.post('/patients/:pid/tasks', validateTask, async (req, res) => {
    taskCreate({ ...req.body, patient: req.params.pid })
        .then(task => res.send(task))
        .catch(err => {
            Logger.error(err.message)
            if (err.code === 11000) return res.status(208).send()

            Errors.incorrectInput(res)
        })
})

router.post('/users/:uid/tasks/:tid/complete', async (req, res) => {
    taskComplete(req.params.tid)
        .then(task => res.status(201).send(task))
        .catch(err => {
            Logger.error(err.message)
            Errors.incorrectInput(res)
        })
})

// put

router.put('/users/:uid/tasks/:tid', validateTask, async (req, res) => {
    taskEdit(req.params.tid, { ...req.body })
        .then(task => res.status(201).send(task))
        .catch(err => {
            Logger.error(err.message)
            Errors.incorrectInput(res)
        })
})

router.put('/idinv/:idinv/tasks/:tid', validateTask, async (req, res) => {
    taskEdit(req.params.tid, { ...req.body })
        .then(task => res.status(201).send(task))
        .catch(err => {
            Logger.error(err.message)
            Errors.incorrectInput(res)
        })
})

router.put('/patients/:pid/tasks/:tid', validateTask, async (req, res) => {
    taskEdit(req.params.tid, { ...req.body })
        .then(task => res.status(201).send(task))
        .catch(err => {
            Logger.error(err.message)
            Errors.incorrectInput(res)
        })
})

// delete

router.delete('/users/:uid/tasks/:tid', async (req, res) => {
    taskDelete(req.params.tid)
        .then(() => res.status(204).send())
        .catch(err => {
            Errors.internalError(res, err)
        })
})

router.delete('/idinv/:idinv/tasks/:tid', async (req, res) => {
    taskDelete(req.params.tid)
        .then(() => res.status(204).send())
        .catch(err => {
            Errors.internalError(res, err)
        })
})

router.delete('/patients/:pid/tasks/:tid', async (req, res) => {
    taskDelete(req.params.tid)
        .then(() => res.status(204).send())
        .catch(err => {
            Errors.internalError(res, err)
        })
})

export { router as tasksRouter }
