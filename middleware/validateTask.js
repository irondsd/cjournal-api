const errors = require('../helpers/errors')
const log = require('../helpers/logger')

module.exports = (req, res, next) => {
    if (req.body.activity_type && req.body.time) {
        next()
    } else {
        log(`task is not validated`)
        errors.incompleteInput(res)
    }
}
