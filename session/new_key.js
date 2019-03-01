function generate_new_key() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

module.exports.generate_new_key = generate_new_key