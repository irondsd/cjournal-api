let timestamp = function(date = new Date()) {
    return parseInt((date.getTime() + '').substring(0, 10))
}

module.exports = {
    timestamp,
}
