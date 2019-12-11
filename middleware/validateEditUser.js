const errors = require('../helpers/errors')
const log = require('../helpers/logger')
const validateUsername = require('../helpers/validateUsername')

module.exports = (req, res, next) => {
    if (req.body.username) {
        if (!validateUsername(req.body.username)) {
            errors.incorrectInput(res)
        }
    } else {
        errors.incompleteInput(res)
    }
    next()
}
