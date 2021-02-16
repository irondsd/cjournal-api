import express from 'express'
const router = express.Router()
import { checkAuth } from '../middleware/checkAuth'
import { userEdit, userGetAll, userGetById, userLogin } from '../controllers/userController'

router.get('/users/', checkAuth, userGetAll)
router.get('/users/:id', checkAuth, userGetById)
router.put('/users/:id', checkAuth, userEdit)
router.post('/login', checkAuth, userLogin)

export { router as usersRouter }
