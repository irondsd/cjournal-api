import { Authorize, Request, getRandomNumber, getRandomString } from './functions'
import { Types } from 'mongoose'
import { timestamp } from '../src/helpers/timestamp'

let token = ''
let _id = ''
let idinv = ''
let patient = ''
let act_id = ''
let activities_length
let test_activity: any

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
    const activities = await Request(token, `users/${_id}/activity`, 'GET')
    expect(Array.isArray(activities)).toBe(true)
    activities_length = activities.length
    expect(activities[0]).toHaveProperty('_id')
    act_id = activities[0]._id
})

test('get first activity', async () => {
    const act = await Request(token, `users/${_id}/activity/${act_id}`, 'GET')
    expect(act).toHaveProperty('_id')
    expect(act._id).toEqual(act_id)
})

//TODO: get acivities by idinv and patient

test('create activity by user', async () => {
    act_id = new Types.ObjectId().toString()
    test_activity = {
        _id: act_id,
        activity_type: 'Meal',
        time_started: timestamp() - 300,
        time_ended: timestamp(),
        patient: patient,
        idinv: idinv,
        user: _id,
        comment: 'activity created by test',
    }
    const act = await Request(token, `users/${_id}/activity/`, 'POST', test_activity)
    expect(act).toHaveProperty('_id', act_id)
})

test('get created activity', async () => {
    const act = await Request(token, `users/${_id}/activity/${act_id}`, 'GET')
    expect(act).toHaveProperty('_id', act_id)
    expect(act).toHaveProperty('comment', test_activity.comment)
})

test('edit created activity', async () => {
    test_activity.comment = 'edited test activity'
    test_activity.activity_type = 'Alcohol'
    const act = await Request(token, `users/${_id}/activity/${act_id}`, 'PUT', test_activity)
    expect(act).toHaveProperty('_id', act_id)
    expect(act).toHaveProperty('comment', test_activity.comment)
})

test('delete created activity', async () => {
    test_activity.comment = 'edited test activity'
    test_activity.activity_type = 'Alcohol'
    const act = await Request(token, `users/${_id}/activity/${act_id}`, 'DELETE')
    expect(act).toBeTruthy()
})

test('get created activity history', async () => {
    const histories = await Request(token, `users/${_id}/activity/history/${act_id}`, 'GET')
    expect(Array.isArray(histories)).toBe(true)
    for (const h of histories) {
        expect(h).toHaveProperty('original', act_id)
    }
    expect(histories[0].action).toEqual('created')
    expect(histories[1].action).toEqual('edited')
    expect(histories[2].action).toEqual('deleted')
})
