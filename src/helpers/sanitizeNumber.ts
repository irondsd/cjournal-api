export default (num: string | number) => {
    if (typeof num === 'number') return num
    if (typeof num !== 'string') return null
    const sanitized = parseInt(num)
    if (isNaN(sanitized)) return null
    return sanitized
}
