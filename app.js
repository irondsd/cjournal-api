const log = require('./logger')
const express = require('express')
const app = express()
const MarkdownIt = require('markdown-it'), md = new MarkdownIt();
const validate = require('./validate')
const port = process.env.PORT || 3000
const fs = require('fs')
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
app.use(express.json())

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
    db.all('select * from devices', (err, rows) => {
        if (err) {
            log(err)
            res.status(500).send(err)
        }
        res.send(rows)
    })
})

app.get('/api/devices/:id', (req, res) => {
    db.all('select * from devices where id = ' + req.params.id, (err, rows) => {
        if (err) {
            return res.status(500).send(err)
        }
        if (rows.length > 0) {
            return res.send(rows)
        }
        else {
            return res.status(404).send()
        }
    })
})

// make sure to add delete confirmation
app.delete('/api/devices/:id', (req, res) => {
    db.all('delete from devices where id = ' + req.params.id, function (err) {
        console.log(this.changes)
        if (err) {
            return res.status(500).send(err)
        }
        else {
            return res.status(204).send()
        }
    })
})

app.post('/api/devices/', (req, res) => {
    if (!validate.new_device(req)) {
        return res.status(400).send()
    }

    const current_type = Date.now() / 1000 | 0

    db.all(`INSERT INTO devices(name, device_type, last_seen) VALUES ('${req.body.name}', '${req.body.device_type}', '${current_type}')`, (err, rows) => {
        if (err) {
            return log(err)
        }
        else {
            res.status(201).send(rows)
        }
    })
})

app.get('/api/check/', function (req, res) {
    if (validate.api_key(req)) {
        return res.send('key validated')
    }
    res.status(403).send()
})

// add time frames to choose from
app.get('/api/devices/:id/data/', (req, res) => {
    db.all('select * from exercises where device_id = ' + req.params.id, (err, rows) => {
        if (err) {
            log(err)
            res.status(500).send(err)
        }
        res.send(rows)
    })
})

app.post('/api/devices/:id/data/', (req, res) => {
    if (!validate.exercise_record(req)) {
        return res.status(400).send()
    }

    db.run(`insert into exercises(device_id, exercise_type, time_started, duration, successful, distance, steps) values 
            ('${req.body.device_id}', '${req.body.exercise_type}', '${req.body.time_started}', '${req.body.duration}', '${req.body.successful}', '${req.body.distance}', '${req.body.steps}')`, (err, rows) => {
            if (err) {
                log(err)
            }
            else {
                res.status(201).send(rows)
            }
        })
})

app.listen(port, () => { log(`Listening on port ${port}...`) })