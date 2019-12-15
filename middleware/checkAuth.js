const jwt = require('jsonwebtoken')
const { updateLastSeen } = require('../helpers/updateLastSeen')
const errors = require('../helpers/errors')
const log = require('../helpers/logger')

module.exports = (req, res, next) => {
    let api_key = req.query.api_key

    if (req.headers.authorization)
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
            api_key = req.headers.authorization.split(' ')[1]

    try {
        const decoded = jwt.verify(api_key, process.env.TOKEN_KEY)
        req.decoded = decoded
        updateLastSeen(decoded.id)
        next()
    } catch (error) {
        log.info(`unsuccessful api key decode ${api_key}`)
        errors.unauthorized(res)
    }
}
