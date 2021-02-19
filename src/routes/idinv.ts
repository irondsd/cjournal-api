import express from 'express'
const router = express.Router()
import { IIdinv, Idinv } from '../models/idinv'
import { idinvGetAll, idinvGetById } from '../controllers/idinvController'
import { checkAuth } from '../middleware/checkAuth'

router.get('/idinv/', checkAuth, idinvGetAll)
router.get('/idinv/:idinv', checkAuth, idinvGetById)

export { router as IdinvRouter }
