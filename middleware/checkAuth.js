const jwt = require('jsonwebtoken')
const { updateLastSeen } = require('../helpers/updateLastSeen')
const errors = require('../helpers/errors')
const log = require('../helpers/logger')

module.exports = (req, res, next) => {
    try {
        const decoded = jwt.verify(req.query.api_key, process.env.TOKEN_KEY)
        req.decoded = decoded
        updateLastSeen(decoded.id)
        next()
    } catch (error) {
        log(`unsuccessful api key decode ${req.query.api_key}`)
        errors.unauthorized(res)
    }
}
