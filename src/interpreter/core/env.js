const traverse = (result) => {
  const recurse = (env, symbol, ...args) =>
    env[symbol] === undefined
      ? env['__parent__'] !== undefined
        ? recurse(env['__parent__'], symbol, ...args)
        : result.failure(env, symbol, ...args)
      : result.success(env, symbol, ...args);
  return recurse;
};

const new_env = (parent = {}) => ({
  '__parent__': parent,
});

const resolve = traverse({
  success: (env, symbol) => env[symbol],
  failure: () => undefined,
});

const update = traverse({
  success: (env, symbol, new_value) => env[symbol] = new_value,
  failure: () => false,
});

const is_writable = traverse({
  success: (env, symbol) => Object.getOwnPropertyDescriptor(env, symbol).writable ? true : false,
  failure: () => true,
});

module.exports = { new_env, resolve, update, is_writable };
