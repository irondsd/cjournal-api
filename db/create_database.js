const log = require('../logger')
const sqlite = require('sqlite3')
const db = new sqlite.Database('trackers.db')
let populate = false // add sample values to the db
let errors = false

db.serialize(() => {
    db.run(`create table if not exists users (
                id integer primary key, name text, 
                device_type text not null, 
                email text unique not null,
                password text not null,
                last_seen datetime)`, (err) => {
            if (err) {
                log(err)
                errors = true
            }
        })

    db.run(`create table if not exists activity (
        id integer primary key,
        users_id integer not null,
        activity_type text not null,
        time_started datetime not null,
        duration text not null,
        successful bool,
        distance real,
        data text,
        foreign key (users_id) references users(id)
    )`, (err) => {
            if (err) {
                log(err)
                errors = true
            }
        })

    db.run(`create table if not exists sessions (
                sid integer primary key, 
                user_id int not null, 
                api_key text not null,
                renewable bool,
                exp_date datetime not null
    )`, (err) => {
            if (err) {
                log(err)
                errors = true
            }
        })
})

if (populate) {
    db.run(`INSERT INTO users(name, device_type, last_seen, email, password) VALUES ('Alexander Feldman', 'Shovel', '1550507313', 'ggn00b@mail.ru', 'gggggg123')`, (err) => {
        if (err) {
            log(err)
            errors = true
        }
    })
    db.run(`INSERT INTO users(name, device_type, last_seen, email, password) VALUES ('Carl Sagan', 'Telescope', '1550507313', 'ggn00b@mail.ua', 'gggggg123')`, (err) => {
        if (err) {
            log(err)
            errors = true
        }
    })
    db.run(`INSERT INTO users(name, device_type, last_seen, email, password) VALUES ('Max Plank', 'Microscope', '1550507313', 'ggn000b@gmail.com', 'gggggg123')`, (err) => {
        if (err) {
            log(err)
            errors = true
        }
    })

    db.run(`insert into activity(users_id, activity_type, time_started, duration, successful, distance, data) values ('1', 'Walking', '2019-02-18T12:30:44.624Z', '300', '1', '94.4', '122')`, (err) => {
        if (err) {
            log(err)
            errors = true
        }
    })

    db.run(`insert into activity(users_id, activity_type, time_started, duration, successful, distance, data) values ('1', 'Walking', '2019-02-18T12:30:44.624Z', '300', '1', '94.4', '122')`, (err) => {
        if (err) {
            log(err)
            errors = true
        }
    })

    db.run(`insert into activity(users_id, activity_type, time_started, duration, successful, distance, data) values ('3', 'Walking', '2019-02-18T12:30:44.624Z', '300', '1', '94.4', '122')`, (err) => {
        if (err) {
            log(err)
            errors = true
        }
    })

    if (errors === false) {
        //let's now make sure the records are there
        db.each(`SELECT * FROM users`, (err, records) => {
            console.log(records)
        })

        db.each(`select * from activities`, (err, records) => {
            console.log(records)
        })

        console.log(`Sucessfully created the database with tables and populated each table it with 3 sample records`)
    }
}

db.close()