const errors = require('../helpers/errors')
const log = require('../helpers/logger')
const validateEmail = require('../helpers/validateEmail')

module.exports = (req, res, next) => {
    if (req.body.email) {
        if (!validateEmail(req.body.email)) {
            errors.incorrectInput(res)
        }
    } else {
        errors.incompleteInput(res)
    }
    next()
}
