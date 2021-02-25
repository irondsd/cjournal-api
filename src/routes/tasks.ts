import express from 'express'
const router = express.Router()
import { Task } from '../models/task'
import * as Errors from '../helpers/errors'
import { validateTask } from '../middleware/validateTask'
import Logger from '../helpers/logger'

router.get('/user/:uid/tasks', async (req, res) => {
    const results = await Task.find({ user: req.params.uid, deleted: false })
        .select('activity_type time data')
        .exec()
    res.send(results)
})

router.get('/idinv/:idinv/tasks', async (req, res) => {
    const results = await Task.find({ idinv: req.params.idinv, deleted: false })
        .select('activity_type time data')
        .exec()
    res.send(results)
})

router.get('/user/:uid/tasks/:aid', async (req, res) => {
    Task.findById(req.params.aid)
        .then((tasks: any) => {
            if (!tasks) return Errors.notFound(res)
            res.send(tasks)
        })
        .catch((err: any) => {
            Logger.error(err.message)
            Errors.incorrectInput(res, err.reason.message)
        })
})

router.get('/idinv/:idinv/tasks/:aid', async (req, res) => {
    Task.findById(req.params.aid)
        .then((tasks: any) => {
            if (!tasks) return Errors.notFound(res)
            res.send(tasks)
        })
        .catch((err: any) => {
            Logger.error(err.message)
            Errors.incorrectInput(res, err.reason.message)
        })
})

router.post('/users/:uid/tasks', validateTask, async (req, res) => {
    try {
        const user = new Task({ ...req.body, user: req.params.uid })
        await user.save()
        res.status(201).send(user)
    } catch (err) {
        Logger.error(err.message)
        if (err.code === 11000) return res.status(208).send()

        Errors.incorrectInput(res)
    }
})

router.post('/idinv/:idinv/tasks', validateTask, async (req, res) => {
    try {
        const user = new Task({ ...req.body, idinv: req.params.idinv })
        await user.save()
        res.status(201).send(user)
    } catch (err) {
        Logger.error(err.message)
        if (err.code === 11000) return res.status(208).send()

        Errors.incorrectInput(res)
    }
})

router.put('/users/:uid/tasks/:aid', validateTask, async (req, res) => {
    try {
        const user = await Task.findByIdAndUpdate(req.params.aid, { ...req.body }, { new: true })
        res.status(201).send(user)
    } catch (err) {
        Logger.error(err.message)
        Errors.incorrectInput(res)
    }
})

router.put('/idinv/:idinv/tasks/:aid', validateTask, async (req, res) => {
    try {
        const user = await Task.findByIdAndUpdate(req.params.aid, { ...req.body }, { new: true })
        res.status(201).send(user)
    } catch (err) {
        Logger.error(err.message)
        Errors.incorrectInput(res)
    }
})

router.delete('/users/:uid/tasks/:aid', async (req, res) => {
    try {
        await Task.findByIdAndUpdate(req.params.aid, { deleted: true })
        res.status(204).send()
    } catch (err) {
        Logger.error(err.message)
        Errors.incorrectInput(res)
    }
})

router.delete('/idinv/:idinv/tasks/:aid', async (req, res) => {
    try {
        await Task.findByIdAndUpdate(req.params.aid, { deleted: true })
        res.status(204).send()
    } catch (err) {
        Logger.error(err.message)
        Errors.incorrectInput(res)
    }
})

export { router as tasksRouter }
