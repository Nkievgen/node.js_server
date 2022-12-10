const crypto = require('crypto');

const promiseToken = new Promise((resolve, reject) => {
    crypto.randomBytes(32, (err, buffer) => {
        resolve(buffer.toString('hex'));
    });
})

module.exports = promiseToken;