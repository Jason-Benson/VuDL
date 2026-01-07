const crypto = require('crypto');

module.exports = {
  nanoid: (size = 21) => {
    // return a hex string of requested size (approx). Keep deterministic-ish length.
    return crypto.randomBytes(Math.ceil(size / 2)).toString('hex').slice(0, size);
  }
};
