module.exports = int => {
    if (!int) return null
    if (typeof int !== 'string' && typeof int !== 'number') return null
    int = parseInt(int)
    if (isNaN(int)) return null
    return int
}
