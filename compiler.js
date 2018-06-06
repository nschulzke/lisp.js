const token = /(\(|\)|[^\s()]+)/g;

const tokenize = (string) =>
  string.match(token);

const atom = (token) =>
  isNaN(token)
    ? token
    : Number(token);

const flatten = (array) => {
  while (array.length === 1 && Array.isArray(array[0])) {
    array = array[0];
  }
  return array;
};

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
  return flatten(list);
};

const eval_args = (func) => (local_env, ...args) => func(...args.map(val => evaluate(val, local_env)));

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

const lambda_display = (arg_names, func) => `lambda ${list_display(arg_names)} ${list_display(func)}`;

const display = (item) => {
  if (Array.isArray(item)) {
    return list_display(item);
  } else {
    return item;
  }
};

const lambda_gen = (parent_env, arg_names, func, outer_args) => {
  if (!Array.isArray(arg_names)) {
    arg_names = [arg_names];
  }
  let lambda = (_, ...args) => {
    let local_env = env(parent_env);
    arg_names.forEach((arg, index) => {
      if (local_env[args[index]] !== undefined) {
        local_env[arg] = local_env[args[index]];
      } else {
        local_env[arg] = args[index];
      }
    });
    if (args.length === arg_names.length) {
      return evaluate(func, local_env);
    } else if (args.length === 0) {
      return lambda;
    } else {
      let inner_arg_names = arg_names.slice(args.length);
      let inner_lambda = lambda_gen(local_env, inner_arg_names, func);
      inner_lambda.toString = () => lambda_display(inner_arg_names, ['lambda', arg_names, func, [...args, ...inner_arg_names]]);
      return inner_lambda;
    }
  };
  lambda.toString = () => lambda_display(arg_names, func);
  if (outer_args !== undefined) {
    // console.log('env', parent_env);
    // console.log('lambda', lambda.toString());
    // console.log('outer', outer_args);
    // console.log('called', lambda(parent_env, ...outer_args).toString());
    return lambda(parent_env, ...outer_args);
  }
  return lambda;
};

const env = (parent_env = {}) => ({
  'begin': (_, ...exps) => exps.map((exp) => evaluate(exp))[exps.length - 1],
  'let': (_, symbol, exp) => global_env[symbol] = evaluate(exp),
  'lambda': lambda_gen,
  'list': (_, ...args) => args,
  '+': eval_args((a, b) => a + b),
  '-': eval_args((a, b) => a - b),
  '*': eval_args((a, b) => a * b),
  '/': eval_args((a, b) => a / b),
  'pi': Math.PI,
  ...parent_env,
});

const global_env = env();

const evaluate = (value, local_env = global_env) => {
  if (Array.isArray(value)) {
    if (local_env[value[0]] !== undefined) {
      if (typeof local_env[value[0]] === 'function') {
        return local_env[value[0]](local_env, ...value.slice(1));
      } else {
        return local_env[value[0]];
      }
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
