const { list_join } = require('display');

const lambda = (arg_names, func) => list_join(['lambda', display(arg_names), display(func)]);

const map = (map) => {
  let array = [];
  Object.keys(map).forEach(key => {
    array.push(display([key, map[key]]));
  });
  return list_join(['map', ...array]);
};

const list = (list) => list_join(['list', ...list]);

const display = (item) => {
  if (Array.isArray(item)) {
    return list_join(item.map(child => display(child)));
  } else if (typeof item === 'object') {
    return map(item);
  } else if (typeof item === 'function' && !item.hasOwnProperty('toString')) {
    return '__system_lambda__';
  } else {
    return item;
  }
};

module.exports = display;
module.exports.map = map;
module.exports.list = list;
module.exports.lambda = lambda;
