const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const bcrypt = require('bcryptjs')
const log = require('../helpers/logger')
const errors = require('../helpers/errors')
const validateUsername = require('../helpers/validateUsername')
const objectify = require('../helpers/objectify')

module.exports = (req, res, next) => {
    if (req.body.username && req.body.password) {
        if (!validateUsername(req.body.username)) return errors.incorrectInput(res)
        let query = `select 
users.id, name, birthday, gender, username, password, idinv, last_seen, information, hide_elements, language, permissions,
prescriptions.course_therapy, relief_of_attack, tests
from users 
inner join 
prescriptions on users.id = prescriptions.users_id
where users.username = '${req.body.username}' limit 1`
        log.debug(query)
        db.all(query, (err, rows) => {
            if (err) {
                log.error(`check login internal error ${err}`)
                return errors.internalError(res)
            }
            if (rows[0]) {
                hash = rows[0].password
                if (bcrypt.compareSync(req.body.password, hash)) {
                    objectify.all(rows)
                    req.user = rows[0]
                    next()
                } else {
                    log.info(`user ${req.body.username} failed login attempt`)
                    return errors.wrongPassword(res)
                }
            } else {
                log.info(`unknown user ${req.body.username} login attempt`)
                errors.notFound(res)
            }
        })
    } else {
        log.info(`failed login attempt incomplete input`)
        errors.incompleteInput(res)
    }
}
