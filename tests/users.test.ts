import { Authorize, Request, getRandomNumber, getRandomString } from './functions'
let token = ''
let username = ''
let _id = ''

test('authorize', async () => {
    const res = await Authorize()
    token = res.access_token
})

test('login', async () => {
    const user = await Request(token, 'login', 'POST')
    expect(user.username).toBeTruthy()
    _id = user._id
    username = user.username
})

test('get all users', async () => {
    const users = await Request(token, 'users', 'GET')
    expect(users[0].username).toBe(username)
})

test('get one user', async () => {
    const users = await Request(token, `users/${_id}`, 'GET')
    expect(users.username).toBe(username)
})

test('change user', async () => {
    const idinv = '045_000_00089_' + getRandomNumber(5)
    const patient = getRandomString()
    const body = {
        idinv: idinv,
        patient: patient,
    }
    const user = await Request(token, `users/${_id}`, 'PUT', body)
    expect(user.idinv).toBe(idinv)
    expect(user.patient).toBe(patient)
})
