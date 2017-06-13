'use strict';

const Config = require('../../config');
const _ = require('lodash');
const Log = require('../../constants').log;
const PluginDefaultConf = require('../../constants').plugin;
const InvalidPluginPattern = new RegExp(PluginDefaultConf.patterns.join('|'));

/**
 * @constructor
 * @desc loader类型boi插件构造函数
 * @param {string} pattern - 插件工作模式
 * @param {object} options - 插件配置项
 */
module.exports = function () {
  // 插件类型
  this.type = 'loader';
  const Arguments = [...arguments];
  if (!Arguments || Arguments.length === 0) {
    Log.error('Invalid boi plugin!');
    process.exit(1);
  }
  // 以下入参合法
  // 1. 同时指定pattern和options，并且pattern合法，options是object
  // 2. 只指定一个参数，那么这个参数作为options使用，type是object
  if (Arguments.length === 1 && _.isPlainObject(Arguments[0])) {
    this.pattern = 'external';
    this.options = Arguments[0];
  } else if (Arguments.length >= 2 && _.isString(Arguments[0]) &&
    InvalidPluginPattern.test(Arguments[0]) && _.isPlainObject(Arguments[1])) {
    this.pattern = Arguments[0];
    this.options = Arguments[1];
  } else {
    Log.error('Invalid boi plugin!');
    process.exit(1);
  }

  // 执行config API生成具体配置项
  Config.specPluginLoader(this.pattern, this.options);
};
