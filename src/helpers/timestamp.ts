export const timestamp = (date: Date = new Date()) => {
    return Math.round(Date.now() / 1000)
}
