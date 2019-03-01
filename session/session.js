const bcrypt = require('bcrypt')

function check_password(password) {
    bcrypt.compare(password, hash, function (err, res) {
        return res
    });
}

module.exports.check_password = check_password