import express from 'express'
const router = express.Router()
import * as Errors from '../helpers/errors'
import { saveFiles } from '../middleware/saveFiles'
import { validateActivity } from '../middleware/validateActivity'
import verifyObjectId from '../helpers/verifyObjectId'
import {
    activityGetOne,
    activityGetMany,
    activityCreate,
    activityEdit,
    activityDelete,
    activityHistoryGetMany,
    activityHistoryGetOne,
} from '../controllers/activityController'

// get by user

router.get('/users/:uid/activity', async (req, res) => {
    if (!verifyObjectId(req.params.uid)) return Errors.incorrectInput(res)

    activityGetMany({ user: req.params.uid })
        .then(activity => res.send(activity))
        .catch(err => Errors.internalError(res, err))
})

router.get('/users/:uid/activity/:aid', async (req, res) => {
    activityGetOne({ user: req.params.uid, _id: req.params.aid })
        .then(activity => res.send(activity))
        .catch(err => Errors.internalError(res))
})

router.get('/users/:uid/activity/history', async (req, res) => {
    if (!verifyObjectId(req.params.uid)) return Errors.incorrectInput(res)

    activityHistoryGetMany({ user: req.params.uid })
        .then(activity => res.send(activity))
        .catch(err => Errors.internalError(res, err))
})

router.get('/users/:uid/activity/history/:aid', async (req, res) => {
    if (!verifyObjectId(req.params.uid)) return Errors.incorrectInput(res)

    activityHistoryGetOne({ user: req.params.uid, original: req.params.aid })
        .then(activity => res.send(activity))
        .catch(err => Errors.internalError(res, err))
})

// get by patient

router.get('/patients/:pid/activity', async (req, res) => {
    activityGetMany({ patient: req.params.pid })
        .then(activity => res.send(activity))
        .catch(err => Errors.internalError(res, err))
})

router.get('/patients/:pid/activity/:aid', async (req, res) => {
    if (!verifyObjectId(req.params.aid)) return Errors.incorrectInput(res)

    activityGetMany({ patient: req.params.pid, _id: req.params.aid })
        .then(activity => res.send(activity))
        .catch(err => Errors.internalError(res, err))
})

router.get('/patients/:pid/activity/history', async (req, res) => {
    if (!verifyObjectId(req.params.pid)) return Errors.incorrectInput(res)

    activityHistoryGetMany({ patient: req.params.pid })
        .then(activity => res.send(activity))
        .catch(err => Errors.internalError(res, err))
})

router.get('/patients/:uid/activity/history/:aid', async (req, res) => {
    if (!verifyObjectId(req.params.pid)) return Errors.incorrectInput(res)

    activityHistoryGetOne({ patient: req.params.pid, original: req.params.aid })
        .then(activity => res.send(activity))
        .catch(err => Errors.internalError(res, err))
})

// get by idinv

router.get('/idinv/:idinv/activity', async (req, res) => {
    activityGetMany({ idinv: req.params.idinv })
        .then(activity => {
            res.send(activity)
        })
        .catch(err => Errors.internalError(res))
})

router.get('/idinv/:idinv/activity/history', async (req, res) => {
    activityHistoryGetMany({ idinv: req.params.idinv })
        .then(activity => res.send(activity))
        .catch(err => Errors.internalError(res, err))
})

router.get('/idinv/:idinv/activity/history/:aid', async (req, res) => {
    activityHistoryGetOne({ idinv: req.params.idinv, original: req.params.aid })
        .then(activity => res.send(activity))
        .catch(err => Errors.internalError(res, err))
})

router.get('/idinv/:idinv/activity/:aid', async (req, res) => {
    activityGetOne({ idinv: req.params.idinv, _id: req.params.aid })
        .then(activity => res.send(activity))
        .catch(err => Errors.internalError(err))
})

// post

router.post('/users/:uid/activity', saveFiles, validateActivity, (req, res) => {
    activityCreate({ ...req.body, user: req.params.uid })
        .then(activity => res.send(activity))
        .catch(err => {
            if (err.code === 11000) return res.status(208).send()
            Errors.internalError(res, err.message)
        })
})

router.post('/idinv/:idinv/activity', saveFiles, validateActivity, (req, res) => {
    activityCreate({ ...req.body, idinv: req.params.idinv })
        .then(activity => res.send(activity))
        .catch(err => {
            if (err.code === 11000) return res.status(208).send()
            Errors.internalError(res, err.message)
        })
})

router.post('/patients/:pid/activity', saveFiles, validateActivity, (req, res) => {
    activityCreate({ ...req.body, patient: req.params.pid })
        .then(activity => res.send(activity))
        .catch(err => {
            if (err.code === 11000) return res.status(208).send()
            Errors.internalError(res, err.message)
        })
})

// put

router.put('/users/:uid/activity/:aid', saveFiles, validateActivity, (req, res) => {
    activityEdit(req.params.aid, { ...req.body, user: req.params.uid })
        .then(activity => res.send(activity))
        .catch(err => {
            if (err.code === 404) return Errors.notFound(res)
            Errors.internalError(res, err.message)
        })
})

router.put('/idinv/:idinv/activity/:aid', saveFiles, validateActivity, async (req, res) => {
    activityEdit(req.params.aid, { ...req.body, idinv: req.params.idinv })
        .then(activity => res.send(activity))
        .catch(err => {
            Errors.internalError(res, err.message)
        })
})

router.put('/patient/:pid/activity/:aid', saveFiles, validateActivity, async (req, res) => {
    activityEdit(req.params.aid, { ...req.body, patient: req.params.pid })
        .then(activity => res.send(activity))
        .catch(err => {
            Errors.internalError(res, err.message)
        })
})

// delete

router.delete('/users/:uid/activity/:aid', async (req, res) => {
    activityDelete(req.params.aid)
        .then(() => res.status(204).send())
        .catch(err => Errors.internalError(res, err))
})

router.delete('/idinv/:idinv/activity/:aid', async (req, res) => {
    activityDelete(req.params.aid)
        .then(() => res.status(204).send())
        .catch(err => Errors.internalError(res, err))
})

router.delete('/patients/:pid/activity/:aid', async (req, res) => {
    activityDelete(req.params.aid)
        .then(() => res.status(204).send())
        .catch(err => Errors.internalError(res, err))
})

export { router as activityRouter }
