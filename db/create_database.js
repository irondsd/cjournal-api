const log = require('../helpers/logger')
const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/trackers.db')
let populate = true // add sample values to the db
let errors = false

db.serialize(() => {
    db.run(
        `create table if not exists users (
                id integer primary key, 
                username text not null unique, 
                access_token text, 
                refresh_token text,
                idinv text, 
                hide_elements text,
                language text,
                permissions integer not null default '1',
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
        `INSERT INTO users(username, access_token, refresh_token, idinv, last_seen, language, permissions, hide_elements) VALUES ('ggn00b', 'eyJhbGciOiJSUzI1NiIsImtpZCI6IkRldmVsb3BtZW50IiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE1NzcxMDUwNDEsImV4cCI6MTU3NzEwODY0MSwiaXNzIjoiaHR0cDovLzIxNy4xOTcuMjM2LjI0Mjo3MDUwIiwiYXVkIjoiSW5jYXJ0SWRlbnRpdHlTZXJ2ZXJBUEkiLCJjbGllbnRfaWQiOiJBcGlDbGllbnQiLCJzdWIiOiI2ZmUzMTZmOC1iMmQ2LTRmNjQtOWNkNi02ZTg4MmFlMGNiYWEiLCJhdXRoX3RpbWUiOjE1NzcxMDUwNDEsImlkcCI6ImxvY2FsIiwic2NvcGUiOlsib3BlbmlkIiwicHJvZmlsZSIsIkluY2FydElkZW50aXR5U2VydmVyQVBJIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.Hf7ZM0khC1psOt-5w1L4ITcap_Zxir5EQNsyvtZwHrYoHlsXYqVdi-qIS7662gWCoJrZPEiiNn4UBO_jWsPbaU_8gQIt2QhceRV9mLjMunKygprmEzhYGUAcir3vo2dUDQMBe1fKalaKexY8d6gVYI9WZ6M4IsbIV2Ce-pToGuYF2bTA262FBz_3o7enAvAXRWFRLuX-qFAfCVSLggDIEsAaru-zUxdzDqGuU0smdUATyEHaRWN_P0ycX2IQW_0UkpbmHSNW7GXtWcC5vGURQqEQxpEf_N4QImqt2TNLp2Xlg-VNDjRO-SWgWl41edLpDblYxg0E3JXL2JFmLR7Aiw', 'm3key_QmJ8LdEEjBJnoREhjDD6bPmjD1OIAsLnJTOw0', '004_443_531_582_521', '1577104953', 'ru', '3', '[]')`,
        err => {
            if (err) {
                errors = true
            }
        },
    )
    db.run(
        `INSERT INTO users(username, access_token, refresh_token, idinv, last_seen, language, permissions, hide_elements) VALUES ('proplayuser', 'eyJhbGciOiJSUzI1NiIsImtpZCI6IkRldmVsb3BtZW50IiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE1NzcxMDUwNDEsImV4cCI6MTU3NzEwODY0MSwiaXNzIjoiaHR0cDovLzIxNy4xOTcuMjM2LjI0Mjo3MDUwIiwiYXVkIjoiSW5jYXJ0SWRlbnRpdHlTZXJ2ZXJBUEkiLCJjbGllbnRfaWQiOiJBcGlDbGllbnQiLCJzdWIiOiI2ZmUzMTZmOC1iMmQ2LTRmNjQtOWNkNi02ZTg4MmFlMGNiYWEiLCJhdXRoX3RpbWUiOjE1NzcxMDUwNDEsImlkcCI6ImxvY2FsIiwic2NvcGUiOlsib3BlbmlkIiwicHJvZmlsZSIsIkluY2FydElkZW50aXR5U2VydmVyQVBJIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.Hf7ZM0khC1psOt-5w1L4ITcap_Zxir5EQNsyvtZwHrYoHlsXYqVdi-qIS7662gWCoJrZPEiiNn4UBO_jWsPbaU_8gQIt2QhceRV9mLjMunKygprmEzhYGUAcir3vo2dUDQMBe1fKalaKexY8d6gVYI9WZ6M4IsbIV2Ce-pToGuYF2bTA262FBz_3o7enAvAXRWFRLuX-qFAfCVSLggDIEsAaru-zUxdzDqGuU0smdUATyEHaRWN_P0ycX2IQW_0UkpbmHSNW7GXtWcC5vGURQqEQxpEf_N4QImqt2TNLp2Xlg-VNDjRO-SWgWl41edLpDblYxg0E3JXL2JFmLR7Aiw', 'm3key_QmJ8LdEEjBJnoREhjDD6bPmjD1OIAsLnJTOw0', '004_443_531_582_832', '1577104953', 'ru', '3', '[]')`,
        err => {
            if (err) {
                errors = true
            }
        },
    )
    db.run(
        `INSERT INTO users(username, access_token, refresh_token, idinv, last_seen, language, permissions, hide_elements) VALUES ('ggn000b', 'eyJhbGciOiJSUzI1NiIsImtpZCI6IkRldmVsb3BtZW50IiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE1NzcxMDUwNDEsImV4cCI6MTU3NzEwODY0MSwiaXNzIjoiaHR0cDovLzIxNy4xOTcuMjM2LjI0Mjo3MDUwIiwiYXVkIjoiSW5jYXJ0SWRlbnRpdHlTZXJ2ZXJBUEkiLCJjbGllbnRfaWQiOiJBcGlDbGllbnQiLCJzdWIiOiI2ZmUzMTZmOC1iMmQ2LTRmNjQtOWNkNi02ZTg4MmFlMGNiYWEiLCJhdXRoX3RpbWUiOjE1NzcxMDUwNDEsImlkcCI6ImxvY2FsIiwic2NvcGUiOlsib3BlbmlkIiwicHJvZmlsZSIsIkluY2FydElkZW50aXR5U2VydmVyQVBJIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.Hf7ZM0khC1psOt-5w1L4ITcap_Zxir5EQNsyvtZwHrYoHlsXYqVdi-qIS7662gWCoJrZPEiiNn4UBO_jWsPbaU_8gQIt2QhceRV9mLjMunKygprmEzhYGUAcir3vo2dUDQMBe1fKalaKexY8d6gVYI9WZ6M4IsbIV2Ce-pToGuYF2bTA262FBz_3o7enAvAXRWFRLuX-qFAfCVSLggDIEsAaru-zUxdzDqGuU0smdUATyEHaRWN_P0ycX2IQW_0UkpbmHSNW7GXtWcC5vGURQqEQxpEf_N4QImqt2TNLp2Xlg-VNDjRO-SWgWl41edLpDblYxg0E3JXL2JFmLR7Aiw', 'm3key_QmJ8LdEEjBJnoREhjDD6bPmjD1OIAsLnJTOw0', '004_443_531_582_929', '1577104953', 'ru', '3', '[]')`,
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
                log.error(err)
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
                log.error(err)
                errors = true
            }
        },
    )

    db.run(
        `insert into tasks(users_id, activity_type, time, last_updated, data) values ('1', 'Walking', 1555166888, 1555241651, '{}')`,
        err => {
            if (err) {
                log.error(err)
                errors = true
            }
        },
    )

    db.run(
        `insert into tasks(users_id, activity_type, time, last_updated, data) values ('1', 'Walking', 1555166888, 1555241651, '{}')`,
        err => {
            if (err) {
                log.error(err)
                errors = true
            }
        },
    )

    db.run(
        `insert into tasks(users_id, activity_type, time, last_updated, data) values ('3', 'Walking', 1555166888, 1555241651, '{}')`,
        err => {
            if (err) {
                log.error(err)
                errors = true
            }
        },
    )

    db.run(
        `insert into prescriptions(users_id, course_therapy, relief_of_attack, tests) values ('1', '["Acebutolol", "Atenolol"]', '["Bisoprolol", "Betaxolol"]', '["Nadolol", "Propranolol"]')`,
        err => {
            if (err) {
                log.error(err)
                errors = true
            }
        },
    )

    db.run(
        `insert into prescriptions(users_id, course_therapy, relief_of_attack, tests) values ('2', '["Acebutolol", "Atenolol"]', '["Bisoprolol", "Betaxolol"]', '["Nadolol", "Propranolol"]')`,
        err => {
            if (err) {
                log.error(err)
                errors = true
            }
        },
    )

    db.run(
        `insert into prescriptions(users_id, course_therapy, relief_of_attack, tests) values ('3', '["Acebutolol", "Atenolol"]', '["Bisoprolol", "Betaxolol"]', '["Nadolol", "Propranolol"]')`,
        err => {
            if (err) {
                log.error(err)
                errors = true
            }
        },
    )

    if (errors === false) {
        //let's now make sure the records are there
        db.each(`SELECT * FROM users`, (err, records) => {
            log.info(JSON.stringify(records))
        })

        // db.each(`select * from activity`, (err, records) => {
        //     log.info(records)
        // })

        // db.each(`select * from tasks`, (err, records) => {
        //     log.info(records)
        // })

        log.info(`Sucessfully created the database`)
    }
}

db.close()
