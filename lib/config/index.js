'use strict'

require('shelljs/global');

let path = require('path');
let fs = require('fs');
let chalk = require('chalk');
let Promise = require('bluebird');
let _ = require('lodash');
let webpack = require('webpack');
let checkModules = require('../../../boi-plugin-aux-autoinstall');
let genConfig = require('./genConfig/index.js');

// 默认配置项
const CONFIG = require('../constants').config;
const PLUGIN = require('../constants').plugin;
const ENVS = require('../constants').env;

// 合法的env值
const REG_VALID_ENV = new RegExp('^(' + _.values(ENVS).join('|') + ')$');

// 可配置项
const AVAILABLE_CONFIG_PATTERNS = CONFIG.patterns;
const DEFAULT_CONFIG = CONFIG.config;

// 插件可配置项
const AVAILABLE_PLUGIN_PATTERNS = PLUGIN.available_patterns;


// 判断是否是可用的配置项
function isValidPattern(pattern, legalPatterns) {
  return legalPatterns.indexOf(pattern) !== -1;
}

// boi configuration
let boiConfig = Object.assign({}, DEFAULT_CONFIG);
// webpack configuration
let webpackConfig = null;

// api集合
let api = {};

let depInstalled = false;

/**
 * 统一配置入口
 * @param {object} conf - 配置项
 */
api.all = function(conf) {
  if (!conf || !_.isPlainObject(conf)) {
    return;
  }
  boiConfig = Object.assign(boiConfig, conf);
};
/**
 * 独立配置项API，递增覆盖
 * @param {string} pattern - 配置模块
 * @param {object} options - 配置项
 */
api.spec = function(pattern, options) {
  if (!pattern || !_.isString(pattern) || !isValidPattern(pattern, AVAILABLE_CONFIG_PATTERNS) || !options ||
    !_.isPlainObject(options)) {
    console.log(chalk.red('Invalid configuration!'));
    return;
  }

  let _options = null;
  let _env = process.env.BOI_ENV;

  // 判断env是否合法
  if (REG_VALID_ENV.test(_env)) {
    let _keys = Object.keys(options);
    _keys.map(function(key) {
      // 区分配置项是特定env生效还是共用
      if (key === _env) {
        _options = Object.assign({}, _options, options[key]);
      } else if (!REG_VALID_ENV.test(key)) {
        _options = Object.assign({}, _options, {
          [key]: options[key]
        });
      }
    });
  }
  // 覆盖同名配置项
  let __conf = {};
  __conf[pattern] = Object.assign({}, boiConfig[pattern], _options);
  boiConfig = Object.assign({}, boiConfig, __conf);
};
/**
 * 提供给boi自定义loader类型插件使用的配置项API
 * @param {string} mode - 插件工作模式
 * @param {object} options - loader配置项
 */
api.specPluginLoader = function(pattern, options) {
  if (!pattern || !_.isString(pattern) || !isValidPattern(pattern, AVAILABLE_PLUGIN_PATTERNS) || !options ||
    !_.isPlainObject(options)) {
    console.log(chalk.red('Invalid plugin!'));
    return;
  }
  if (!boiConfig.extraLoaders) {
    boiConfig.extraLoaders = [];
  }
  if (!boiConfig.pluginPatterns) {
    boiConfig.pluginPatterns = [];
  }
  boiConfig.pluginPatterns.push(pattern);
  boiConfig.extraLoaders.push(options);
}

/**
 * @todo 联合配置项API，清空原有配置项，并用新配置项替代
 * @param {Array} srcPatterns - 原有的配置模块数组，此数组中的模块配置项将被完全清空
 * @param {Array} targetPattern - 新配置模块
 * @param {Object} options - 新模块配置项
 */
api.combine = function(srcPatterns, targetPattern, options) {
  if (!srcPatterns || !_.isArray(srcPatterns) || !targetPattern || !_.isString(targetPattern) || !options ||
    !_.isPlainObject(
      options)) {
    console.log(chalk.red('Invalid configuration!'));
    return;
  }
  srcPatterns.forEach(function(pattern) {
    if (isValidPattern(pattern)) {
      // 同名配置模块被清空
      boiConfig[pattern] = null;
    }
  });
};

api.directWP = function(options) {
  webpackConfig = options || null;
};

/**
 * 生成webpack配置文件并执行webpack任务
 */
api.runBuild = function() {
  let _config = genConfig(boiConfig);

  checkModules({
    modules: _config.dependencies,
    autoCheck: boiConfig.basic.checkModulesBeforebuild
  });

  webpackConfig = _config.wp;

  webpack(webpackConfig).run(function(err, stat) {
    if (err) {
      throw err;
    }
    let statJson = stat.toJson();
    if (statJson.errors.length !== 0) {
      throw new Error(statJson.errors);
    }
    // log构建结果
    process.stdout.write(stat.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n');
    console.log(chalk.cyan.bold("==> Build successfully!"));
    process.exit();
  });
};
/**
 * 生成dev环境的webpack配置项
 */
api.genDevConfig = function() {
  return webpackConfig || genConfig(boiConfig, 'dev').wp;
};
/**
 * 获取boiConfig
 */
api.getBoiConfig = function() {
  return boiConfig;
};

/**
 * @module boi/config
 */
module.exports = api;
