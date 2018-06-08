const { eval_args, list_args } = require('./_helpers');

module.exports = {
  'concat': eval_args(list_args((a, b) => a.concat(...b))),
  '+': eval_args((...args) => args.reduce((a, b) => a + b, 0)),
  '-': eval_args((...args) => args.reduce((a, b) => a - b, 0)),
  '*': eval_args((...args) => args.reduce((a, b) => a * b, 1)),
  '/': eval_args((...args) => args.reduce((a, b) => a / b, 1)),
  '>': eval_args((a, b) => a > b),
  '>=': eval_args((a, b) => a >= b),
  '<': eval_args((a, b) => a < b),
  '<=': eval_args((a, b) => a <= b),
  '=': eval_args((a, b) => a === b),
  '!=': eval_args((a, b) => a !== b),
};
