const fs = require('fs');
const core = require('interpreter/core');
const environment = require('interpreter/environment');
const display = require('interpreter/environment/definitions/types/display');

const system_commands = {
  'import': (_, file) => interpreter.interpret(fs.readFileSync(file).toString()),
};

let global_env = environment(system_commands);

const interpreter = {
  interpret: (string) => core(global_env, string),
  display: (obj) => display(obj),
  reset: () => global_env = environment(system_commands),
};

module.exports = interpreter;
