const lambda = (arg_names, func) => `(lambda ${display(arg_names)} ${display(func)})`;

const map = (map) => {
  let array = [];
  Object.keys(map).forEach(key => {
    array.push(display([key, map[key]]));
  });
  return `(map ${array.join(' ')})`;
};

const list = (list) => `(list ${list.join(' ')})`;

const display = (item) => {
  if (Array.isArray(item)) {
    return `(${item.map(child => display(child)).join(' ')})`;
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
