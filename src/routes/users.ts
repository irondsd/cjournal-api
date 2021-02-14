import express from 'express'
const router = express.Router()
import { User } from '../models/user'
import stringSanitizer from '../helpers/sanitizeString'
import * as Errors from '../helpers/errors'
import { checkAuth } from '../middleware/checkAuth'

// Get all users
router.get('/', checkAuth, async (req, res) => {
    const users = await User.find()
    res.send(users)
})

// Get information about the user with specific id
router.get('/:id', checkAuth, async (req, res) => {
    const id = stringSanitizer(req.params.id)
    User.findById(id)
        .populate('prescriptions')
        .then((user: typeof User) => {
            if (!user) return Errors.notFound(res)
            res.send(user)
        })
        .catch((err: any) => {
            Errors.incorrectInput(res, err.reason.message)
        })
})

// Update user
router.put('/:uid', async (req, res) => {
    // TODO:
    res.send('good')
})

// should not exist
router.post('/', async (req, res) => {
    const { username, sub } = req.body

    if (!username || !sub) return res.status(400).send()

    const user = new User({ username, sub })
    await user.save()
    res.status(201).send(user)
})

// purge user
router.post('/:id/purge', async (req, res) => {})

export { router as usersRouter }
