const log = require('./logger')

exports.all = function all(rows) {
    if (Array.isArray(rows)) {
        for (el of rows) {
            for (key in el) {
                try {
                    el[key] = JSON.parse(el[key])
                } catch (error) {
                    // failed
                }
            }
        }
    } else {
        // there's misuse of this function
        log('need inspection objectify.js was used incorrectly')
    }

    return rows
}

exports.dataRows = function dataRows(rows) {
    if (Array.isArray(rows)) {
        for (el of rows) {
            try {
                el.data = JSON.parse(el.data)
            } catch (error) {
                // failed
                log('data parse failed')
            }
        }
    } else {
        // there's misuse of this function
        log('need inspection objectify.js was used incorrectly')
    }

    return rows
}
