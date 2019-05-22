const bcrypt = require('bcryptjs')
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
var QRCode = require('qrcode')

function check_password(password, hash) {
    bcrypt.compare(password, hash, function(err, res) {
        return res
    })
}

function gen_api_key() {
    return (
        Math.random()
            .toString(36)
            .substr(2) +
        Math.random()
            .toString(36)
            .substr(2)
    )
}

function gen_exp_date() {
    return (Date.now() / 1000) | (10 + 3600) // adds an hour
}

function create_session(res, req, user) {
    api_key = gen_api_key()
    exp_date = gen_exp_date()

    let sql = `insert into sessions(user_id, api_key, renewable, exp_date) values ('${user_id}', '${api_key}', 'true', '${exp_date}')`

    db.all(sql, (err, rows) => {
        if (err) {
            res.send('error creating session', err)
        } else {
            res.send({
                id: user_id,
                name: user.name,
                email: user.email,
                gender: user.gender,
                age: user.age,
                api_key: api_key
            })
        }
    })
}

function create_qr_session(res, req, user) {
    api_key = gen_api_key()
    exp_date = gen_exp_date()

    let sql = `insert into sessions(user_id, api_key, renewable, exp_date) values ('${user_id}', '${api_key}', 'true', '${exp_date}')`

    db.all(sql, (err, rows) => {
        if (err) {
            res.send('error creating session', err)
        } else {
            let response = {
                id: user_id,
                name: user.name,
                email: user.email,
                gender: user.gender,
                age: user.age,
                api_key: api_key
            }
            QRCode.toDataURL(JSON.stringify(response), function(err, url) {
                // response.dataimg = url
                res.send({ qr: url })
            })
        }
    })
}

function renew_session(req, res) {
    api_key = gen_api_key()
    exp_date = gen_exp_date()
    sql = `update sessions set api_key = '${api_key}', exp_date = '${exp_date}' where api_key = '${req.query.api_key}'`
    db.run(sql, function(err, rows) {
        if (err) {
            res.status(400).send({
                error: err
            })
        }
        if (this.changes) {
            res.send({
                api_key: api_key
            })
        } else {
            res.status(404).send({
                error: 'no such session'
            })
        }
    })
}

function destroy_session(res, req, api_key) {
    sql = `delete from sessions where api_key = '${api_key}'`
    db.run(sql, function(err) {
        if (err) {
            res.status(400).send({
                error: err
            })
        }
        if (this.changes) {
            res.send()
        } else {
            res.status(404).send()
        }
    })
}

function validate_api_key(req, res) {
    sql = `select * from sessions where api_key = '${req.query.api_key}'`
    db.all(sql, (err, rows) => {
        if (err) {
            res.status(400).send({
                error: err
            })
        }
        if (rows.length > 0) {
            res.send(rows[0])
        } else {
            res.status(400).send({
                error: 'unauthorized'
            })
        }
    })
}

module.exports.check_password = check_password
module.exports.create_session = create_session
module.exports.create_qr_session = create_qr_session
module.exports.validate_api_key = validate_api_key
module.exports.destroy_session = destroy_session
module.exports.renew_session = renew_session
