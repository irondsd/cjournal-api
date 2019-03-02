const bcrypt = require('bcryptjs')
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')

function check_password(password, hash) {
    bcrypt.compare(password, hash, function (err, res) {
        return res
    });
}

function create_session(user_id) {
    api_key = user_id + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2)
    exp_date = Date.now() / 1000 | 10 + 3600

    return { api_key, exp_date }
}
// TODO: 
function renew_session() {

}

module.exports.check_password = check_password
module.exports.create_session = create_session