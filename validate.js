function validate_api_key(req) {
    if (req.query.api_key === 'f932-ed91-534e-4c64') {
        return true
    }
    else {
        return false
    }
}

function validate_new_user(req) {
    let errors = []
    if (!req.body.name) {
        errors.push("name must be specified")
    }
    if (req.body.name && req.body.name.length < 3) {
        errors.push("Name must be at least 3 characters long")
    }
    if (!req.body.device_type) {
        errors.push("device_type must be specified")
    }
    if (!req.body.email) {
        errors.push("email must be specified")
    }
    if (req.body.email) {
        if (!req.body.email.includes('@') || !req.body.email.includes('.')) {
            // TODO: make a better check in the future
            errors.push("email is invalid")
        }
    }
    if (!req.body.password) {
        errors.push("password must be specified")
    }
    return errors
}

function validate_update_user(req) {
    if (req.body.name && req.body.device_type && req.body.email && req.body.password) {
        return true
    }
    else {
        return false
    }
}

function validate_activity_record(req) {
    if (req.body.activity_type && req.body.time_started && req.body.duration) {
        return true
    }
    else {
        return false
    }
}

module.exports.new_user = validate_new_user
module.exports.update_user = validate_update_user
module.exports.activity_record = validate_activity_record
module.exports.api_key = validate_api_key