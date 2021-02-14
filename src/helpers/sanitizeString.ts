export default (string: String) => {
    if (!string) return ''
    if (typeof string !== 'string' && typeof string !== 'number') return ''
    if (typeof string === 'number') return string + ''
    return string.replace(/[|&;$%@"'<>()+,]/g, '')
}
