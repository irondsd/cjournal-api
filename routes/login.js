const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const validate = require('../helpers/validate')
const bcrypt = require('bcryptjs')
const checkAuth = require('../middleware/checkAuth')
const checkLogin = require('../middleware/checkLogin')
const jwt = require('jsonwebtoken')
const QRCode = require('qrcode')
const SimpleCrypto = require('simple-crypto-js').default
const simpleCrypto = new SimpleCrypto(process.env.QR_KEY)
const errors = require('../helpers/errors')
const log = require('../helpers/logger')

router.post('/login', checkLogin, (req, res, next) => {
    log(`user ${req.user.id} is successfully logged in`)
    let api_key = gen_api_key(req.user)
    req.user.api_key = api_key

    res.send(response(req.user))
})

router.post('/loginqr', checkLogin, (req, res, next) => {
    let api_key = gen_api_key(req.user)
    req.user.api_key = api_key

    log(`user ${req.user.id} generated qr for himself`)
    generate_qr(req, res)
})

router.post('/qr', checkAuth, (req, res, next) => {
    let id = req.decoded.id

    if (req.body.id) id = req.body.id

    let query = `select 
users.id, name, birthday, gender, email, password, device_type, last_seen, information, hide_elements, language, permissions,
prescriptions.course_therapy, relief_of_attack, tests
from users 
inner join 
prescriptions on users.id = prescriptions.users_id
where users.id = '${id}' limit 1`
    db.all(query, (err, rows) => {
        if (err) {
            log(`login internal error ${err}`)
            return errors.internalError(res)
        }
        if (rows[0]) {
            log(`user ${req.decoded.id} generated qr for user ${rows[0].id}`)
            req.user = rows[0]
            req.user.api_key = gen_api_key(req.user)
            generate_qr(req, res)
        } else {
            return res.status(404).send()
        }
    })
})

gen_api_key = function(user) {
    // let options = { expiresIn: '365d' }

    return jwt.sign({ id: user.id, permissions: user.permissions }, process.env.TOKEN_KEY)
}

response = function(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        birthday: user.birthday,
        api_key: user.api_key,
        device_type: user.device_type,
        information: user.information,
        hide_elements: user.hide_elements,
        course_therapy: user.course_therapy,
        relief_of_attack: user.relief_of_attack,
        tests: user.tests,
        language: user.language,
        permissions: user.permissions
    }
}

generate_qr = function(req, res) {
    // information that mobile app doesn't need
    delete req.user.permissions
    delete req.user.device_type
    delete req.user.information
    delete req.user.language

    if (req.query.short) {
        // short qr version
        delete req.user.hide_elements
        delete req.user.course_therapy
        delete req.user.relief_of_attack
        delete req.user.tests
        delete req.user.device_type
    }

    let cipherText = simpleCrypto.encrypt(response(req.user))
    // console.log(simpleCrypto.decrypt(cipherText))
    QRCode.toDataURL(cipherText, function(err, url) {
        res.send({ qr: url })
    })
}

module.exports = router
