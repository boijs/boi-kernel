'use strict';

const Ora    = require('ora');
const Chalk = require('chalk');

let info = (msg)=>{
  console.log(Chalk.cyan.bold('==> '+msg));
};

let succeed = (msg) => {
  Ora().succeed(Chalk.cyan.bold(msg));
};

let error = (msg)=>{
  Ora().fail(Chalk.red.bold(msg));
};

let warn = (msg)=>{
  Ora().warn(Chalk.yellow.bold(msg));
};

module.exports = {
  info,
  error,
  warn,
  succeed
};
