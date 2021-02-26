import express from 'express'
const router = express.Router()
import * as Errors from '../helpers/errors'
import { validateTask } from '../middleware/validateTask'
import Logger from '../helpers/logger'
import {
    taskCreate,
    taskDelete,
    taskEdit,
    taskGetMany,
    taskGetOne,
} from '../controllers/taskController'

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

export { router as tasksRouter }
