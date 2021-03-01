import { Authorize, Request } from './functions'
import { Types } from 'mongoose'
import { timestamp } from '../src/helpers/timestamp'

let token = ''
let _id = ''
let idinv = ''
let patient = ''
let task_id = ''
let test_task: any

describe('tasks by user', () => {
    test('authorize', async () => {
        const res = await Authorize()
        token = res.access_token
    })

    test('login', async () => {
        const user = await Request(token, 'login', 'POST')
        expect(user).toHaveProperty('_id')
        expect(user).toHaveProperty('idinv')
        expect(user).toHaveProperty('patient')
        _id = user._id
        idinv = user.idinv
        patient = user.patient
    })

    test('get all activities', async () => {
        const activities = await Request(token, `idinv/${idinv}/tasks`, 'GET')
        expect(Array.isArray(activities)).toBe(true)
        if (activities.length > 0) {
            expect(activities[0]).toHaveProperty('_id')
        }
    })

    test('create tasks by user', async () => {
        task_id = new Types.ObjectId().toString()
        test_task = {
            _id: task_id,
            activity_type: 'Stairs',
            time: timestamp() - 300,
            patient: patient,
            idinv: idinv,
            user: _id,
            comment: 'tasks created by test',
        }
        const task = await Request(token, `idinv/${idinv}/tasks/`, 'POST', test_task)
        expect(task).toHaveProperty('_id', task_id)
    })

    test('get created tasks', async () => {
        const task = await Request(token, `idinv/${idinv}/tasks/${task_id}`, 'GET')
        expect(task).toHaveProperty('_id', task_id)
        expect(task).toHaveProperty('comment', test_task.comment)
    })

    test('edit created tasks', async () => {
        test_task.comment = 'edited test tasks'
        test_task.activity_type = 'Walking'
        const task = await Request(token, `idinv/${idinv}/tasks/${task_id}`, 'PUT', test_task)
        expect(task).toHaveProperty('_id', task_id)
        expect(task).toHaveProperty('comment', test_task.comment)
    })

    test('delete created tasks', async () => {
        const task = await Request(token, `idinv/${idinv}/tasks/${task_id}`, 'DELETE')
        expect(task).toBeTruthy()
    })
})
