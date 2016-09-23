'use strict';

let chalk = require('chalk');

let info = (msg)=>{
  console.log(chalk.cyan.bold('==> '+msg));
};

let error = (msg)=>{
  console.log(chalk.red(msg));
};

let warn = (msg)=>{
  console.log(chalk.yellow(msg));
};

module.exports = {
  info,
  error,
  warn
};
