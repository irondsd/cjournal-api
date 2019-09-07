const bcrypt = require('bcryptjs')
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
var QRCode = require('qrcode')
var SimpleCrypto = require('simple-crypto-js').default
var jwt = require('jsonwebtoken')
const QRSecretKey = 'baba_yaga'
const tokenKey = 'Mnemosyne'
var simpleCrypto = new SimpleCrypto(QRSecretKey)

function check_password(password, hash) {
    bcrypt.compare(password, hash, function(err, res) {
        return res
    })
}

function gen_api_key(user) {
    let options = { expiresIn: '365d' }

    return jwt.sign({ id: user.id, permissions: user.permissions }, tokenKey)
}

function create_session(res, req, user) {
    api_key = gen_api_key(user)

    res.send(response(user, api_key))
}

async function create_qr_session(res, req, user) {
    api_key = gen_api_key(user)
    await generate_qr(user, api_key, res)
}

function generate_qr(user, api_key, res) {
    // to preserve qr size. Maybe remove those later
    delete user.permissions
    delete user.device_type
    delete user.information
    delete user.language

    let cipherText = simpleCrypto.encrypt(response(user, api_key))
    QRCode.toDataURL(cipherText, function(err, url) {
        res.send({ qr: url })
    })
}

response = function(user, api_key) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        birthday: user.birthday,
        api_key: api_key,
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

function renew_session(req, res) {
    // TODO:
}

function validate_api_key(req, res) {
    if (!req.query.api_key) return res.sendStatus(403)

    jwt.verify(req.query.api_key, tokenKey, function(err, decoded) {
        if (err) res.status(403).send({ error: 'unauthorized' })
        else res.send({ success: 'authorized' })
    })
}

module.exports.check_password = check_password
module.exports.create_session = create_session
module.exports.create_qr_session = create_qr_session
module.exports.validate_api_key = validate_api_key
module.exports.renew_session = renew_session
