module.exports = int => {
    if (!int) return 'NULL'
    if (typeof int !== 'string' && typeof int !== 'number') return 'NULL'
    int = parseInt(int)
    if (isNaN(int)) return 'NULL'
    return int
}
