const log = require('../logger')
const sqlite = require('sqlite3')
const db = new sqlite.Database('trackers.db')
let populate = true // add sample values to the db
let errors = false

db.serialize(() => {
    db.run(`create table if not exists devices (
                id integer primary key, name text, 
                device_type text, 
                last_seen datetime)`, (err) => {
            if (err) {
                log(err)
                errors = true
            }
        })

    db.run(`create table if not exists exercises (
        id integer primary key,
        device_id integer,
        exercise_type text,
        time_started datetime,
        duration text,
        successful bool,
        distance real,
        steps integer,
        foreign key (device_id) references devices(id)
    )`), (err) => {
            if (err) {
                log(err)
                errors = true
            }
        }
})

if (populate) {
    db.run(`INSERT INTO devices(name, device_type, last_seen) VALUES ('Alexander Feldman', 'simple tracker', '1550507313')`, (err) => {
        if (err) {
            log(err)
            errors = true
        }
    })
    db.run(`INSERT INTO devices(name, device_type, last_seen) VALUES ('John Doe', 'simple tracker', '1550507313')`, (err) => {
        if (err) {
            log(err)
            errors = true
        }
    })
    db.run(`INSERT INTO devices(name, device_type, last_seen) VALUES ('Jane Doe', 'simple tracker', '1550507313')`, (err) => {
        if (err) {
            log(err)
            errors = true
        }
    })

    db.run(`insert into exercises(device_id, exercise_type, time_started, duration, successful, distance, steps) values ('1', 'Walking', '2019-02-18T12:30:44.624Z', '300', '1', '94.4', '122')`, (err) => {
        if (err) {
            log(err)
            errors = true
        }
    })

    db.run(`insert into exercises(device_id, exercise_type, time_started, duration, successful, distance, steps) values ('1', 'Walking', '2019-02-18T12:30:44.624Z', '300', '1', '94.4', '122')`, (err) => {
        if (err) {
            log(err)
            errors = true
        }
    })

    db.run(`insert into exercises(device_id, exercise_type, time_started, duration, successful, distance, steps) values ('5', 'Walking', '2019-02-18T12:30:44.624Z', '300', '1', '94.4', '122')`, (err) => {
        if (err) {
            log(err)
            errors = true
        }
    })

    if (errors === false) {
        //let's now make sure the records are there
        db.each(`SELECT * FROM devices`, (err, records) => {
            console.log(records)
        })

        db.each(`select * from exercises`, (err, records) => {
            console.log(records)
        })

        console.log(`Sucessfully created the database with tables and populated each table it with 3 sample records`)
    }
}

db.close()