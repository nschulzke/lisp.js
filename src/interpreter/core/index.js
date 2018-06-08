const tokenize = require('./tokenize');
const parse = require('./parse');
const evaluate = require('./evaluate');

const core = (env, string) => evaluate(env, parse(tokenize(string)));

module.exports = core;
