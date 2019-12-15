const errors = require('../helpers/errors')
const log = require('../helpers/logger')

module.exports = (req, res, next) => {
    if (req.body.activity_type && req.body.time) {
        next()
    } else {
        log.info(`task is not validated, ${JSON.stringify(req.body)}`)
        errors.incompleteInput(res)
    }
}
