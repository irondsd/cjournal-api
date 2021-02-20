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
} from '../controllers/activityController'
import { filesToData } from '../middleware/filesToData'

router.get('/users/:uid/activity', async (req, res) => {
    if (!verifyObjectId(req.params.uid)) return Errors.incorrectInput(res)

    activityGetMany({ user: req.params.uid })
        .then(activity => res.send(activity))
        .catch(err => Errors.internalError(res))
})

router.get('/idinv/:idinv/activity', async (req, res) => {
    activityGetMany({ idinv: req.params.idinv })
        .then(activity => res.send(activity))
        .catch(err => Errors.internalError(res))
})

router.get('/users/:uid/activity/:aid', async (req, res) => {
    activityGetOne({ user: req.params.uid, _id: req.params.aid })
        .then(activity => res.send(activity))
        .catch(err => Errors.internalError(res))
})

router.get('/idinv/:idinv/activity/:aid', async (req, res) => {
    activityGetOne({ idinv: req.params.idinv, _id: req.params.aid })
        .then(activity => res.send(activity))
        .catch(err => Errors.internalError(res))
})

router.post('/users/:uid/activity', saveFiles, filesToData, validateActivity, (req, res) => {
    activityCreate({ ...req.body, user: req.params.uid })
        .then(activity => res.send(activity))
        .catch(err => {
            if (err.code === 11000) return res.status(208).send()
            Errors.internalError(res, err.message)
        })
})

router.post('/idinv/:idinv/activity', saveFiles, filesToData, validateActivity, (req, res) => {
    activityCreate({ ...req.body, idinv: req.params.idinv })
        .then(activity => res.send(activity))
        .catch(err => {
            if (err.code === 11000) return res.status(208).send()
            Errors.internalError(res, err.message)
        })
})

router.put('/users/:uid/activity/:aid', saveFiles, filesToData, validateActivity, (req, res) => {
    activityEdit(req.params.aid, { ...req.body, user: req.params.uid })
        .then(activity => res.send(activity))
        .catch(err => {
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

router.delete('/users/:uid/activity/:aid', validateActivity, async (req, res) => {
    activityDelete(req.params.aid)
        .then(() => res.status(204).send())
        .catch(err => Errors.internalError(res, err))
})

router.delete('/idinv/:idinv/activity/:aid', validateActivity, async (req, res) => {
    activityDelete(req.params.aid)
        .then(() => res.status(204).send())
        .catch(err => Errors.internalError(res, err))
})

export { router as activityRouter }
