const express = require('express')
const router = express.Router()
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
const errors = require('../helpers/errors')
const log = require('../helpers/logger')
const fetch = require('node-fetch')
require('dotenv').config()
var FormData = require('form-data')
const createUser = require('../helpers/createUser')
const updateTokens = require('../helpers/updateTokens')

router.post('/auth', (req, res, next) => {
    const host = process.env.IDENTITY_HOST
    const port = process.env.IDENTITY_PORT
    const url = `http://${host.trim()}:${port.trim()}/connect/token`

    var formData = new FormData()

    formData.append('grant_type', 'password')
    formData.append('client_id', 'ApiClient')
    formData.append('password', req.body.password)
    formData.append('username', req.body.username)

    var request = {
        method: 'POST',
        headers: {
            Accept: 'multipart/form-data',
        },
        body: formData,
    }

    fetch(url, request)
        .then(response => {
            if (response.status === 200) {
                response.json().then(response => {
                    fetch(`http://${host.trim()}:${port.trim()}/connect/userinfo`, {
                        method: 'POST',
                        headers: {
                            Authorization: 'Bearer ' + response.access_token,
                        },
                    })
                        .then(response => response.json())
                        .then(new_res => {
                            createUser(new_res.name, response.access_token, response.refresh_token)
                                .then(() => {
                                    log.info(`user ${new_res.name} successfully created`)
                                    updateTokens(
                                        new_res.name,
                                        response.access_token,
                                        response.refresh_token,
                                    ).then()
                                })
                                .catch(err => {
                                    log.error(err)
                                })
                            res.send(new_res.name)
                        })
                })
            } else {
                throw new Error()
            }
        })
        .catch(err => {
            res.status(400).send('Wrong username or password')
        })
})

module.exports = router
