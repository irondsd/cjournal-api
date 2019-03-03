const bcrypt = require('bcryptjs')
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')

function check_password(password, hash) {
    bcrypt.compare(password, hash, function (err, res) {
        return res
    });
}

function create_session(res, req, user_id) {
    api_key = user_id + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2)
    exp_date = Date.now() / 1000 | 10 + 3600 // adds an hour

    let sql = `insert into sessions(user_id, api_key, renewable, exp_date) values ('${user_id}', '${api_key}', 'true', '${exp_date}')`
    db.all(sql, (err, rows) => {
        if (err) {
            res.send('error creating session', err)
        }
        else {
            res.send({
                'api_key': api_key,
            })
        }
    })
}
// TODO: 
function renew_session() {

}

function destroy_session(res, req, api_key) {
    sql = `delete from sessions where api_key = '${api_key}'`
    db.run(sql, function (err) {
        if (err) {
            console.log(sql)
        }
        if (this.changes) {
            res.send()
        }
        else {
            res.status(404).send()
        }
    })
}

function validate_api_key(req, res) {
    sql = `select * from sessions where api_key = '${req.query.api_key}'`
    db.all(sql, (err, rows) => {
        if (err) {
            console.log(err)
        }
        if (rows.length > 0) {
            res.send(rows[0])
        }
        else {
            res.status(403).end('Unauthorized')
        }
    })
}

module.exports.check_password = check_password
module.exports.create_session = create_session
module.exports.validate_api_key = validate_api_key
module.exports.destroy_session = destroy_session