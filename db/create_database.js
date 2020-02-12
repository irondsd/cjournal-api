const log = require('../helpers/logger')
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
let errors = false

db.serialize(() => {
    db.run(
        `create table if not exists users (
                id integer primary key, 
                sub text not null unique,
                username text not null, 
                idinv text default '', 
                hide_elements text default '[]',
                language text default 'ru',
                last_seen datetime)`,

        err => {
            if (err) {
                console.log(err)
                errors = true
            }
        },
    )

    // TODO: idinv?

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
        course_therapy text default '[]',
        relief_of_attack text default '[]',
        tests text default '[]',
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

db.close()
