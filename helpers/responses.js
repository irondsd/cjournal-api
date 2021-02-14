exports.created = function created(res, message) {
    res.status(201).send({ status: 'created', message })
}

exports.edited = function edited(res, message) {
    res.status(201).send({ status: 'edited', message })
}

exports.deleted = function deleted(res, message) {
    res.status(202).send({ status: 'deleted', message })
}

exports.alreadyExists = function alreadyExists(res, message) {
    res.status(208).send({ status: 'already exists', message })
}
