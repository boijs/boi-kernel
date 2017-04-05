'use strict';

const Ora = require('ora');
const Chalk = require('chalk');

function info(msg) {
  console.log(Chalk.cyan.bold('==> ' + msg));
}

function succeed(msg) {
  Ora().succeed(Chalk.cyan.bold(msg));
}

function error(msg) {
  Ora().fail(Chalk.red.bold(msg));
}

function warn(msg) {
  Ora().warn(Chalk.yellow.bold(msg));
}

module.exports = {
  info,
  error,
  warn,
  succeed
};
