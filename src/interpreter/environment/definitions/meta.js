const evaluate = require('interpreter/core/evaluate');
const { resolve, is_writable, update } = require('interpreter/core/env');

module.exports = {
  'env': (env) => env,
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
};
