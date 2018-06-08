const fs = require('fs');
const evaluate = require('../evaluate');
const interpret = require('../index');
const types = require('../types');
const { eval_args, list_args } = require('../helpers');
const { resolve, is_writable, update } = require('./resolve');
const create = require('./create');

const default_env = {
  'begin': (env, ...exps) => exps.map((exp) => evaluate(env, exp))[exps.length - 1],
  'def': (local_env, symbol, exp) => {
    if (local_env[symbol] !== undefined) {
      throw Error(`Symbol already defined: ${symbol}`);
    }
    return local_env[symbol] = evaluate(local_env, exp);
  },
  'const': (local_env, symbol, exp) => {
    if (local_env[symbol] !== undefined) {
      throw Error(`Symbol already defined: ${symbol}`);
    }
    Object.defineProperty(local_env, symbol, {
      value: evaluate(local_env, exp),
      writable: false,
    });
    return local_env[symbol];
  },
  'set': (local_env, symbol, exp) => {
    if (resolve(local_env, symbol) === undefined) {
      throw Error(`Undefined symbol: ${symbol}`);
    }
    if (is_writable(local_env, symbol) === false) {
      throw Error(`Cannot change value of const: ${symbol}`);
    }
    return update(local_env, symbol, evaluate(local_env, exp));
  },
  'env': (env) => env,
  'lambda': types.lambda,
  'map': types.map,
  'list': types.list,
  'literal': (_, arg) => arg,
  'if': (local_env, condition, ifTrue, ifFalse) =>
    evaluate(local_env, condition)
      ? evaluate(local_env, ifTrue)
      : evaluate(local_env, ifFalse),
  '_': [],
  'concat': eval_args(list_args((a, b) => a.concat(...b))),
  '+': eval_args((...args) => args.reduce((a, b) => a + b, 0)),
  '-': eval_args((...args) => args.reduce((a, b) => a - b, 0)),
  '*': eval_args((...args) => args.reduce((a, b) => a * b, 1)),
  '/': eval_args((...args) => args.reduce((a, b) => a / b, 1)),
  '>': eval_args((a, b) => a > b),
  '>=': eval_args((a, b) => a >= b),
  '<': eval_args((a, b) => a < b),
  '<=': eval_args((a, b) => a <= b),
  '=': eval_args((a, b) => a === b),
  '!=': eval_args((a, b) => a !== b),
  'pi': Math.PI,
  'import': (_, file) => interpret(fs.readFileSync(file).toString()),
};

const init = () => create(default_env);

module.exports = init;
