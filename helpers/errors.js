exports.unauthorized = function unauthorized(res) {
    res.status(401).send({ error: 'unauthorized' })
}

exports.internalError = function internalError(res) {
    res.status(401).send({ error: 'internal error' })
}

exports.notFound = function internalError(res) {
    res.status(404).send({ error: 'not found' })
}

exports.userExists = function internalError(res) {
    res.status(409).send({ error: 'user with email is already registered' })
}

exports.wrongPassword = function internalError(res) {
    res.status(409).send({ error: 'wrong password' })
}

exports.incompleteInput = function internalError(res) {
    res.status(409).send({ error: 'incomplete input' })
}
