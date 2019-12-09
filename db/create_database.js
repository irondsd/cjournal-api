const log = require('../helpers/logger')
const sqlite = require('sqlite3')
const db = new sqlite.Database('trackers.db')
let populate = true // add sample values to the db
let errors = false

db.serialize(() => {
    db.run(
        `create table if not exists users (
                id integer primary key, 
                name text, 
                idinv text, 
                gender text,
                birthday text,
                email text unique,
                password text,
                information text,
                hide_elements text,
                language text,
                permissions integer not null default '1',
                last_seen datetime)`,

        err => {
            if (err) {
                errors = true
            }
        },
    )

    db.run(
        `create table if not exists activity (
        id integer primary key,
        users_id integer not null,
        activity_type text not null,
        time_started datetime not null,
        time_ended datetime,
        tasks_id integer,
        idinv text,
        last_updated integer,
        version integer,
        uploaded integer,
        comment text,
        data text,
        ref_id integer default null,
        deleted bool default false,
        foreign key (users_id) references users(id),
        foreign key (tasks_id) references tasks(id)
    )`,
        err => {
            if (err) {
                errors = true
            }
        },
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
                errors = true
            }
        },
    )

    db.run(
        `create table if not exists doctor (
        patient_id integer not null,
        doctor_id integer not null,
        foreign key (patient_id) references users(id)
        foreign key (doctor_id) references users(id)
    )`,
        err => {
            if (err) {
                errors = true
            }
        },
    )

    db.run(
        `create table if not exists tasks (
        id integer primary key,
        users_id integer not null,
        activity_type text not null,
        time datetime not null,
        comment text,
        idinv text,
        data text,
        completed bool default false,
        ref_id integer default null,
        last_updated integer,
        deleted bool default false,
        foreign key (users_id) references users(id)
    )`,
        err => {
            if (err) {
                errors = true
            }
        },
    )

    db.run(
        `create table if not exists virtual_activity (
        id integer primary key,
        activity_id integer,
        users_id integer not null,
        doctor_id integer not null,
        activity_type text,
        time_started datetime,
        time_ended datetime,
        tasks_id integer,
        idinv text,
        last_updated integer,
        uploaded integer,
        comment text,
        data text,
        set_deleted bool default false,
        ref_id integer default null,
        deleted bool default false,
        foreign key (users_id) references users(id),
        foreign key (doctor_id) references users(id),
        foreign key (tasks_id) references tasks(id),
        foreign key (activity_id) references activity(id)
    )`,
        err => {
            if (err) {
                errors = true
            }
        },
    )
})

if (populate) {
    db.run(
        `INSERT INTO users(name, idinv, birthday, gender, last_seen, email, password, information, language, hide_elements) VALUES ('Alexander Feldman', '111','10.05.1957', 'male', '1550507313', 'ggn00b@mail.ru', '$2a$10$teACha.MBCW68XIqYHAZielRJa5qSbSx6DKf4ihAqTVqOgJtg3aoe', 'You are the patint of Whatever hostpital. Your doctor is Donald Trump. Wut? You crazy or what? You can contact him on the phone number +13947576392', 'ru', '[]')`,
        err => {
            if (err) {
                errors = true
            }
        },
    )
    db.run(
        `INSERT INTO users(name, idinv, birthday, gender, last_seen, email, password, information, language, hide_elements) VALUES ('Carl Sagan', '222', '10.05.1987', 'male','1550507313', 'ggn00b@mail.ua', '$2a$10$teACha.MBCW68XIqYHAZielRJa5qSbSx6DKf4ihAqTVqOgJtg3aoe', 'You are the patint of Whatever hostpital. Your doctor is Donald Trump. Wut? You crazy or what? You can contact him on the phone number +13947576392', 'es', '[]')`,
        err => {
            if (err) {
                errors = true
            }
        },
    )
    db.run(
        `INSERT INTO users(name, idinv, birthday, gender, last_seen, email, password, information, language, permissions, hide_elements) VALUES ('Max Plank', '333', '10.05.1963', 'male','1550507313', 'ggn000b@gmail.com', '$2a$10$teACha.MBCW68XIqYHAZielRJa5qSbSx6DKf4ihAqTVqOgJtg3aoe', 'You are the patint of Whatever hostpital. Your doctor is Donald Trump. Wut? You crazy or what? You can contact him on the phone number +13947576392', 'en', '3', '[]')`,
        err => {
            if (err) {
                errors = true
            }
        },
    )

    let data = {
        steps: 10.3,
        distance: 15,
        sucessfull: true,
    }

    db.run(
        `insert into activity(users_id, activity_type, time_started, last_updated, data) values ('1', 'Walking', '1554197138', '1554195281', json('${JSON.stringify(
            data,
        )}'))`,
        err => {
            if (err) {
                errors = true
            }
        },
    )

    db.run(
        `insert into activity(users_id, activity_type, time_started, last_updated, data) values ('1', 'Walking', '1554197138', '1554195281', json('${JSON.stringify(
            data,
        )}'))`,
        err => {
            if (err) {
                log(err)
                errors = true
            }
        },
    )

    db.run(
        `insert into activity(users_id, activity_type, time_started, last_updated, data) values ('3', 'Walking', '1554197138', '1554195281', json('${JSON.stringify(
            data,
        )}'))`,
        err => {
            if (err) {
                log(err)
                errors = true
            }
        },
    )

    db.run(
        `insert into tasks(users_id, activity_type, time, last_updated, data) values ('1', 'Walking', 1555166888, 1555241651, '{}')`,
        err => {
            if (err) {
                log(err)
                errors = true
            }
        },
    )

    db.run(
        `insert into tasks(users_id, activity_type, time, last_updated, data) values ('1', 'Walking', 1555166888, 1555241651, '{}')`,
        err => {
            if (err) {
                log(err)
                errors = true
            }
        },
    )

    db.run(
        `insert into tasks(users_id, activity_type, time, last_updated, data) values ('3', 'Walking', 1555166888, 1555241651, '{}')`,
        err => {
            if (err) {
                log(err)
                errors = true
            }
        },
    )

    db.run(
        `insert into prescriptions(users_id, course_therapy, relief_of_attack, tests) values ('1', '["Acebutolol", "Atenolol"]', '["Bisoprolol", "Betaxolol"]', '["Nadolol", "Propranolol"]')`,
        err => {
            if (err) {
                log(err)
                errors = true
            }
        },
    )

    db.run(
        `insert into prescriptions(users_id, course_therapy, relief_of_attack, tests) values ('2', '["Acebutolol", "Atenolol"]', '["Bisoprolol", "Betaxolol"]', '["Nadolol", "Propranolol"]')`,
        err => {
            if (err) {
                log(err)
                errors = true
            }
        },
    )

    db.run(
        `insert into prescriptions(users_id, course_therapy, relief_of_attack, tests) values ('3', '["Acebutolol", "Atenolol"]', '["Bisoprolol", "Betaxolol"]', '["Nadolol", "Propranolol"]')`,
        err => {
            if (err) {
                log(err)
                errors = true
            }
        },
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

        log(`Sucessfully created the database`)
    }
}

db.close()
