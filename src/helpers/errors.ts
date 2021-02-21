import { Response } from 'express'

export const unauthorized = function unauthorized(res: Response, message: string = 'unauthorized') {
    res.status(401).send({ error: message })
}

export const internalError = function internalError(
    res: Response,
    message: string = 'internal error',
) {
    res.status(409).send({ error: message })
}

export const notFound = function notFound(res: Response, message: string = 'not found') {
    res.status(404).send({ error: message })
}

export const incompleteInput = function incompleteInput(
    res: Response,
    message: string = 'incomplete input',
) {
    res.status(409).send({ error: message })
}

export const incorrectInput = function incorrectInput(
    res: Response,
    message: string = 'incorrect input',
) {
    res.status(400).send({ error: message })
}
