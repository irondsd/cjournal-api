import fetch from 'node-fetch'
import config from '../src/config'

export const Authorize = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        const details: any = {
            grant_type: 'password',
            client_id: 'ApiClient',
            password: config.test_password,
            username: config.test_username,
        }
        let formBody: any = []
        for (let property in details) {
            let encodedKey = encodeURIComponent(property)
            let encodedValue = encodeURIComponent(details[property])
            formBody.push(encodedKey + '=' + encodedValue)
        }
        formBody = formBody.join('&')

        fetch('https://identity.incart.ru/connect/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formBody,
        })
            .then(res => res.json())
            .then(res => resolve(res))
            .catch(err => reject(err))
    })
}

export const Request = (
    token: string,
    path: string,
    method: string = 'GET',
    body?: object | undefined,
): Promise<any> => {
    return new Promise((resolve, reject) => {
        const init = {
            method: method,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify(body),
        }
        return fetch(config.test_url + path, init)
            .then(res => res.json())
            .then(res => {
                resolve(res)
            })
            .catch(err => reject(err))
    })
}

export const getRandomNumber = (n: number): number => {
    return Math.floor(Math.random() * (9 * Math.pow(10, n))) + Math.pow(10, n)
}

export const getRandomString = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
