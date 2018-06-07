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

const eval_args = (func) => (local_env, ...args) => func(...args.map(val => evaluate(val, local_env)));
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

const lambda_gen = (parent_env, arg_names, func) => {
  arg_names = wrap_array(...arg_names);
  let lambda = eval_args((...args) => {
    let local_env = env(parent_env);
    arg_names.forEach((arg, index) => {
      if (local_env[args[index]] !== undefined) {
        local_env[arg] = local_env[args[index]];
      } else {
        local_env[arg] = args[index];
      }
    });
    if (args.length >= arg_names.length) {
      return evaluate(func, local_env);
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

const map_gen = (parent_env, ...pairs) => {
  let map = {};
  pairs.forEach(pair => map[pair[0]] = pair[1]);
  let access = (_, key) => evaluate(map[key], parent_env);
  access.toString = () => map_display(map);
  return access;
};

const list_gen = (parent_env, ...list) => {
  let access = (_, index) => evaluate(list[index], parent_env);
  access.toString = () => `list ${list.join(' ')}`;
  return access;
};

const default_env = {
  'begin': (parent_env, ...exps) => {
    const local_env = env(parent_env);
    return exps.map((exp) => evaluate(exp, local_env))[exps.length - 1];
  },
  'let': (local_env, symbol, exp) => local_env[symbol] = evaluate(exp, local_env),
  'const': (local_env, symbol, exp) => {
    if (local_env[symbol] !== undefined) {
      throw Error(`Symbol already defined: ${symbol}`);
    }
    return local_env[symbol] = evaluate(exp, local_env);
  },
  'lambda': lambda_gen,
  'map': map_gen,
  'list': list_gen,
  'literal': (_, arg) => arg,
  'if': (local_env, condition, ifTrue, ifFalse) =>
    evaluate(condition, local_env)
      ? evaluate(ifTrue, local_env)
      : evaluate(ifFalse, local_env),
  'concat': eval_args(list_args((a, b) => a.concat(...b))),
  '+': eval_args((a, b) => a + b),
  '-': eval_args((a, b) => a - b),
  '*': eval_args((a, b) => a * b),
  '/': eval_args((a, b) => a / b),
  '>': eval_args((a, b) => a > b),
  '>=': eval_args((a, b) => a >= b),
  '<': eval_args((a, b) => a < b),
  '=': eval_args((a, b) => a === b),
  '!=': eval_args((a, b) => a !== b),
  'pi': Math.PI,
  'import': (_, file) => run(fs.readFileSync(file).toString()),
};

const env = (parent_env = {}) => ({
  ...parent_env,
});

const global_env = env(default_env);

const evaluate = (value, local_env = global_env) => {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return [];
    } else if (local_env[value[0]] !== undefined) {
      if (typeof local_env[value[0]] === 'function') {
        return local_env[value[0]](local_env, ...value.slice(1));
      } else {
        return local_env[value[0]];
      }
    } else if (Array.isArray(value[0])) {
      value[0] = evaluate(value[0], local_env);
      return evaluate(value, local_env);
    } else if (typeof value[0] === 'function') {
      return value[0](local_env, ...value.slice(1));
    } else {
      throw Error(`Undefined value ${value[0]}`);
    }
  } else {
    if (local_env[value] !== undefined) {
      return local_env[value];
    } else {
      return value;
    }
  }
};

const run = (string) => evaluate(parse(tokenize(string)));

module.exports = {
  tokenize,
  parse,
  evaluate,
  run,
  display,
};
