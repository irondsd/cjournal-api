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

function generate_qr(user, res) {
    let api_key = gen_api_key(user)

    // to decrease qr size, optional
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

async function validate_api_key(api_key) {
    if (!api_key) return false

    return jwt.verify(api_key, tokenKey, function(err, decoded) {
        if (err) return false
        else return true
    })
}

async function decipher_api_key(api_key) {
    return jwt.verify(api_key, tokenKey, function(err, decoded) {
        if (err) return err
        else return decoded
    })
}

module.exports.check_password = check_password
module.exports.create_session = create_session
module.exports.validate_api_key = validate_api_key
module.exports.generate_qr = generate_qr
module.exports.decipher_api_key = decipher_api_key
