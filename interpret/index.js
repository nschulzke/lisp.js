const init_env = require('./environment/init');
const tokenize = require('./tokenize');
const parse = require('./parse');
const evaluate = require('./evaluate');

let global_env = init_env();

const interpret = (string) => evaluate(global_env, parse(tokenize(string)));

module.exports = interpret;
module.exports.init = () => global_env = init_env();
