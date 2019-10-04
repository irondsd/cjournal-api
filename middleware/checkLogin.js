const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const bcrypt = require('bcryptjs')
const log = require('../helpers/logger')
const errors = require('../helpers/errors')
const validateEmail = require('../helpers/validateEmail')

module.exports = (req, res, next) => {
    if (req.body.email && req.body.password) {
        if (!validateEmail(req.body.email)) return errors.incorrectInput(res)
        let query = `select 
users.id, name, birthday, gender, email, password, device_type, last_seen, information, hide_elements, language, permissions,
prescriptions.course_therapy, relief_of_attack, tests
from users 
inner join 
prescriptions on users.id = prescriptions.users_id
where users.email = '${req.body.email}' limit 1`
        // console.log(query)
        db.all(query, (err, rows) => {
            if (err) {
                log(`check login internal error ${err}`)
                return errors.internalError(res)
            }
            if (rows[0]) {
                hash = rows[0].password
                if (bcrypt.compareSync(req.body.password, hash)) {
                    for (el of rows) {
                        el.hide_elements = JSON.parse(el.hide_elements)
                        el.course_therapy = JSON.parse(el.course_therapy)
                        el.relief_of_attack = JSON.parse(el.relief_of_attack)
                        el.tests = JSON.parse(el.tests)
                    }
                    req.user = rows[0]
                    next()
                } else {
                    log(`user ${req.body.email} failed login attempt`)
                    return errors.wrongPassword(res)
                }
            } else {
                log(`unknown user ${req.body.email} login attempt`)
                errors.notFound(res)
            }
        })
    } else {
        log(`failed login attempt incomplete input`)
        errors.incompleteInput(res)
    }
}
