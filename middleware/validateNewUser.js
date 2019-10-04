const errors = require('../helpers/errors')

module.exports = (req, res, next) => {
    let errors = []
    if (!req.body.name) {
        errors.push('name must be specified')
    }
    if (req.body.name && req.body.name.length < 3) {
        errors.push('name must be at least 3 characters long')
    }
    if (!req.body.email) {
        errors.push('email must be specified')
    } else {
        if (!validateEmail(req.body.email)) {
            errors.push('email is invalid')
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

function validateEmail(email) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(String(email).toLowerCase())
}
