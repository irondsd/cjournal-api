export default (value: string | number) => {
    if (!value) return ''
    if (typeof value !== 'string' && typeof value !== 'number') return ''
    if (typeof value === 'number') return value + ''
    return value.replace(/[|&;$%@"'<>()+,]/g, '')
}
