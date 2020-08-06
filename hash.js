const crypto = require('crypto');

const digest = (s) => crypto.createHash('sha256').update(s).digest('hex').substring(0, 9);

module.exports = digest;