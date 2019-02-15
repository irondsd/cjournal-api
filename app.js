const log = require('./logger')
const port = 3000

const http = require('http')
const server = http.createServer((req, res) => {
    if (req.url === '/api/') {
        res.write('You should not be here')
        res.end()
    }

    if (req.url === '/api/list') {
        res.write(JSON.stringify([1, 2, 3]))
        res.end()
    }
})

server.listen(port)

log('Listening on port ' + port + '...')