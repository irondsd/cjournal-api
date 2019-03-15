const log = require('../logger')
const sqlite = require('sqlite3')
const db = new sqlite.Database('trackers.db')
let populate = true // add sample values to the db
let errors = false

db.serialize(() => {
    db.run(`create table if not exists users (
                id integer primary key, 
                name text, 
                device_type text, 
                gender text,
                age int,
                email text unique,
                password text,
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
        tasks_id integer,
        data text,
        foreign key (users_id) references users(id)
        foreign key (tasks_id) references tasks(id)
    )`, (err) => {
            if (err) {
                log(err)
                errors = true
            }
        })

    db.run(`create table if not exists tasks (
        id integer primary key,
        users_id integer not null,
        activity_type text not null,
        time datetime not null,
        duration text not null,
        completed bool not null default false,
        foreign key (users_id) references users(id)
    )`, (err) => {
            if (err) {
                log(err)
                errors = true
            }
        })

    db.run(`create table if not exists virtual_activity (
        id integer not null,
        users_id integer not null,
        activity_type text not null,
        time_started datetime not null,
        duration text not null,
        tasks_id integer,
        data text,
        foreign key (id) references activity(id)
        foreign key (users_id) references users(id)
        foreign key (tasks_id) references tasks(id)
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
    db.run(`INSERT INTO users(name, device_type, age, gender, last_seen, email, password) VALUES ('Alexander Feldman', 'Shovel','54', 'male', '1550507313', 'ggn00b@mail.ru', '$2a$10$teACha.MBCW68XIqYHAZielRJa5qSbSx6DKf4ihAqTVqOgJtg3aoe')`, (err) => {
        if (err) {
            log(err)
            errors = true
        }
    })
    db.run(`INSERT INTO users(name, device_type, age, gender, last_seen, email, password) VALUES ('Carl Sagan', 'Telescope', '54', 'male','1550507313', 'ggn00b@mail.ua', '$2a$10$teACha.MBCW68XIqYHAZielRJa5qSbSx6DKf4ihAqTVqOgJtg3aoe')`, (err) => {
        if (err) {
            log(err)
            errors = true
        }
    })
    db.run(`INSERT INTO users(name, device_type, age, gender, last_seen, email, password) VALUES ('Max Plank', 'Microscope', '54', 'male','1550507313', 'ggn000b@gmail.com', '$2a$10$teACha.MBCW68XIqYHAZielRJa5qSbSx6DKf4ihAqTVqOgJtg3aoe')`, (err) => {
        if (err) {
            log(err)
            errors = true
        }
    })

    let data = {
        "steps": 10.3,
        "distance": 15,
        "sucessfull": true
    }

    db.run(`insert into activity(users_id, activity_type, time_started, duration, data) values ('1', 'Walking', '2019-02-18T12:30:44.624Z', '300', json('${JSON.stringify(data)}'))`, (err) => {
        if (err) {
            log(err)
            errors = true
        }
    })

    db.run(`insert into activity(users_id, activity_type, time_started, duration, data) values ('1', 'Walking', '2019-02-18T12:30:44.624Z', '300', json('${JSON.stringify(data)}'))`, (err) => {
        if (err) {
            log(err)
            errors = true
        }
    })

    db.run(`insert into activity(users_id, activity_type, time_started, duration, data) values ('3', 'Walking', '2019-02-18T12:30:44.624Z', '300', json('${JSON.stringify(data)}'))`, (err) => {
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

        db.each(`select * from activity`, (err, records) => {
            console.log(records)
        })

        console.log(`Sucessfully created the database with tables and populated each table it with 3 sample records`)
    }
}

db.close()