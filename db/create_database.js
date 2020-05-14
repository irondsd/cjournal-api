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

    db.run(
        `create table if not exists activity (
        id string not null,
        users_id integer not null,
        activity_type text not null,
        time_started datetime not null,
        utc_offset integer,
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
        id string not null,
        users_id integer not null,
        doctor_id integer not null,
        activity_type text,
        time_started datetime,
        utc_offset integer,
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
        foreign key (tasks_id) references tasks(id)
    )`,
        err => {
            if (err) {
                errors = true
            }
        },
    )
})

db.close()
