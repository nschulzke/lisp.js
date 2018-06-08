const { new_env } = require('interpreter/core/env');
const evaluate = require('interpreter/core/evaluate');
const { eval_args } = require('../_helpers');
const display = require('./display');

const wrap_array = (...items) => items;

const lambda = (env, arg_names, func) => {
  arg_names = wrap_array(...arg_names);
  let result = eval_args((...args) => {
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
      return result;
    } else {
      let inner_arg_names = arg_names.slice(args.length);
      let inner_lambda = lambda(local_env, inner_arg_names, func);
      inner_lambda.toString = () => display.lambda(inner_arg_names, ['lambda', arg_names, func, [...args, ...inner_arg_names]]);
      return inner_lambda;
    }
  });
  result.toString = () => display.lambda(arg_names, func);
  return result;
};

const map = (env, ...pairs) => {
  let object = {};
  pairs.forEach(pair => object[pair[0]] = pair[1]);
  let access = (_, key) => evaluate(env, object[key]);
  access.toString = () => display.map(object);
  return access;
};

const list = (env, ...array) => {
  let access = (_, index) => evaluate(env, array[index]);
  access.toString = () => display.list(array);
  return access;
};

module.exports = { lambda, map, list };
