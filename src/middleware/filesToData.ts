import { Request, Response, NextFunction } from 'express'

// TODO: merge with save files
export const filesToData = (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.data) req.body.data = {}

    if (req.files) {
        if ((req as any).files.audio)
            req.body.data.audio = (req as any).files.audio[0].path.replace('\\', '/')
        if ((req as any).files.image)
            req.body.data.image = (req as any).files.image[0].path.replace('\\', '/')
    }

    next()
}
