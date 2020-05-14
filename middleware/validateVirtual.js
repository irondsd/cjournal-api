const errors = require('../helpers/errors')
const log = require('../helpers/logger')

module.exports = (req, res, next) => {
    if ((req.body.id, req.body.activity_type && req.body.time_started && req.body.doctor_id)) {
        next()
    } else {
        log.info(`activity is not validated ${JSON.stringify(req.body)}`)
        errors.incompleteInput(res)
    }
}
