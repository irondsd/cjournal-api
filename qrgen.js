var QRCode = require('qrcode')

function QRGen(content) {
    QRCode.toDataURL(content, function(err, url) {
        console.log(url)
    })
}

module.exports = {
    QRGen
}
