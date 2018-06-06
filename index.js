const readline = require('readline');
const run = require('./compiler').run;
const display = require('./compiler').display;
const chalk = require('chalk');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'lisp.js> '
});

const log = (result) => {
  console.log(chalk.green(display(result))); // eslint-disable-line no-console
};

const err = (message) =>
  console.error(chalk.red(message)); // eslint-disable-line no-console


rl.prompt();

rl.on('line', line => {
  try {
    log(run(line));
  } catch (e) {
    err(e.message);
  }
  rl.prompt();
});
rl.on('close', () => {
  process.exit(0);
});
