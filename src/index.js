const readline = require('readline');
const interpret = require('./interpreter').interpret;
const display = require('./interpreter').display;
const chalk = require('chalk');
const fs = require('fs');

const log = (result) => {
  console.log(chalk.green(display(result))); // eslint-disable-line no-console
};

const err = (message) =>
  console.error(chalk.red(message)); // eslint-disable-line no-console

if (process.argv.length === 2) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'lisp.js> '
  });

  rl.prompt();

  rl.on('line', line => {
    try {
      log(interpret(line));
    } catch (e) {
      err(e.message);
    }
    rl.prompt();
  });
  rl.on('close', () => {
    process.exit(0);
  });
} else {
  fs.readFile(process.argv[2], function (error, data) {
    if (error) {
      err(error);
    } else {
      try {
        log(interpret(data.toString()));
      } catch (e) {
        err(e.message);
      }
    }
  });
}
