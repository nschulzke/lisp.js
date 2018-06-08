const { new_env } = require('interpreter/core/env');

const definitions = require('./definitions');

module.exports = (injected) => new_env({ ...definitions, ...injected });
