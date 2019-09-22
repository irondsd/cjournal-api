const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try {
        const decoded = jwt.verify(req.query.api_key, process.env.TOKEN_KEY)
        req.decoded = decoded
        next()
    } catch (error) {
        res.status(401).send({ error: 'unauthorized' })
    }
}
