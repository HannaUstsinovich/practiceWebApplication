var cache = require('node-cache');

module.exports = new cache({ stdTTL: 300 });
