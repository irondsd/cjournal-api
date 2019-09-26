const jwt = require('jsonwebtoken')
const { updateLastSeen } = require('../helpers/updateLastSeen')

module.exports = (req, res, next) => {
    try {
        const decoded = jwt.verify(req.query.api_key, process.env.TOKEN_KEY)
        req.decoded = decoded
        updateLastSeen(decoded.id)
        next()
    } catch (error) {
        res.status(401).send({ error: 'unauthorized' })
    }
}
