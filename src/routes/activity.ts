import express from 'express'
const router = express.Router()
import { Activity } from '../models/activity'
import stringSanitizer from '../helpers/sanitizeString'
import * as Errors from '../helpers/errors'
import { saveFiles } from '../middleware/saveFiles'
import { validateActivity } from '../middleware/validateActivity'
import Logger from '../helpers/logger'
import verifyObjectId from '../helpers/verifyObjectId'

router.get('/users/:uid/activity', async (req, res) => {
    const uid = stringSanitizer(req.params.uid)

    if (!verifyObjectId(uid)) return Errors.incorrectInput(res)

    try {
        const results = await Activity.find({ users_id: uid, deleted: false })
            .select('activity_type time_started time_ended data')
            .exec()
        res.send(results)
    } catch (error) {
        Logger.error('MongoDB error: ' + error.message)
    }
})

router.get('/idinv/:idinv/activity', async (req, res) => {
    const idinv = stringSanitizer(req.params.idinv)

    try {
        const results = await Activity.find({ idinv: idinv, deleted: false })
            .select('activity_type time_started time_ended data')
            .exec()
        res.send(results)
    } catch (error) {
        Logger.error(error.message)
    }
})

router.get('/users/:uid/activity/:aid', async (req, res) => {
    const aid = stringSanitizer(req.params.aid)
    Activity.findById(aid)
        .then((activity: any) => {
            if (!activity) return Errors.notFound(res)
            res.send(activity)
        })
        .catch((err: any) => {
            Logger.error(err.message)
            Errors.incorrectInput(res, err.reason.message)
        })
})

router.get('/idinv/:idinv/activity/:aid', async (req, res) => {
    const aid = stringSanitizer(req.params.aid)
    Activity.findById(aid)
        .then((activity: any) => {
            if (!activity) return Errors.notFound(res)
            res.send(activity)
        })
        .catch((err: any) => {
            Logger.error(err.message)
            Errors.incorrectInput(res, err.reason.message)
        })
})

router.post('/users/:uid/activity', saveFiles, validateActivity, async (req, res) => {
    const uid = stringSanitizer(req.params.uid)

    let data = req.body.data ? req.body.data : {}

    if (req.files) {
        if ((req as any).files.audio)
            data.audio = (req as any).files.audio[0].path.replace('\\', '/')
        if ((req as any).files.image)
            data.image = (req as any).files.image[0].path.replace('\\', '/')
    }

    try {
        const activity = new Activity({ ...req.body, users_id: uid, data })
        await activity.save()
        res.status(201).send(activity)
    } catch (err) {
        Logger.error('MongoDB error: ' + err.message)
        if (err.code === 11000) return res.status(208).send()

        Errors.incorrectInput(res)
    }
})

router.post('/idinv/:idinv/activity', saveFiles, validateActivity, async (req, res) => {
    const idinv = stringSanitizer(req.params.idinv)

    let data = req.body.data ? req.body.data : {}

    if (req.files) {
        if ((req as any).files.audio)
            data.audio = (req as any).files.audio[0].path.replace('\\', '/')
        if ((req as any).files.image)
            data.image = (req as any).files.image[0].path.replace('\\', '/')
    }

    try {
        const activity = new Activity({ ...req.body, users_id: idinv, data })
        await activity.save()
        res.status(201).send(activity)
    } catch (err) {
        if (err.code === 11000) return res.status(208).send()
        else Logger.error(err.message)

        Errors.incorrectInput(res)
    }
})

router.put('/users/:uid/activity/:aid', saveFiles, validateActivity, async (req, res) => {
    const aid = stringSanitizer(req.params.aid)
    let data = req.body.data ? req.body.data : {}

    //todo move to middleware
    if (req.files) {
        if ((req as any).files.audio)
            data.audio = (req as any).files.audio[0].path.replace('\\', '/')
        if ((req as any).files.image)
            data.image = (req as any).files.image[0].path.replace('\\', '/')
    }

    req.body.data = data

    try {
        const activity = await Activity.findByIdAndUpdate(aid, { ...req.body }, { new: true })
        res.status(201).send(activity)
    } catch (err) {
        Logger.error(err.message)
        Errors.incorrectInput(res)
    }
})

router.put('/idinv/:idinv/activity/:aid', saveFiles, validateActivity, async (req, res) => {
    const aid = stringSanitizer(req.params.aid)
    let data = req.body.data ? req.body.data : {}

    //todo move to middleware
    if (req.files) {
        if ((req as any).files.audio)
            data.audio = (req as any).files.audio[0].path.replace('\\', '/')
        if ((req as any).files.image)
            data.image = (req as any).files.image[0].path.replace('\\', '/')
    }

    try {
        const activity = await Activity.findByIdAndUpdate(aid, { ...req.body }, { new: true })
        res.status(201).send(activity)
    } catch (err) {
        Logger.error(err.message)
        Errors.incorrectInput(res)
    }
})

router.delete('/users/:uid/activity/:aid', async (req, res) => {
    const aid = stringSanitizer(req.params.aid)

    try {
        await Activity.findByIdAndUpdate(aid, { deleted: true })
        res.status(204).send()
    } catch (err) {
        Logger.error(err.message)
        Errors.incorrectInput(res)
    }
})

router.delete('/idinv/:idinv/activity/:aid', async (req, res) => {
    const aid = stringSanitizer(req.params.aid)

    try {
        await Activity.findByIdAndUpdate(aid, { deleted: true })
        res.status(204).send()
    } catch (err) {
        Logger.error(err.message)
        Errors.incorrectInput(res)
    }
})

export { router as activityRouter }
