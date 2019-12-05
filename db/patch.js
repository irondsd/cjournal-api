const log = require('../helpers/logger')
const sqlite = require('sqlite3')
const db = new sqlite.Database('trackers.db')
let populate = true // add sample values to the db
let errors = false

db.serialize(() => {
    db.run(
        `alter table users rename device_type to "idinv"`,

        err => {
            if (err) {
                console.log(err)
            }
        },
    )

    db.run(
        `alter table activity add idinv text`,

        err => {
            if (err) {
                console.log(err)
            }
        },
    )

    db.run(
        `alter table tasks add idinv text`,

        err => {
            if (err) {
                console.log(err)
            }
        },
    )

    db.run(
        `alter table virtual_activity add idinv text`,

        err => {
            if (err) {
                console.log(err)
            }
        },
    )
})

db.close()
