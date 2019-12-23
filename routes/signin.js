const express = require('express')
const router = express.Router()
const errors = require('../helpers/errors')
const log = require('../helpers/logger')
const objectify = require('../helpers/objectify')
const fetch = require('node-fetch')

router.get('/signin-oidc', (req, res) => {
    const token_endpoint = 'http://217.197.236.242:7050/connect/token'
    const client_secret = 'i3m0c78ko9cojdqjq706e5u4'
    const client_id = 'cjournal'

    let url = `${token_endpoint}?
    code=${req.query.code}&
    client_id=${client_id}&
    client_secret=${client_secret}&
    grant_type=${'authorization_code'}`

    fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/x-www-form-urlencoded',
        },
    })
        .then(res => {
            console.log(res)
        })
        .catch(err => {
            console.log(err)
        })
})

module.exports = router
