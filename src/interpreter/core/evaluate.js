const { resolve } = require('./env');

const attempt_resolve = (local_env, symbol) => {
  if (resolve(local_env, symbol) !== undefined) {
    return resolve(local_env, symbol);
  } else {
    throw Error(`Undefined symbol: ${symbol}`);
  }
};

const attempt_lambda = (local_env, list) => {
  let lambda = attempt_resolve(local_env, list[0]);
  if (typeof lambda === 'function') {
    return lambda(local_env, ...list.slice(1));
  } else {
    throw Error(`Not a lambda: ${list[0]}`);
  }
};

const atoms = {
  symbol: {
    test: (_, token) =>
      typeof token === 'string'
      && token[0] !== '"',
    make: (local_env, token) =>
      attempt_resolve(local_env, token),
  },
  number: {
    test: (_, token) =>
      typeof token === 'number',
    make: (_, token) =>
      token,
  },
  string: {
    test: (_, token) =>
      typeof token === 'string'
      && token[0] === '"'
      && token[token.length - 1] === '"',
    make: (_, token) =>
      token.slice(1, token.length - 1),
  },
};

const lists = {
  empty: {
    test: (_, list) =>
      list.length === 0,
    make: () => [],
  },
  function: {
    test: (_, list) =>
      typeof list[0] === 'function',
    make: (local_env, list) =>
      list[0](local_env, ...list.slice(1)),
  },
  function_ref: {
    test: (local_env, list) =>
      typeof list[0] === 'string',
    make: (local_env, list) =>
      attempt_lambda(local_env, list),
  },
  function_list: {
    test: (local_env, token) =>
      Array.isArray(token[0]),
    make: (local_env, list, evaluate) => {
      list[0] = evaluate(local_env, list[0]);
      return evaluate(local_env, list);
    }
  },
};

const evaluate = (initial_env, initial_value, wrapped = false) => {
  if (wrapped && Array.isArray(initial_value) && initial_value.length === 1) {
    initial_value = initial_value[0];
  }
  const evaluate_inner = (local_env, value) => {
    let forms = Array.isArray(value)
      ? lists
      : atoms;
    let error = Array.isArray(value)
      ? `Expected function call, got (${value.join(' ')})`
      : `Expected atom, got ${value}`;
    let result = undefined;
    Object.keys(forms).some(key => {
      if (forms[key].test(local_env, value, evaluate)) {
        result = forms[key].make(local_env, value, evaluate);
        return true;
      } else {
        return false;
      }
    });
    if (result === undefined) {
      throw Error(error);
    }
    return result;
  };
  return evaluate_inner(initial_env, initial_value);
};

module.exports = evaluate;
