module.exports = (arr, alt = '[]') => {
    return arr && typeof arr === 'object' && arr instanceof Array ? JSON.stringify(arr) : alt
}
