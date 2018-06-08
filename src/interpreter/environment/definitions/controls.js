const evaluate = require('interpreter/core/evaluate');

module.exports = {
  'begin': (env, ...exps) => exps.map((exp) => evaluate(env, exp))[exps.length - 1],
  'if': (local_env, condition, ifTrue, ifFalse) =>
    evaluate(local_env, condition)
      ? evaluate(local_env, ifTrue)
      : evaluate(local_env, ifFalse),
};
