const resolve = (env, symbol) =>
  env[symbol] === undefined
    ? env['__parent__'] !== undefined
      ? resolve(env['__parent__'], symbol)
      : undefined
    : env[symbol];

const update = (env, symbol, new_value) =>
  env[symbol] === undefined
    ? env['__parent__'] !== undefined
      ? update(env['__parent__'], symbol, new_value)
      : false
    : env[symbol] = new_value;

const is_writable = (env, symbol) =>
  env[symbol] === undefined
    ? env['__parent__'] !== undefined
      ? is_writable(env['__parent__'], symbol)
      : true
    : Object.getOwnPropertyDescriptor(env, symbol).writable ? true : false;

const new_env = (parent = {}) => ({
  '__parent__': parent,
});

module.exports = { resolve, update, is_writable, new_env };
