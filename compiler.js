const fs = require('fs');

const token = /(\(|\)|[^\s()]+)/g;

const tokenize = (string) =>
  string.match(token);

const atom = (token) =>
  isNaN(token)
    ? token
    : Number(token);

const parse = (tokens) => {
  if (!Array.isArray(tokens))
    throw Error('Unexpected input to parser');
  if (tokens.length === 0)
    throw Error('Unexpected EOF');

  let list = [];
  let token = tokens.shift();
  while (token !== ')' && token !== undefined) {
    if (token === '(') {
      list.push(parse(tokens));
    } else {
      list.push(atom(token));
    }
    token = tokens.shift();
  }
  while (list.length === 1 && Array.isArray(list[0])) {
    list = list[0];
  }
  return list;
};

const eval_args = (func) => (local_env, ...args) => func(...args.map(val => evaluate(local_env, val)));
const list_args = (func) => (...args) => func(...args.map(val => Array.isArray(val) ? val : [val]));

const list_display = (list) => {
  list = list.map(item => {
    if (Array.isArray(item)) {
      return list_display(item);
    } else {
      return item;
    }
  });
  return `(${list.join(' ')})`;
};

const lambda_display = (arg_names, func) => `lambda ${display(arg_names)} ${display(func)}`;

const map_display = (map) => {
  let array = [];
  Object.keys(map).forEach(key => {
    array.push(display([key, map[key]]));
  });
  return `map ${array.join(' ')}`;
};

const display = (item) => {
  if (Array.isArray(item)) {
    return list_display(item);
  } else if (typeof item === 'object') {
    return map_display(item);
  } else {
    return item;
  }
};

const wrap_array = (...items) => items;

const lambda_gen = (env, arg_names, func) => {
  arg_names = wrap_array(...arg_names);
  let lambda = eval_args((...args) => {
    let local_env = new_env(env);
    arg_names.forEach((arg, index) => {
      if (local_env[args[index]] !== undefined) {
        local_env[arg] = local_env[args[index]];
      } else {
        local_env[arg] = args[index];
      }
    });
    if (args.length >= arg_names.length) {
      return evaluate(local_env, func);
    } else if (args.length === 0) {
      return lambda;
    } else {
      let inner_arg_names = arg_names.slice(args.length);
      let inner_lambda = lambda_gen(local_env, inner_arg_names, func);
      inner_lambda.toString = () => lambda_display(inner_arg_names, ['lambda', arg_names, func, [...args, ...inner_arg_names]]);
      return inner_lambda;
    }
  });
  lambda.toString = () => lambda_display(arg_names, func);
  return lambda;
};

const map_gen = (env, ...pairs) => {
  let map = {};
  pairs.forEach(pair => map[pair[0]] = pair[1]);
  let access = (_, key) => evaluate(env, map[key]);
  access.toString = () => map_display(map);
  return access;
};

const list_gen = (env, ...list) => {
  let access = (_, index) => evaluate(env, list[index]);
  access.toString = () => `list ${list.join(' ')}`;
  return access;
};

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
  'lambda': lambda_gen,
  'map': map_gen,
  'list': list_gen,
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
  '=': eval_args((a, b) => a === b),
  '!=': eval_args((a, b) => a !== b),
  'pi': Math.PI,
  'import': (_, file) => run(fs.readFileSync(file).toString()),
};

const new_env = (parent = {}) => ({
  '__parent__': parent,
});

const evaluate = (local_env, value) => {
  let resolved;
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return [];
    } else if ((resolved = resolve(local_env, value[0])) !== undefined) {
      if (typeof resolved === 'function') {
        return resolved(local_env, ...value.slice(1));
      } else {
        return resolved;
      }
    } else if (Array.isArray(value[0])) {
      value[0] = evaluate(local_env, value[0]);
      return evaluate(local_env, value);
    } else if (typeof value[0] === 'function') {
      return value[0](local_env, ...value.slice(1));
    } else {
      throw Error(`Undefined value ${value[0]}`);
    }
  } else {
    if ((resolved = resolve(local_env, value)) !== undefined) {
      return resolved;
    } else {
      return value;
    }
  }
};

let global_env;
const init = () => global_env = new_env(default_env);
init();

const run = (string) => evaluate(global_env, parse(tokenize(string)));

module.exports = {
  run,
  init,
  display,
};
