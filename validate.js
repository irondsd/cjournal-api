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

module.exports.new_device = validate_new_device
module.exports.api_key = validate_api_key