const log = require('../logger')
const sqlite = require('sqlite3')
const db = new sqlite.Database('trackers.db')
let populate = true // add sample values to the db
let errors = false

db.serialize(() => {
    db.run(
        `create table if not exists users (
                id integer primary key, 
                name text, 
                device_type text, 
                gender text,
                age int,
                email text unique,
                password text,
                information text,
                hide_elements text,
                last_seen datetime)`,
        err => {
            if (err) {
                log(err)
                errors = true
            }
        }
    )

    db.run(
        `create table if not exists activity (
        id integer primary key,
        users_id integer not null,
        activity_type text not null,
        time_started datetime not null,
        time_ended datetime,
        tasks_id integer,
        last_updated integer,
        uploaded integer,
        data text,
        ref_id integer default null,
        deleted bool default false,
        foreign key (users_id) references users(id)
        foreign key (tasks_id) references tasks(id)
    )`,
        err => {
            if (err) {
                log(err)
                errors = true
            }
        }
    )

    db.run(
        `create table if not exists prescriptions (
        users_id integer not null primary key,
        course_therapy text,
        relief_of_attack text,
        tests text,
        foreign key (users_id) references users(id)
    )`,
        err => {
            if (err) {
                log(err)
                errors = true
            }
        }
    )

    db.run(
        `create table if not exists tasks (
        id integer primary key,
        users_id integer not null,
        activity_type text not null,
        time datetime not null,
        data text,
        completed bool default false,
        last_updated integer,
        deleted bool default false,
        foreign key (users_id) references users(id)
    )`,
        err => {
            if (err) {
                log(err)
                errors = true
            }
        }
    )

    db.run(
        `create table if not exists virtual_activity (
        id integer primary key,
        users_id integer not null,
        activity_type text not null,
        time_started datetime not null,
        time_ended datetime,
        tasks_id integer,
        last_updated integer,
        uploaded integer,
        data text,
        ref_id integer default null,
        deleted bool default false,
        foreign key (users_id) references users(id)
        foreign key (tasks_id) references tasks(id)
    )`,
        err => {
            if (err) {
                log(err)
                errors = true
            }
        }
    )

    db.run(
        `create table if not exists sessions (
                sid integer primary key, 
                user_id int not null, 
                api_key text not null,
                renewable bool,
                exp_date datetime not null
    )`,
        err => {
            if (err) {
                log(err)
                errors = true
            }
        }
    )
})

if (populate) {
    db.run(
        `INSERT INTO users(name, device_type, age, gender, last_seen, email, password, information) VALUES ('Alexander Feldman', 'Shovel','54', 'male', '1550507313', 'ggn00b@mail.ru', '$2a$10$teACha.MBCW68XIqYHAZielRJa5qSbSx6DKf4ihAqTVqOgJtg3aoe', 'You are the patint of Whatever hostpital. Your doctor is Donald Trump. Wut? You crazy or what? You can contact him on the phone number +13947576392')`,
        err => {
            if (err) {
                log(err)
                errors = true
            }
        }
    )
    db.run(
        `INSERT INTO users(name, device_type, age, gender, last_seen, email, password, information) VALUES ('Carl Sagan', 'Telescope', '54', 'male','1550507313', 'ggn00b@mail.ua', '$2a$10$teACha.MBCW68XIqYHAZielRJa5qSbSx6DKf4ihAqTVqOgJtg3aoe', 'You are the patint of Whatever hostpital. Your doctor is Donald Trump. Wut? You crazy or what? You can contact him on the phone number +13947576392')`,
        err => {
            if (err) {
                log(err)
                errors = true
            }
        }
    )
    db.run(
        `INSERT INTO users(name, device_type, age, gender, last_seen, email, password, information) VALUES ('Max Plank', 'Microscope', '54', 'male','1550507313', 'ggn000b@gmail.com', '$2a$10$teACha.MBCW68XIqYHAZielRJa5qSbSx6DKf4ihAqTVqOgJtg3aoe', 'You are the patint of Whatever hostpital. Your doctor is Donald Trump. Wut? You crazy or what? You can contact him on the phone number +13947576392')`,
        err => {
            if (err) {
                log(err)
                errors = true
            }
        }
    )

    let data = {
        steps: 10.3,
        distance: 15,
        sucessfull: true
    }

    db.run(
        `insert into activity(users_id, activity_type, time_started, last_updated, data) values ('1', 'Walking', '1554197138', '1554195281', json('${JSON.stringify(
            data
        )}'))`,
        err => {
            if (err) {
                log(err)
                errors = true
            }
        }
    )

    db.run(
        `insert into activity(users_id, activity_type, time_started, last_updated, data) values ('1', 'Walking', '1554197138', '1554195281', json('${JSON.stringify(
            data
        )}'))`,
        err => {
            if (err) {
                log(err)
                errors = true
            }
        }
    )

    db.run(
        `insert into activity(users_id, activity_type, time_started, last_updated, data) values ('3', 'Walking', '1554197138', '1554195281', json('${JSON.stringify(
            data
        )}'))`,
        err => {
            if (err) {
                log(err)
                errors = true
            }
        }
    )

    db.run(
        `insert into tasks(users_id, activity_type, time, last_updated) values ('1', 'Walking', 1555166888, 1555241651)`,
        err => {
            if (err) {
                log(err)
                errors = true
            }
        }
    )

    db.run(
        `insert into tasks(users_id, activity_type, time, last_updated) values ('1', 'Walking', 1555166888, 1555241651)`,
        err => {
            if (err) {
                log(err)
                errors = true
            }
        }
    )

    db.run(
        `insert into tasks(users_id, activity_type, time, last_updated) values ('3', 'Walking', 1555166888, 1555241651)`,
        err => {
            if (err) {
                log(err)
                errors = true
            }
        }
    )

    db.run(
        `insert into prescriptions(users_id, course_therapy, relief_of_attack, tests) values ('1', '["Acebutolol", "Atenolol"]', '["Bisoprolol", "Betaxolol"]', '["Nadolol", "Propranolol"]')`,
        err => {
            if (err) {
                log(err)
                errors = true
            }
        }
    )

    db.run(
        `insert into prescriptions(users_id, course_therapy, relief_of_attack, tests) values ('2', '["Acebutolol", "Atenolol"]', '["Bisoprolol", "Betaxolol"]', '["Nadolol", "Propranolol"]')`,
        err => {
            if (err) {
                log(err)
                errors = true
            }
        }
    )

    db.run(
        `insert into prescriptions(users_id, course_therapy, relief_of_attack, tests) values ('3', '["Acebutolol", "Atenolol"]', '["Bisoprolol", "Betaxolol"]', '["Nadolol", "Propranolol"]')`,
        err => {
            if (err) {
                log(err)
                errors = true
            }
        }
    )

    if (errors === false) {
        //let's now make sure the records are there
        db.each(`SELECT * FROM users`, (err, records) => {
            console.log(records)
        })

        db.each(`select * from activity`, (err, records) => {
            console.log(records)
        })

        db.each(`select * from tasks`, (err, records) => {
            console.log(records)
        })

        console.log(`Sucessfully created the database with tables and populated each table it with 3 sample records`)
    }
}

db.close()
