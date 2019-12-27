const jwt = require('jsonwebtoken')
const { updateLastSeen } = require('../helpers/updateLastSeen')
const errors = require('../helpers/errors')
const log = require('../helpers/logger')
const fetch = require('node-fetch')
const userFindOrCreate = require('../helpers/userFindOrCreate')
require('dotenv').config()

module.exports = (req, res, next) => {
    let token = req.query.token

    if (req.headers.authorization)
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
            token = req.headers.authorization.split(' ')[1]

    let url = `http://217.197.236.242:7050/connect/userinfo`

    fetch(url, {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + token,
        },
    })
        .then(response => response.json())
        .then(response => {
            // req.user = {
            //     sub: response.sub,
            //     name: response.name,
            //     // add other stuff
            // }
            userFindOrCreate(response.sub, response.name)
                .then(res => {
                    req.user = {
                        id: res,
                        sub: response.sub,
                        name: response.name,
                    }
                    next()
                })
                .catch(err => {
                    console.log('err', err)
                })
        })
        .catch(err => {
            errors.unauthorized(res)
        })
}
