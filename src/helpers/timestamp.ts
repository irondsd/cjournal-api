export const timestamp = (date: Date = new Date()): number => {
    return Math.round(Date.now() / 1000)
}
