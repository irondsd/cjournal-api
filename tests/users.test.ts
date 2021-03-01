import { Authorize, Request, getRandomNumber, getRandomString } from './functions'
let token = ''
let username = ''
let patient = ''
let idinv = ''
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

test('get all users unauthorized', async done => {
    Request('', `users/`, 'GET').then(err => {
        expect(err.error).toBe('unauthorized')
        done()
    })
})

test('get one user', async () => {
    const users = await Request(token, `users/${_id}`, 'GET')
    expect(users.username).toBe(username)
})

test('get one user unauthorized', async done => {
    Request('', `users/${_id}`, 'GET').then(err => {
        expect(err.error).toBe('unauthorized')
        done()
    })
})

test('change user', async () => {
    idinv = '045_000_00089_' + getRandomNumber(5)
    patient = getRandomString()

    const body = {
        idinv: idinv,
        patient: patient,
    }
    const user = await Request(token, `users/${_id}`, 'PUT', body)
    expect(user.idinv).toBe(idinv)
    expect(user.patient).toBe(patient)
})

test('change user unauthorized', async done => {
    Request('', `users/${_id}`, 'PUT').then(err => {
        expect(err.error).toBe('unauthorized')
        done()
    })
})

test('checkout patient', async () => {
    const doc = await Request(token, `patients/${patient}`, 'GET')
    expect(doc).toHaveProperty('_id', patient)
    expect(doc).toHaveProperty('idinv', idinv)
})

test('change patient', async () => {
    const relief_of_attack = [getRandomString(), getRandomString(), getRandomString()]
    const course_therapy = [getRandomString(), getRandomString(), getRandomString()]
    const tests = [getRandomString(), getRandomString(), getRandomString()]
    const doc = await Request(token, `patients/${patient}`, 'PUT', {
        relief_of_attack,
        course_therapy,
        tests,
    })
    expect(doc).toHaveProperty('relief_of_attack')
    expect(doc).toHaveProperty('course_therapy')
    expect(doc).toHaveProperty('tests')
    expect(doc.relief_of_attack[0]).toEqual(relief_of_attack[0])
    expect(doc.course_therapy[0]).toEqual(course_therapy[0])
    expect(doc.tests[0]).toEqual(tests[0])
})
