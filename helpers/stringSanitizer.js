module.exports = string => {
    if (!string) return ''
    if (typeof string !== 'string' || typeof string !== 'number') return ''
    if (typeof string === 'number') string + ''
    return string.replace(/[|&;$%@"'<>()+,]/g, '')
}
