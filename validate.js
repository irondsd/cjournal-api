function validate_api_key(req) {
    if (req.query.api_key === 'f932-ed91-534e-4c64') {
        return true
    }
    else {
        return false
    }
}

function validate_new_device(req) {
    if (!req.body.name || req.body.name.length < 3) {
        return false
    }

    if (!req.body.device_type) {
        return false
    }

    return true
}

function validate_exercise_record(req) {
    if (req.body.device_id && req.body.exercise_type && req.body.time_started && req.body.duration && req.body.successful) {
        return true
    }
    else {
        return false
    }
}

module.exports.new_device = validate_new_device
module.exports.exercise_record = validate_exercise_record
module.exports.api_key = validate_api_key