const log = require('./logger')
const express = require('express')
const app = express()
const MarkdownIt = require('markdown-it'), md = new MarkdownIt();
const validate = require('./validate')
const port = process.env.PORT || 3000
const fs = require('fs')
app.use(express.json())

devices = [
    {
        "id": 1,
        "name": "Alexander Feldman",
        "device_type": "cardio tracker",
        "is_online": false,
        "last_seen": "1550272682",
    },
    {
        "id": 2,
        "name": "John Doe",
        "device_type": "cardio tracker",
        "is_online": false,
        "last_seen": "1550272682",
    },
    {
        "id": 3,
        "name": "Bro Notbro",
        "device_type": "cardio tracker",
        "is_online": false,
        "last_seen": "1550272682",
    }
]

app.get('/api/', (req, res) => {
    fs.readFile('README.md', 'utf8', function (err, contents) {
        if (err) {
            res.send(md.render("Error reading README.md"))
        }
        else {
            res.send(md.render(contents))
        }
    });
})

app.get('/api/devices', (req, res) => {
    res.send(devices)
})

app.get('/api/devices/:id', (req, res) => {
    found = devices.find(d => d.id === parseInt(req.params.id))
    if (!found) {
        return res.status(404).send()
    }
    res.send(found)
})

app.delete('/api/devices/:id', (req, res) => {
    found = devices.find(d => d.id === parseInt(req.params.id))
    if (!found) {
        return res.status(404).send()
    }

    index = devices.indexOf(found)

    devices.splice(index, 1)
    res.status(204).send()
})

app.post('/api/devices/', (req, res) => {
    if (!validate.new_device(req)) {
        return res.status(400).send()
    }

    const device = {
        "id": devices.length + 1,
        "name": req.body.name,
        "device_type": req.body.device_type,
        "last_seen": (Date.now() / 1000 | 0)
    }

    devices.push(device)
    res.status(201).send(device)
})

app.get('/api/check/', function (req, res) {
    if (validate.api_key(req)) {
        return res.send('key validated')
    }
    res.status(403).send()
})

app.listen(port, () => { log(`Listening on port ${port}...`) })