const { resolve } = require('./environment/resolve');

const evaluate = (local_env, value) => {
  let resolved;
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return [];
    } else if (value.length === 1) {
      return evaluate(local_env, value[0]);
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
      throw Error(`Undefined symbol: ${value[0]}`);
    }
  } else {
    if ((resolved = resolve(local_env, value)) !== undefined) {
      return resolved;
    } else if (typeof value === 'string' && value[0] === '"' && value[value.length - 1] === '"') {
      return value.slice(1, value.length - 1);
    } else if (typeof value === 'number') {
      return value;
    } else {
      throw Error(`Undefined symbol: ${value}`);
    }
  }
};

module.exports = evaluate;
