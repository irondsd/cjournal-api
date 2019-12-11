const errors = require('../helpers/errors')
const validateUsername = require('../helpers/validateUsername')

module.exports = (req, res, next) => {
    let errors = []
    if (!req.body.name) {
        errors.push('name must be specified')
    }
    if (req.body.name && req.body.name.length < 3) {
        errors.push('name must be at least 3 characters long')
    }
    if (!req.body.username) {
        errors.push('username must be specified')
    } else {
        if (!validateUsername(req.body.username)) {
            errors.push('username is invalid')
        }
    }
    if (!req.body.password) {
        errors.push('password must be specified')
    }

    if (errors.length > 0) {
        res.status(400).send({ errors: errors.join('; ') })
    } else {
        next()
    }
}
