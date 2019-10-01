exports.unauthorized = function unauthorized(res) {
    res.status(401).send({ error: 'unauthorized' })
}

exports.internalError = function internalError(res) {
    res.status(401).send({ error: 'internal error' })
}

exports.notFound = function internalError(res) {
    res.status(404).send({ error: 'not found' })
}
