const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const bcrypt = require('bcryptjs')
const log = require('../helpers/logger')

module.exports = (req, res, next) => {
    if (req.body.email && req.body.password) {
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
                res.status(500).send(err.keys)
            }
            if (rows[0]) {
                hash = rows[0].password
                if (bcrypt.compareSync(req.body.password, hash)) {
                    req.user = rows[0]
                    next()
                } else {
                    log(`user ${req.body.email} failed login attempt`)
                    res.status(403).send({
                        error: 'wrong password'
                    })
                }
            } else {
                log(`unknown user ${req.body.email} login attempt`)
                res.status(404).send()
            }
        })
    } else {
        res.status(400).send({
            error: 'no email or no password received'
        })
    }
}
