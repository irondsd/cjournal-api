import { Response } from 'express'

export const unauthorized = function unauthorized(res: Response, message: String = 'unauthorized') {
    res.status(401).send({ error: message })
}

export const internalError = function internalError(
    res: Response,
    message: String = 'internal error',
) {
    res.status(409).send({ error: message })
}

export const notFound = function notFound(res: Response, message: String = 'not found') {
    res.status(404).send({ error: message })
}

export const incompleteInput = function incompleteInput(
    res: Response,
    message: String = 'incomplete input',
) {
    res.status(409).send({ error: message })
}

export const incorrectInput = function incorrectInput(
    res: Response,
    message: String = 'incorrect input',
) {
    res.status(400).send({ error: message })
}
