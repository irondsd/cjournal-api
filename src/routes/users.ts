import express from 'express'
const router = express.Router()
import { checkAuth } from '../middleware/checkAuth'
import {
    userDelete,
    userEdit,
    userGetAll,
    userGetById,
    userLogin,
} from '../controllers/userController'

router.get('/users/', checkAuth, userGetAll)
router.get('/users/:id', checkAuth, userGetById)
router.put('/users/:id', checkAuth, userEdit)
router.post('/login', checkAuth, userLogin)
// router.delete('/users/:id', checkAuth, userDelete)

export { router as usersRouter }
