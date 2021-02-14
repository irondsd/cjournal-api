import express from 'express'
const router = express.Router()
import { Task } from '../models/task'
import stringSanitizer from '../helpers/sanitizeString'
import * as Errors from '../helpers/errors'
import { validateTask } from '../middleware/validateTask'
import * as Log from '../middleware/logger'

router.get('/user/:uid/tasks', async (req, res) => {
    const uid = stringSanitizer(req.params.uid)

    const results = await Task.find({ users_id: uid, deleted: false })
        .select('activity_type time data')
        .exec()
    res.send(results)
})

router.get('/idinv/:idinv/tasks', async (req, res) => {
    const idinv = stringSanitizer(req.params.idinv)

    const results = await Task.find({ users_id: idinv, deleted: false })
        .select('activity_type time data')
        .exec()
    res.send(results)
})

router.get('/user/:uid/tasks/:aid', async (req, res) => {
    const aid = stringSanitizer(req.params.aid)
    Task.findById(aid)
        .then((tasks: any) => {
            if (!tasks) return Errors.notFound(res)
            res.send(tasks)
        })
        .catch((err: any) => {
            Log.error(err)
            Errors.incorrectInput(res, err.reason.message)
        })
})

router.get('/idinv/:idinv/tasks/:aid', async (req, res) => {
    const aid = stringSanitizer(req.params.aid)
    Task.findById(aid)
        .then((tasks: any) => {
            if (!tasks) return Errors.notFound(res)
            res.send(tasks)
        })
        .catch((err: any) => {
            Log.error(err)
            Errors.incorrectInput(res, err.reason.message)
        })
})

router.post('/users/:uid/tasks', validateTask, async (req, res) => {
    const uid = stringSanitizer(req.params.uid)

    try {
        const user = new Task({ ...req.body, users_id: uid })
        await user.save()
        res.status(201).send(user)
    } catch (err) {
        Log.error(err)
        if (err.code === 11000) return res.status(208).send()

        Errors.incorrectInput(res)
    }
})

router.post('/idinv/:idinv/tasks', validateTask, async (req, res) => {
    const idinv = stringSanitizer(req.params.idinv)

    try {
        const user = new Task({ ...req.body, idinv })
        await user.save()
        res.status(201).send(user)
    } catch (err) {
        Log.error(err)
        if (err.code === 11000) return res.status(208).send()

        Errors.incorrectInput(res)
    }
})

router.put('/users/:uid/tasks/:aid', validateTask, async (req, res) => {
    const aid = stringSanitizer(req.params.aid)

    try {
        const user = await Task.findByIdAndUpdate(aid, { ...req.body }, { new: true })
        res.status(201).send(user)
    } catch (err) {
        Log.error(err)
        Errors.incorrectInput(res)
    }
})

router.put('/idinv/:idinv/tasks/:aid', validateTask, async (req, res) => {
    const aid = stringSanitizer(req.params.aid)

    try {
        const user = await Task.findByIdAndUpdate(aid, { ...req.body }, { new: true })
        res.status(201).send(user)
    } catch (err) {
        Log.error(err)
        Errors.incorrectInput(res)
    }
})

router.delete('/users/:uid/tasks/:aid', async (req, res) => {
    const aid = stringSanitizer(req.params.aid)

    try {
        await Task.findByIdAndUpdate(aid, { deleted: true })
        res.status(204).send()
    } catch (err) {
        Log.error(err)
        Errors.incorrectInput(res)
    }
})

router.delete('/idinv/:idinv/tasks/:aid', async (req, res) => {
    const aid = stringSanitizer(req.params.aid)

    try {
        await Task.findByIdAndUpdate(aid, { deleted: true })
        res.status(204).send()
    } catch (err) {
        Log.error(err)
        Errors.incorrectInput(res)
    }
})

export { router as tasksRouter }
