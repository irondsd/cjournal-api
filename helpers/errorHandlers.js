const errors = require('./errors')
const log = require('./logger')

module.exports = function(error, req, res, next) {
    console.log(error)
    log(`${error.name}: ${error.message}`)
    if (error instanceof SyntaxError) {
        return errors.invalidData(res, error.message)
    } else if (error.name === 'MulterError') {
        return errors.invalidData(res, `${error.message} ${error.field ? error.field : null}`)
    } else {
        next()
    }
}
