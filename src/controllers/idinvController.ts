import { Request, Response } from 'express'
import { Idinv, IIdinv } from '../models/idinv'
import * as Errors from '../helpers/errors'
import Logger from '../helpers/logger'

export const idinvGetAll = async (req: Request, res: Response) => {
    const idinv = await Idinv.find()
    res.send(idinv)
}

export const idinvGetById = async (req: Request, res: Response) => {
    Idinv.findById(req.params.idinv)
        .then((idinv: IIdinv) => {
            if (!idinv) return Errors.notFound(res)
            res.send(idinv)
        })
        .catch((err: any) => {
            Logger.error('Error in idinvGetById controller: ' + err.message)
            Errors.incorrectInput(res, err.reason.message)
        })
}

export const idinvCreate = async (idinvString: string): Promise<IIdinv> => {
    return new Promise((resolve, reject) => {
        const [mon_type, mon_state, mon_number, mon_install] = idinvString.split('_')

        if (!mon_type || !mon_state || !mon_number || !mon_install)
            reject(new Error('incomplete idinv'))

        const idinv = new Idinv({
            _id: idinvString,
            mon_type: mon_type,
            mon_state: mon_state,
            mon_number: mon_number,
            mon_install: mon_install,
        })
        idinv.save((err, idinv: IIdinv) => {
            if (err) reject(err)
            resolve(idinv)
        })
    })
}
