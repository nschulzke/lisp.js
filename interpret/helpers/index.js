const evaluate = require('../evaluate');

const eval_args = (func) => (local_env, ...args) => func(...args.map(val => evaluate(local_env, val)));

const list_args = (func) => (...args) => func(...args.map(val => Array.isArray(val) ? val : [val]));

module.exports = { eval_args, list_args };
